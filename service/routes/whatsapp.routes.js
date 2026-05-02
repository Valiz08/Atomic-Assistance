const express = require('express');
const router = express.Router();
const { verifyWebhook, receiveMessage, getConfig, saveConfig } = require('../controllers/whatsapp.controller');

router.get('/webhook/:userId', verifyWebhook);
router.post('/webhook/:userId', receiveMessage);
router.get('/whatsapp-config/:userId', getConfig);
router.post('/whatsapp-config/:userId', saveConfig);

module.exports = router;
