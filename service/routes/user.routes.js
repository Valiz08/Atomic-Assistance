const express = require('express');
const multer = require('multer');
const router = express.Router();
const { login, ask, uploadFile, toggleIA, sendMessage, getUser, getPdf } = require('../controllers/user.controller');

const upload = multer();

router.get('/user/:userId', getUser);
router.get('/user/:userId/pdf', getPdf);
router.post('/login', login);
router.post('/ask', ask);
router.post('/uploadFile', upload.single('archivo'), uploadFile);
router.post('/toggleIA', toggleIA);
router.post('/sendMessage', sendMessage);

module.exports = router;
