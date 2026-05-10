const express = require('express');
const multer = require('multer');
const router = express.Router();
const { login, ask, uploadFile, deletePdf, toggleIA, sendMessage, getUser, getPdf } = require('../controllers/user.controller');

const upload = multer();

router.get('/user/:userId', getUser);
router.get('/user/:userId/pdf/:pdfId', getPdf);
router.delete('/user/:userId/pdf/:pdfId', deletePdf);
router.post('/login', login);
router.post('/ask', ask);
router.post('/uploadFile', upload.single('archivo'), uploadFile);
router.post('/toggleIA', toggleIA);
router.post('/sendMessage', sendMessage);

module.exports = router;
