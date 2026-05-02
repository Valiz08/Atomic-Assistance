const User = require('../models/user');
const { v4: uuidv4 } = require('uuid');

const DEFAULT_HOURS = [
  { day: 1, enabled: true, open: 8, close: 19 },
  { day: 2, enabled: true, open: 8, close: 19 },
  { day: 3, enabled: true, open: 8, close: 19 },
  { day: 4, enabled: true, open: 8, close: 19 },
  { day: 5, enabled: true, open: 8, close: 19 },
  { day: 6, enabled: true, open: 8, close: 14 },
  { day: 0, enabled: false, open: 8, close: 14 },
];

exports.getWorkers = async (req, res, next) => {
  const { userId } = req.params;
  try {
    const user = await User.findOne({ id: userId });
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.status(200).json(user.workers || []);
  } catch (error) {
    next(error);
  }
};

exports.addWorker = async (req, res, next) => {
  const { userId } = req.params;
  const { name } = req.body;
  if (!name?.trim()) return res.status(400).json({ message: 'Nombre requerido' });
  try {
    const worker = { id: uuidv4(), name: name.trim() };
    await User.findOneAndUpdate({ id: userId }, { $push: { workers: worker } });
    res.status(201).json(worker);
  } catch (error) {
    next(error);
  }
};

exports.removeWorker = async (req, res, next) => {
  const { userId, workerId } = req.params;
  try {
    await User.findOneAndUpdate({ id: userId }, { $pull: { workers: { id: workerId } } });
    res.status(200).json({ message: 'Trabajador eliminado' });
  } catch (error) {
    next(error);
  }
};

exports.getBusinessHours = async (req, res, next) => {
  const { userId } = req.params;
  try {
    const user = await User.findOne({ id: userId });
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.status(200).json(user.businessHours?.length ? user.businessHours : DEFAULT_HOURS);
  } catch (error) {
    next(error);
  }
};

exports.saveBusinessHours = async (req, res, next) => {
  const { userId } = req.params;
  const { hours } = req.body;
  try {
    await User.findOneAndUpdate({ id: userId }, { businessHours: hours });
    res.status(200).json({ message: 'Horario guardado' });
  } catch (error) {
    next(error);
  }
};
