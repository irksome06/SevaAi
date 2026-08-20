const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { listEntries, getFacets, getEntry } = require('../controllers/quickAccessController');
const router = express.Router();
router.use(protect);
router.get('/filters', getFacets);
router.get('/', listEntries);
router.get('/:id', getEntry);
module.exports = router;
