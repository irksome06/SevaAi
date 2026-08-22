const mongoose = require('mongoose');

const QUICK_ACCESS_CATEGORIES = [
  'Emergency', 'Cyber Safety', 'Transport', 'Disaster Management',
  'Women & Child Support', 'Public Grievance', 'Government Office',
];

const quickAccessEntrySchema = new mongoose.Schema({
  // Stable key for records maintained by the official seed catalogue.
  seedKey: { type: String, required: true, unique: true, sparse: true },
  name: { type: String, required: true, trim: true, maxlength: 180, index: true },
  category: { type: String, required: true, enum: QUICK_ACCESS_CATEGORIES, index: true },
  description: { type: String, required: true, trim: true, maxlength: 600 },
  phone: { type: String, required: true, trim: true, maxlength: 40 },
  address: { type: String, trim: true, maxlength: 350 },
  state: { type: String, required: true, trim: true, index: true },
  stateCode: { type: String, trim: true, uppercase: true, maxlength: 4, default: 'IN' },
  city: { type: String, trim: true, index: true, default: 'Nationwide' },
  district: { type: String, trim: true, index: true, default: 'Nationwide' },
  coordinates: {
    latitude: { type: Number },
    longitude: { type: Number },
  },
  officialSource: { type: String, required: true, trim: true },
  lastVerified: { type: Date, required: true },
  isEmergency: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

quickAccessEntrySchema.index({ name: 'text', description: 'text' });
quickAccessEntrySchema.index({ state: 1, city: 1, district: 1, category: 1 });

module.exports = mongoose.model('QuickAccessEntry', quickAccessEntrySchema);
module.exports.QUICK_ACCESS_CATEGORIES = QUICK_ACCESS_CATEGORIES;
