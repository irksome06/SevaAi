const express = require('express');
const { getOfficialPortal } = require('../controllers/rtiController');

const router = express.Router();

router.get('/official-portal', getOfficialPortal);

module.exports = router;
