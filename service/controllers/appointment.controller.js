const Appointment = require('../models/appointment');

exports.getAppointments = async (req, res, next) => {
  const { userId } = req.params;
  const { start, end } = req.query;
  try {
    const query = { userId };
    if (start && end) query.date = { $gte: new Date(start), $lte: new Date(end) };
    const appointments = await Appointment.find(query).sort({ date: 1 });
    res.status(200).json(appointments);
  } catch (error) {
    next(error);
  }
};

exports.createAppointment = async (req, res, next) => {
  const { userId, clientName, clientPhone, service, date, duration, notes, workerId, workerName } = req.body;
  try {
    const appt = new Appointment({
      userId, clientName, clientPhone, service,
      date: new Date(date), duration, notes,
      workerId: workerId || null,
      workerName: workerName || null,
    });
    await appt.save();
    res.status(201).json(appt);
  } catch (error) {
    next(error);
  }
};

exports.updateAppointment = async (req, res, next) => {
  const { id } = req.params;
  try {
    const appt = await Appointment.findByIdAndUpdate(id, req.body, { new: true });
    if (!appt) return res.status(404).json({ message: 'Cita no encontrada' });
    res.status(200).json(appt);
  } catch (error) {
    next(error);
  }
};

exports.deleteAppointment = async (req, res, next) => {
  const { id } = req.params;
  try {
    await Appointment.findByIdAndDelete(id);
    res.status(200).json({ message: 'Cita eliminada' });
  } catch (error) {
    next(error);
  }
};
