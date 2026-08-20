const Tracking = require('../models/Tracking');
const { TRACKING_TYPES, TRACKING_STATUSES } = require('../models/Tracking');
const { createTrackingRecord, updateTrackingStatus, seedUserTrackingRecords } = require('../services/trackingService');

const listTrackingRecords = async (req, res, next) => {
  try {
    await seedUserTrackingRecords(req.user._id);
    const { type, status, search } = req.query;
    const query = { userId: req.user._id };
    if (type) query.type = type;
    if (status) query.status = status;
    if (search?.trim()) {
      const expression = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      query.$or = [{ trackingId: expression }, { title: expression }];
    }
    const records = await Tracking.find(query).sort({ updatedAt: -1 });
    res.json({ success: true, records });
  } catch (error) { next(error); }
};

const getTrackingRecord = async (req, res, next) => {
  try {
    const record = await Tracking.findOne({ userId: req.user._id, trackingId: req.params.trackingId.toUpperCase() });
    if (!record) return res.status(404).json({ success: false, message: 'Tracking record not found.' });
    res.json({ success: true, record });
  } catch (error) { next(error); }
};

const createTracking = async (req, res, next) => {
  try {
    const { type, title, category, status, sourceModule, referenceId, metadata, initialNote } = req.body;
    if (!type || !title || !sourceModule) return res.status(400).json({ success: false, message: 'type, title, and sourceModule are required.' });
    if (!TRACKING_TYPES.includes(type)) return res.status(400).json({ success: false, message: 'Unsupported tracking type.' });
    if (status && !TRACKING_STATUSES.includes(status)) return res.status(400).json({ success: false, message: 'Unsupported tracking status.' });
    const record = await createTrackingRecord(req.user._id, { type, title, category, status, sourceModule, referenceId, metadata, initialNote, actor: 'Citizen' });
    res.status(201).json({ success: true, message: 'Tracking record created.', record });
  } catch (error) { next(error); }
};

const changeTrackingStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    if (!TRACKING_STATUSES.includes(status)) return res.status(400).json({ success: false, message: 'A valid status is required.' });
    const record = await Tracking.findOne({ userId: req.user._id, trackingId: req.params.trackingId.toUpperCase() });
    if (!record) return res.status(404).json({ success: false, message: 'Tracking record not found.' });
    await updateTrackingStatus(record, { status, note, actor: 'Citizen' });
    res.json({ success: true, message: 'Tracking status updated.', record });
  } catch (error) { next(error); }
};

const getTrackingSummary = async (req, res, next) => {
  try {
    await seedUserTrackingRecords(req.user._id);
    const records = await Tracking.find({ userId: req.user._id }).select('status');
    const completed = ['Action Taken', 'Approved', 'Resolved', 'Completed', 'Closed'];
    const pending = ['Draft', 'Rejected', 'Pending Action'];
    res.json({ success: true, summary: {
      total: records.length,
      active: records.filter(({ status }) => ['Received', 'Under Review', 'Assigned', 'In Progress'].includes(status)).length,
      completed: records.filter(({ status }) => completed.includes(status)).length,
      pendingAction: records.filter(({ status }) => pending.includes(status)).length,
    } });
  } catch (error) { next(error); }
};

module.exports = { listTrackingRecords, getTrackingRecord, createTracking, changeTrackingStatus, getTrackingSummary };
