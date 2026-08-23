const express = require('express');
const router = express.Router();
const { getFlashNews } = require('../controllers/newsController');

// Public News & Circulars Endpoints
router.get('/', getFlashNews);

module.exports = router;
