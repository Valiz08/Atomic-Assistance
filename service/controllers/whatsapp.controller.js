const User = require('../models/user');
const Record = require('../models/record');
const Conversation = require('../models/conversation');
const axios = require('axios');

const DAY_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTH_ES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const DEFAULT_HOURS = [
  { day: 1, enabled: true, open: 8, close: 19 },
  { day: 2, enabled: true, open: 8, close: 19 },
  { day: 3, enabled: true, open: 8, close: 19 },
  { day: 4, enabled: true, open: 8, close: 19 },
  { day: 5, enabled: true, open: 8, close: 19 },
  { day: 6, enabled: true, open: 8, close: 14 },
  { day: 0, enabled: false, open: 8, close: 14 },
];

// GET /api/webhook/:userId — verificación de Meta
exports.verifyWebhook = async (req, res) => {
  const { userId } = req.params;
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  try {
    const user = await User.findOne({ id: userId });
    if (!user) return res.sendStatus(404);
    if (mode === 'subscribe' && token === user.whatsappVerifyToken) {
      return res.status(200).send(challenge);
    }
    res.sendStatus(403);
  } catch (error) {
    res.sendStatus(500);
  }
};

// POST /api/webhook/:userId — recibe mensajes de WhatsApp
exports.receiveMessage = async (req, res) => {
  const { userId } = req.params;
  res.sendStatus(200);

  try {
    const entry = req.body?.entry?.[0];
    const change = entry?.changes?.[0];
    const message = change?.value?.messages?.[0];
    const contactMeta = change?.value?.contacts?.[0];
    if (!message || message.type !== 'text') return;

    const from = message.from;
    const text = message.text.body;
    const contactName = contactMeta?.profile?.name || from;

    const user = await User.findOne({ id: userId });
    if (!user?.whatsappToken || !user?.whatsappPhoneNumberId) return;

    // Crear o actualizar contacto
    await Conversation.findOneAndUpdate(
      { id: from },
      { id: from, number: from, name: contactName },
      { upsert: true }
    );

    // Guardar mensaje entrante
    await Record.findOneAndUpdate(
      { userId: from, clientId: userId },
      {
        $set: { userId: from, clientId: userId, updateDate: new Date() },
        $push: { messages: { from: 'user', text } }
      },
      { upsert: true }
    );

    const io = req.app.get('io');
    if (io) io.to(userId).emit('receive_message', { from, message: text });

    if (user.ia !== false) {
      const { reply, appointment } = await generateReply(userId, from, text, contactName, user);
      if (reply) {
        await sendWhatsAppMessage(user.whatsappPhoneNumberId, user.whatsappToken, from, reply);
        await Record.findOneAndUpdate(
          { userId: from, clientId: userId },
          {
            $set: { updateDate: new Date() },
            $push: { messages: { from: 'assistant', text: reply } }
          }
        );
        if (io) {
          io.to(userId).emit('ia_reply', { to: from, message: reply });
          if (appointment) io.to(userId).emit('appointment_created', appointment);
        }
      }
    }
  } catch (error) {
    console.error('Webhook error:', error.message);
  }
};

async function sendWhatsAppMessage(phoneNumberId, token, to, text) {
  await axios.post(
    `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`,
    {
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: text }
    },
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
  );
}

// Calcula huecos libres respetando el horario del negocio
async function getAvailableSlots(userId, workers) {
  const Appointment = require('../models/appointment');

  const user = await User.findOne({ id: userId });
  const schedule = user?.businessHours?.length ? user.businessHours : DEFAULT_HOURS;

  const now = new Date();
  const endDate = new Date(now);
  endDate.setDate(endDate.getDate() + 7);

  const booked = await Appointment.find({
    userId,
    date: { $gte: now, $lte: endDate },
    status: { $ne: 'cancelled' }
  }).lean();

  const effectiveWorkers = workers.length > 0 ? workers : [{ id: 'default', name: 'General' }];
  const result = {};

  for (let offset = 0; offset <= 7; offset++) {
    const d = new Date(now);
    d.setDate(d.getDate() + offset);
    d.setHours(0, 0, 0, 0);

    const daySchedule = schedule.find(s => s.day === d.getDay());
    if (!daySchedule?.enabled) continue;

    const workHours = [];
    for (let h = daySchedule.open; h < daySchedule.close; h++) workHours.push(h);

    const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    result[dateKey] = {};

    for (const worker of effectiveWorkers) {
      result[dateKey][worker.name] = {
        id: worker.id,
        hours: workHours.filter(hour => {
          const slot = new Date(d);
          slot.setHours(hour, 0, 0, 0);
          if (slot <= now) return false;
          return !booked.some(appt => {
            const aDate = new Date(appt.date);
            return (
              aDate.getFullYear() === d.getFullYear() &&
              aDate.getMonth() === d.getMonth() &&
              aDate.getDate() === d.getDate() &&
              aDate.getHours() === hour &&
              (worker.id === 'default' || appt.workerId === worker.id)
            );
          });
        })
      };
    }
  }

  return result;
}

