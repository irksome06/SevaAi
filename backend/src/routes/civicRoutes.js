const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { resolveCivicRouting } = require('../controllers/civicController');

const router = express.Router();
router.use(protect);
router.post('/official-routing', resolveCivicRouting);

module.exports = router;
