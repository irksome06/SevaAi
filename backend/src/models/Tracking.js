const mongoose = require('mongoose');

const TRACKING_TYPES = [
  'civic_report',
  'scheme_application',
  'rti_application',
  'scholarship_application',
  'other',
];

const TRACKING_STATUSES = [
  'Draft', 'Submitted', 'Received', 'Under Review', 'Assigned', 'In Progress',
  'Action Taken', 'Approved', 'Rejected', 'Resolved', 'Completed', 'Closed', 'Pending Action',
];

const timelineSchema = new mongoose.Schema({
  status: { type: String, required: true, enum: TRACKING_STATUSES },
  note: { type: String, required: true, trim: true, maxlength: 500 },
  actor: { type: String, trim: true, maxlength: 120, default: 'SevaAI' },
  occurredAt: { type: Date, default: Date.now },
}, { _id: true });

const trackingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  trackingId: { type: String, required: true, unique: true, trim: true, uppercase: true, index: true },
  type: { type: String, required: true, enum: TRACKING_TYPES, index: true },
  title: { type: String, required: true, trim: true, maxlength: 180 },
  category: { type: String, trim: true, maxlength: 100, default: 'General' },
  status: { type: String, required: true, enum: TRACKING_STATUSES, default: 'Draft', index: true },
  sourceModule: { type: String, required: true, trim: true, maxlength: 100 },
  referenceId: { type: String, trim: true, maxlength: 120 },
  timeline: { type: [timelineSchema], default: [] },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });

trackingSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Tracking', trackingSchema);
module.exports.TRACKING_TYPES = TRACKING_TYPES;
module.exports.TRACKING_STATUSES = TRACKING_STATUSES;
