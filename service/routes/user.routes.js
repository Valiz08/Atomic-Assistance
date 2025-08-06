const express = require('express');
const multer = require('multer');
const router = express.Router();
const { login, ask, uploadFile } = require('../controllers/user.controller');

const upload = multer();

router.post('/login', login);
router.post('/ask', ask)
router.post('/uploadFile', upload.single('archivo'), uploadFile)

module.exports = router;