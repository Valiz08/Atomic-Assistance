const Record = require('../models/record');
const Conversation = require('../models/conversation');
const User = require('../models/user');
const axios = require('axios');

exports.getRecords = async (req, res, next) => {
  const { userId } = req.params;
  try {
    const records = await Record.find({ clientId: userId }).sort({ updateDate: -1 });
    const enriched = await Promise.all(records.map(async (record) => {
      const contact = await Conversation.findOne({ id: record.userId }).lean();
      const obj = record.toObject();
      obj.clientName = contact?.name || null;
      obj.clientPhone = (contact?.number && contact.number !== '') ? contact.number : (contact?.name || null);
      return obj;
    }));
    res.status(200).json(enriched);
  } catch (error) {
    next(error);
  }
};

exports.getRecord = async (req, res, next) => {
  const { userId, clientId } = req.params;
  try {
    const record = await Record.findOne({ clientId: userId, userId: clientId });
    if (!record) return res.status(404).json({ message: 'Record no encontrado' });
    const contact = await Conversation.findOne({ id: record.userId }).lean();
    const obj = record.toObject();
    obj.clientName = contact?.name || null;
    obj.clientPhone = (contact?.number && contact.number !== '') ? contact.number : (contact?.name || null);
    res.status(200).json(obj);
  } catch (error) {
    next(error);
  }
};

exports.addMessage = async (req, res, next) => {
  const { userId, clientId, message } = req.body;
  try {
    const record = await Record.findOneAndUpdate(
      { clientId: userId, userId: clientId },
      {
        $push: { messages: { from: 'operator', text: message } },
        $set: { updateDate: new Date() }
      },
      { new: true }
    );
    if (!record) return res.status(404).json({ message: 'Record no encontrado' });

    // Enviar por WhatsApp si el negocio tiene credenciales configuradas
    try {
      const user = await User.findOne({ id: userId });
      if (user?.whatsappToken && user?.whatsappPhoneNumberId) {
        await axios.post(
          `https://graph.facebook.com/v19.0/${user.whatsappPhoneNumberId}/messages`,
          {
            messaging_product: 'whatsapp',
            to: clientId, // número de teléfono del contacto
            type: 'text',
            text: { body: message }
          },
          { headers: { Authorization: `Bearer ${user.whatsappToken}`, 'Content-Type': 'application/json' } }
        );
      }
    } catch (wpErr) {
      console.error('WhatsApp send error (non-critical):', wpErr.message);
    }

    res.status(200).json(record);
  } catch (error) {
    next(error);
  }
};
