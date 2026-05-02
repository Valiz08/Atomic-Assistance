const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  clientName: { type: String, required: true },
  clientPhone: { type: String, default: '' },
  service: { type: String, default: 'Revisión general' },
  date: { type: Date, required: true },
  duration: { type: Number, default: 60 }, // minutes
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
  notes: { type: String, default: '' },
  source: { type: String, enum: ['manual', 'whatsapp'], default: 'manual' },
  workerId: { type: String, default: null },
  workerName: { type: String, default: null },
  reminderSent: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Appointment', AppointmentSchema, 'appointments');
