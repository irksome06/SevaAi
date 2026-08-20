const express = require('express');
const { chat } = require('../controllers/aiController');

const router = express.Router();

// Kept public so citizens can ask service questions before registering.
// Add the auth `protect` middleware here if chat must be account-only.
router.post('/chat', chat);

module.exports = router;
