const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/user');

const isSuperroot = async (req, res) => {
  const requesterId = req.headers['requesterid'];
  const requester = await User.findOne({ id: requesterId });
  if (!requester || requester.role !== 'superroot') {
    res.status(403).json({ message: 'Acceso denegado' });
    return false;
  }
  return true;
};

exports.getClients = async (req, res, next) => {
  try {
    if (!await isSuperroot(req, res)) return;
    const clients = await User.find({ role: { $ne: 'superroot' } })
      .select('id user businessType businessName createdAt')
      .lean();
    res.status(200).json(clients);
  } catch (error) {
    next(error);
  }
};

exports.createClient = async (req, res, next) => {
  try {
    if (!await isSuperroot(req, res)) return;
    const { username, password, businessType, businessName } = req.body;
    if (!username || !password || !businessType) {
      return res.status(400).json({ message: 'Usuario, contraseña y tipo de negocio son obligatorios' });
    }
    const existing = await User.findOne({ user: username });
    if (existing) return res.status(409).json({ message: 'Ese nombre de usuario ya existe' });

    const hash = await bcrypt.hash(password, 10);
    const client = await new User({
      id: uuidv4(),
      user: username,
      pass: hash,
      role: 'user',
      businessType,
      businessName: businessName?.trim() || '',
      ia: true,
    }).save();

    res.status(201).json({
      id: client.id,
      user: client.user,
      businessType: client.businessType,
      businessName: client.businessName,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateClient = async (req, res, next) => {
  try {
    if (!await isSuperroot(req, res)) return;
    const { clientId } = req.params;
    const { businessType, businessName, password } = req.body;
    const update = {};
    if (businessType) update.businessType = businessType;
    if (businessName !== undefined) update.businessName = businessName;
    if (password) update.pass = await bcrypt.hash(password, 10);
    const updated = await User.findOneAndUpdate(
      { id: clientId, role: { $ne: 'superroot' } },
      { $set: update },
      { new: true }
    ).select('id user businessType businessName');
    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

exports.deleteClient = async (req, res, next) => {
  try {
    if (!await isSuperroot(req, res)) return;
    const { clientId } = req.params;
    await User.findOneAndDelete({ id: clientId, role: { $ne: 'superroot' } });
    res.status(200).json({ message: 'Cliente eliminado' });
  } catch (error) {
    next(error);
  }
};
