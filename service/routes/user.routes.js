const express = require('express');
const router = express.Router();
const { login, ask, uploadFile } = require('../controllers/user.controller');

router.post('/login', login);
router.post('/ask', ask)
router.post('/uploadFile', uploadFile)

module.exports = router;