function formatSlotsForAI(slots) {
  return Object.entries(slots).map(([dateStr, workerSlots]) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    const dayLabel = `${DAY_ES[d.getDay()]} ${d.getDate()} ${MONTH_ES[d.getMonth()]}`;
    const lines = Object.entries(workerSlots).map(([workerName, data]) =>
      data.hours.length === 0
        ? `  ${workerName}: completo`
        : `  ${workerName} (id:${data.id}): ${data.hours.map(h => `${h}:00`).join(', ')}`
    ).join('\n');
    return `${dayLabel}:\n${lines}`;
  }).join('\n');
}

async function generateReply(clientId, contactId, text, contactName, user) {
  const { default: OpenAI } = require('openai');
  const Chunk = require('../models/chuncks');
  const Appointment = require('../models/appointment');
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const workers = user?.workers || [];

  // System prompt base
  let systemPrompt = 'Eres el asistente virtual de un taller mecánico. Respondes mensajes de WhatsApp de forma amable, breve y clara.';

  // Huecos disponibles
  try {
    const slots = await getAvailableSlots(clientId, workers);
    const slotsText = formatSlotsForAI(slots);

    if (workers.length > 0) {
      systemPrompt += `\n\nMecánicos del taller: ${workers.map(w => w.name).join(', ')}.`;
    }

    systemPrompt += `\n\nHuecos disponibles (próximos 7 días):\n${slotsText || 'Sin huecos disponibles esta semana.'}`;
    systemPrompt += `

Cuando el cliente confirme un hueco concreto (mecánico + día + hora), responde confirmando la cita y añade en una línea separada al final:
[RESERVA: nombreMecanico|workerId|YYYY-MM-DD|HH:00]
Ejemplo: [RESERVA: Pedro|abc-123|2026-05-06|09:00]
Si no hay mecánicos configurados usa workerId "default" y nombre "General".
No incluyas el marcador [RESERVA:...] si el cliente NO ha confirmado todavía un hueco específico.`;
  } catch (e) {
    console.error('Error fetching slots:', e.message);
  }

  // Contexto del PDF
  try {
    const embedding = await openai.embeddings.create({ model: 'text-embedding-3-small', input: text });
    const vector = embedding.data[0].embedding;
    const chunks = await Chunk.find({ userId: clientId }).lean();
    if (chunks.length > 0) {
      const scored = chunks
        .map(c => ({ text: c.text, score: cosineSimilarity(vector, c.embedding) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);
      systemPrompt += '\n\nInformación del negocio:\n' + scored.map(c => c.text).join('\n---\n');
    }
  } catch (_) {}

  // Historial de conversación
  const record = await Record.findOne({ userId: contactId, clientId });
  const history = (record?.messages || []).slice(-10).map(m => ({
    role: m.from === 'user' ? 'user' : 'assistant',
    content: m.text
  }));

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      ...history,
      { role: 'user', content: text }
    ]
  });

  let reply = response.choices[0]?.message?.content || null;
  let createdAppointment = null;

  // Detectar confirmación de reserva
  if (reply) {
    const match = reply.match(/\[RESERVA:\s*([^|]+)\|([^|]+)\|([^|]+)\|([^\]]+)\]/);
    if (match) {
      const [, workerName, workerId, dateStr, timeStr] = match;
      try {
        const [year, month, day] = dateStr.trim().split('-').map(Number);
        const hour = parseInt(timeStr.trim().split(':')[0], 10);
        const apptDate = new Date(year, month - 1, day, hour, 0, 0);
        const isDefault = workerId.trim() === 'default';

        createdAppointment = await new Appointment({
          userId: clientId,
          clientName: contactName || contactId,
          clientPhone: contactId,
          service: 'Reserva WhatsApp',
          date: apptDate,
          duration: 60,
          status: 'confirmed',
          workerId: isDefault ? null : workerId.trim(),
          workerName: isDefault ? null : workerName.trim(),
          source: 'whatsapp'
        }).save();
      } catch (e) {
        console.error('Error creating appointment from WhatsApp:', e.message);
      }
      // Eliminar marcador del mensaje al cliente
      reply = reply.replace(/\[RESERVA:[^\]]+\]/, '').trim();
    }
  }

  return { reply, appointment: createdAppointment };
}

function cosineSimilarity(a, b) {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dot / (magA * magB);
}

// GET /api/whatsapp-config/:userId
exports.getConfig = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findOne({ id: userId });
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.status(200).json({
      phoneNumberId: user.whatsappPhoneNumberId || '',
      hasToken: !!user.whatsappToken,
      verifyToken: user.whatsappVerifyToken || ''
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/whatsapp-config/:userId
exports.saveConfig = async (req, res) => {
  const { userId } = req.params;
  const { phoneNumberId, token, verifyToken } = req.body;
  try {
    await User.findOneAndUpdate(
      { id: userId },
      { whatsappPhoneNumberId: phoneNumberId, whatsappToken: token, whatsappVerifyToken: verifyToken }
    );
    res.status(200).json({ message: 'Credenciales guardadas correctamente' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
