const express = require('express');
const router = express.Router();
const { getRecords, getRecord, addMessage } = require('../controllers/record.controller');

router.get('/records/:userId', getRecords);
router.get('/record/:userId/:clientId', getRecord);
router.post('/record/message', addMessage);

module.exports = router;
