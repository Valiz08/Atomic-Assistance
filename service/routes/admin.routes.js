const express = require('express');
const router = express.Router();
const { getClients, createClient, updateClient, deleteClient } = require('../controllers/admin.controller');

router.get('/admin/clients', getClients);
router.post('/admin/clients', createClient);
router.patch('/admin/clients/:clientId', updateClient);
router.delete('/admin/clients/:clientId', deleteClient);

module.exports = router;
