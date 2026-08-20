const QuickAccessEntry = require('../models/QuickAccessEntry');

const VERIFIED_ON = new Date('2026-08-21T00:00:00.000Z');
const INDIAN_STATES_AND_UTS = [
  'Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chandigarh', 'Chhattisgarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand', 'Karnataka', 'Kerala', 'Ladakh', 'Lakshadweep', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
];

// Sources are official Government of India web properties. Records without a
// published physical address deliberately omit maps instead of guessing one.
const seedEntries = [
  {
    name: 'Emergency Response Support System (ERSS)', category: 'Emergency', phone: '112', isEmergency: true,
    description: 'Pan-India single emergency number for police, fire, medical and other urgent assistance.',
    state: 'All India', stateCode: 'IN', city: 'Nationwide', district: 'Nationwide',
    officialSource: 'https://112.gov.in/', lastVerified: VERIFIED_ON,
  },
  {
    name: 'National Cyber Crime Helpline', category: 'Cyber Safety', phone: '1930', isEmergency: true,
    description: 'Report online financial fraud promptly through the National Cyber Crime Reporting Portal helpline.',
    state: 'All India', stateCode: 'IN', city: 'Nationwide', district: 'Nationwide',
    officialSource: 'https://www.cybercrime.gov.in/webform/Crime_NodalGrivanceList.aspx', lastVerified: VERIFIED_ON,
  },
  {
    name: 'Indian Railways RailMadad', category: 'Transport', phone: '139', isEmergency: false,
    description: 'Indian Railways integrated helpline for passenger assistance, enquiries and grievances during travel.',
    state: 'All India', stateCode: 'IN', city: 'Nationwide', district: 'Nationwide',
    officialSource: 'https://railmadad.indianrailways.gov.in/madad/final/home.jsp', lastVerified: VERIFIED_ON,
  },
  {
    name: 'National Disaster Management Authority Control Room', category: 'Disaster Management', phone: '+91-11-26701728', isEmergency: true,
    description: 'NDMA control room and national disaster-management authority contact.',
    address: 'NDMA Bhawan, A-1, Safdarjung Enclave, New Delhi – 110029', state: 'Delhi', stateCode: 'DL', city: 'New Delhi', district: 'New Delhi',
    officialSource: 'https://sachet.ndma.gov.in/About', lastVerified: VERIFIED_ON,
  },
  {
    name: 'National Commission for Women', category: 'Women & Child Support', phone: '+91-11-26944754', isEmergency: false,
    description: 'Government of India commission for matters concerning women; use 112 for immediate danger.',
    address: 'Plot No. 21, Jasola Institutional Area, New Delhi – 110025', state: 'Delhi', stateCode: 'DL', city: 'New Delhi', district: 'New Delhi',
    officialSource: 'https://cdn.ncw.gov.in/wp-content/uploads/2025/08/NCW_Posh_Guide_17aug-1.pdf', lastVerified: VERIFIED_ON,
  },
  {
    name: 'DARPG / CPGRAMS Helpline', category: 'Public Grievance', phone: '1964', isEmergency: false,
    description: 'Government public-grievance support. Submit service-delivery grievances through the CPGRAMS portal.',
    address: '5th Floor, Sardar Patel Bhawan, Sansad Marg, New Delhi', state: 'Delhi', stateCode: 'DL', city: 'New Delhi', district: 'New Delhi',
    officialSource: 'https://pgportal.gov.in/Home/NodalPgOfficers', lastVerified: VERIFIED_ON,
  },
  {
    name: 'Department of Administrative Reforms & Public Grievances', category: 'Government Office', phone: '+91-11-23401455', isEmergency: false,
    description: 'Nodal department for administrative reforms and public grievance redressal; use CPGRAMS to lodge a grievance.',
    address: '5th Floor, Sardar Patel Bhawan, Sansad Marg, New Delhi', state: 'Delhi', stateCode: 'DL', city: 'New Delhi', district: 'New Delhi',
    officialSource: 'https://pgportal.gov.in/Home/NodalPgOfficers', lastVerified: VERIFIED_ON,
  },
  {
    name: 'Directorate of Printing', category: 'Government Office', phone: '+91-11-23212965', isEmergency: false,
    description: 'Government of India Directorate of Printing public-grievance office contact.',
    address: 'GIP Building, DDU Marg, New Delhi – 110002', state: 'Delhi', stateCode: 'DL', city: 'New Delhi', district: 'New Delhi',
    officialSource: 'https://dop.gov.in/en/grievance-redressal/', lastVerified: VERIFIED_ON,
  },
  {
    name: 'Agriculture & Farmers Welfare Public Grievance Office', category: 'Government Office', phone: '+91-11-23074238', isEmergency: false,
    description: 'Public-grievance contact for the Department of Agriculture and Farmers Welfare.',
    address: 'Room No. 434, Krishi Bhavan, New Delhi', state: 'Delhi', stateCode: 'DL', city: 'New Delhi', district: 'New Delhi',
    officialSource: 'https://pgportal.gov.in/Home/NodalPgOfficers', lastVerified: VERIFIED_ON,
  },
];

