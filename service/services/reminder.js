const axios = require('axios');
const Appointment = require('../models/appointment');
const User = require('../models/user');

const DAY_ES = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

// Normaliza teléfonos españoles al formato que espera WhatsApp (ej: "34612345678")
function normalizePhone(phone) {
  if (!phone) return null;
  let n = phone.replace(/[\s\-\.\(\)]/g, '');
  if (n.startsWith('+')) n = n.slice(1);
  if (/^[6-9]\d{8}$/.test(n)) n = '34' + n; // número ES sin prefijo
  return n;
}

function buildMessage(appt) {
  const d = new Date(appt.date);
  const time = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  const day = DAY_ES[d.getDay()];
  const worker = appt.workerName ? ` con ${appt.workerName}` : '';
  return (
    `Hola ${appt.clientName}! 👋 Te recordamos que mañana ${day} tienes una cita${worker} en el taller a las ${time} para: *${appt.service}*.\n\n` +
    `Si necesitas cancelar o cambiar la hora, responde a este mensaje. ¡Hasta mañana! 🔧`
  );
}

async function sendReminders() {
  try {
    const now = new Date();
    // Ventana: citas entre 23h y 25h desde ahora (margen de 2h para tolerar reinicios del servidor)
    const from = new Date(now.getTime() + 23 * 60 * 60 * 1000);
    const to   = new Date(now.getTime() + 25 * 60 * 60 * 1000);

    const upcoming = await Appointment.find({
      date: { $gte: from, $lte: to },
      status: { $ne: 'cancelled' },
      reminderSent: { $ne: true },
      clientPhone: { $exists: true, $ne: '' },
    });

    if (upcoming.length === 0) return;
    console.log(`[Recordatorios] ${upcoming.length} cita(s) en las próximas 24h.`);

    // Agrupar por userId para cargar cada negocio solo una vez
    const userCache = {};
    const getUser = async (userId) => {
      if (!userCache[userId]) userCache[userId] = await User.findOne({ id: userId });
      return userCache[userId];
    };

    for (const appt of upcoming) {
      try {
        const user = await getUser(appt.userId);
        if (!user?.whatsappToken || !user?.whatsappPhoneNumberId) continue;

        const phone = normalizePhone(appt.clientPhone);
        if (!phone) continue;

        await axios.post(
          `https://graph.facebook.com/v19.0/${user.whatsappPhoneNumberId}/messages`,
          {
            messaging_product: 'whatsapp',
            to: phone,
            type: 'text',
            text: { body: buildMessage(appt) },
          },
          { headers: { Authorization: `Bearer ${user.whatsappToken}`, 'Content-Type': 'application/json' } }
        );

        await Appointment.findByIdAndUpdate(appt._id, { reminderSent: true });
        console.log(`[Recordatorio enviado] ${appt.clientName} — ${appt.date}`);
      } catch (err) {
        console.error(`[Recordatorio fallido] ${appt._id}:`, err.message);
      }
    }
  } catch (err) {
    console.error('[Recordatorios] Error general:', err.message);
  }
}

module.exports = { sendReminders };
