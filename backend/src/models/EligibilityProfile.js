const mongoose = require('mongoose');

const eligibilityProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
  age: { type: Number, min: 0, max: 120 },
  annualIncome: { type: Number, min: 0 },
  education: { type: String, trim: true, maxlength: 80 },
  occupation: { type: String, trim: true, maxlength: 80 },
  state: { type: String, trim: true, maxlength: 80 },
  category: { type: String, enum: ['General', 'SC', 'ST', 'OBC', 'EWS', 'Other'] },
  areaType: { type: String, enum: ['Urban', 'Rural'] },
  isFarmer: Boolean,
  ownsPuccaHouse: Boolean,
  incomeTaxPayer: Boolean,
  governmentEmployee: Boolean,
  aadhaarAssistanceConsent: { type: Boolean, default: false },
  // Deliberately no Aadhaar-number field: SevaAI does not perform Aadhaar authentication.
  vaultConsent: { type: Boolean, default: false },
  vaultDocuments: [{ name: { type: String, maxlength: 180 }, type: { type: String, maxlength: 100 } }],
}, { timestamps: true });

module.exports = mongoose.model('EligibilityProfile', eligibilityProfileSchema);
