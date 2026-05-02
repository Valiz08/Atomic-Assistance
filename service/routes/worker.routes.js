const express = require('express');
const router = express.Router();
const { getWorkers, addWorker, removeWorker, getBusinessHours, saveBusinessHours } = require('../controllers/worker.controller');

router.get('/workers/:userId', getWorkers);
router.post('/workers/:userId', addWorker);
router.delete('/workers/:userId/:workerId', removeWorker);
router.get('/business-hours/:userId', getBusinessHours);
router.post('/business-hours/:userId', saveBusinessHours);

module.exports = router;
