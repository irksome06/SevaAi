const crypto = require('crypto');
const Tracking = require('../models/Tracking');

const createTrackingId = (type = 'other') => {
  const prefix = {
    civic_report: 'CIV', scheme_application: 'SCH', rti_application: 'RTI',
    scholarship_application: 'SCP', other: 'SRV',
  }[type] || 'SRV';
  return `${prefix}-${new Date().getFullYear()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
};

const createTrackingRecord = async (userId, data) => {
  const trackingId = data.trackingId || createTrackingId(data.type);
  const initialNote = data.initialNote || `${data.title} was created.`;
  return Tracking.create({
    ...data,
    userId,
    trackingId,
    timeline: data.timeline?.length ? data.timeline : [{
      status: data.status || 'Draft', note: initialNote, actor: data.actor || 'Citizen', occurredAt: new Date(),
    }],
  });
};

const updateTrackingStatus = async (record, { status, note, actor }) => {
  record.status = status;
  record.timeline.push({
    status,
    note: note || `Status updated to ${status}.`,
    actor: actor || 'SevaAI',
    occurredAt: new Date(),
  });
  return record.save();
};

const seedUserTrackingRecords = async (userId) => {
  const count = await Tracking.countDocuments({ userId });
  if (count) return [];

  const now = new Date();
  const daysAgo = (days) => new Date(now.getTime() - days * 86400000);
  const seeds = [
    {
      type: 'civic_report', title: 'Pothole near Community Health Centre', category: 'Road Damage', status: 'In Progress',
      sourceModule: 'Report Civic Problem', referenceId: 'WARD-14-2026-118',
      metadata: { location: 'MG Road, near Community Health Centre', ward: 'Ward 14', department: 'Municipal Roads Division', nextAction: 'The field team is scheduled to inspect the site within 2 working days.' },
      timeline: [
        { status: 'Submitted', note: 'Your road damage report was submitted with location details.', actor: 'Citizen', occurredAt: daysAgo(8) },
        { status: 'Received', note: 'The municipal control room acknowledged your complaint.', actor: 'Municipal Control Room', occurredAt: daysAgo(7) },
        { status: 'Assigned', note: 'Assigned to Ward 14 road maintenance team.', actor: 'Municipal Roads Division', occurredAt: daysAgo(4) },
        { status: 'In Progress', note: 'Inspection and repair planning are in progress.', actor: 'Ward 14 Road Team', occurredAt: daysAgo(1) },
      ],
    },
    {
      type: 'scheme_application', title: 'PM Ujjwala Yojana eligibility application', category: 'LPG Connection Support', status: 'Under Review',
      sourceModule: 'Scheme Eligibility', referenceId: 'PMUY-APP-826451',
      metadata: { schemeName: 'Pradhan Mantri Ujjwala Yojana', submittedDocuments: ['Aadhaar card', 'Ration card'], department: 'Ministry of Petroleum and Natural Gas', nextAction: 'Keep your original identity documents ready for verification.' },
      timeline: [
        { status: 'Draft', note: 'Eligibility details were saved.', actor: 'Citizen', occurredAt: daysAgo(12) },
        { status: 'Submitted', note: 'Application sent to the scheme portal.', actor: 'SevaAI', occurredAt: daysAgo(10) },
        { status: 'Received', note: 'Your application was received.', actor: 'Scheme Portal', occurredAt: daysAgo(9) },
        { status: 'Under Review', note: 'Eligibility and document checks are underway.', actor: 'Scheme Portal', occurredAt: daysAgo(3) },
      ],
    },
    {
      type: 'rti_application', title: 'RTI: Road repair expenditure for Ward 14', category: 'Public Works Information', status: 'Action Taken',
      sourceModule: 'RTI Generator', referenceId: 'RTI/2026/014728',
      metadata: { authority: 'Public Information Officer, Municipal Corporation', subject: 'Road repair expenditure and contractor details', responseDueDate: new Date(now.getTime() + 5 * 86400000), nextAction: 'Download the response and review the attached inspection report.' },
      timeline: [
        { status: 'Submitted', note: 'RTI application submitted to the Public Information Officer.', actor: 'Citizen', occurredAt: daysAgo(29) },
        { status: 'Received', note: 'Application number RTI/2026/014728 was issued.', actor: 'RTI Portal', occurredAt: daysAgo(27) },
        { status: 'Action Taken', note: 'A response and supporting documents have been made available.', actor: 'Public Information Officer', occurredAt: daysAgo(2) },
      ],
    },
    {
      type: 'scholarship_application', title: 'National Scholarship Portal application', category: 'Higher Education Scholarship', status: 'Pending Action',
      sourceModule: 'Scholarship Services', referenceId: 'NSP-2026-391750',
      metadata: { scholarshipName: 'Central Sector Scheme of Scholarship', institute: 'Government College', missingDocuments: ['Income certificate'], nextAction: 'Upload a current income certificate before 31 August 2026.' },
      timeline: [
        { status: 'Draft', note: 'Scholarship form was started.', actor: 'Citizen', occurredAt: daysAgo(6) },
        { status: 'Pending Action', note: 'An income certificate is required to submit this application.', actor: 'Scholarship Services', occurredAt: daysAgo(1) },
      ],
    },
  ];
  return Promise.all(seeds.map((seed) => createTrackingRecord(userId, seed)));
};

module.exports = { createTrackingId, createTrackingRecord, updateTrackingStatus, seedUserTrackingRecords };