let seedPromise;

const seedKeyFor = (entry) => entry.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// This is intentionally an upsert-and-repair flow rather than "insert if empty":
// the directory and filters load in parallel on first page view, so a simple count
// check can produce duplicated cards.
const seedAndRepairQuickAccessData = async () => {
  for (const entry of seedEntries) {
    const seedKey = seedKeyFor(entry);
    const existing = await QuickAccessEntry.find({ $or: [{ seedKey }, { name: entry.name }] }).sort({ createdAt: 1 });
    if (existing.length) {
      const [first, ...duplicates] = existing;
      await QuickAccessEntry.updateOne({ _id: first._id }, { $set: { ...entry, seedKey } });
      if (duplicates.length) await QuickAccessEntry.deleteMany({ _id: { $in: duplicates.map((item) => item._id) } });
    } else {
      await QuickAccessEntry.create({ ...entry, seedKey });
    }
  }
};

const ensureQuickAccessSeedData = async () => {
  if (!seedPromise) {
    seedPromise = seedAndRepairQuickAccessData().finally(() => { seedPromise = null; });
  }
  await seedPromise;
};

const getQuickAccessEntries = async (filters = {}) => {
  await ensureQuickAccessSeedData();
  const query = { isActive: true };
  if (filters.category) query.category = filters.category;
  // Nationwide services remain relevant when a citizen selects any State/UT.
  if (filters.state) query.state = { $in: [filters.state, 'All India'] };
  if (filters.city) query.city = { $in: [filters.city, 'Nationwide'] };
  if (filters.district) query.district = { $in: [filters.district, 'Nationwide'] };
  if (filters.search?.trim()) {
    const safeSearch = filters.search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    query.$or = [{ name: new RegExp(safeSearch, 'i') }, { description: new RegExp(safeSearch, 'i') }, { phone: new RegExp(safeSearch, 'i') }];
  }
  return QuickAccessEntry.find(query).sort({ isEmergency: -1, category: 1, name: 1 });
};

const getQuickAccessFacets = async () => {
  await ensureQuickAccessSeedData();
  const [states, cities, districts, categories] = await Promise.all([
    QuickAccessEntry.distinct('state', { isActive: true }), QuickAccessEntry.distinct('city', { isActive: true }),
    QuickAccessEntry.distinct('district', { isActive: true }), QuickAccessEntry.distinct('category', { isActive: true }),
  ]);
  return { states: ['All India', ...INDIAN_STATES_AND_UTS], cities: cities.sort(), districts: districts.sort(), categories: categories.sort() };
};

module.exports = { ensureQuickAccessSeedData, getQuickAccessEntries, getQuickAccessFacets, INDIAN_STATES_AND_UTS };
