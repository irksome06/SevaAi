const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { listTrackingRecords, getTrackingRecord, createTracking, changeTrackingStatus, getTrackingSummary } = require('../controllers/trackingController');

const router = express.Router();
router.use(protect);
router.get('/summary', getTrackingSummary);
router.route('/').get(listTrackingRecords).post(createTracking);
router.get('/:trackingId', getTrackingRecord);
router.patch('/:trackingId/status', changeTrackingStatus);

module.exports = router;
