const ROUTES = {
  'Road Damage': {
    authority: 'Municipal Corporation or Public Works Department (PWD)',
    portal: 'https://pgportal.gov.in/',
    label: 'CPGRAMS public grievance portal',
  },
  'Water Crisis': {
    authority: 'Municipal Water Supply Department or Jal Board',
    portal: 'https://pgportal.gov.in/',
    label: 'CPGRAMS public grievance portal',
  },
  'Garbage / Waste': {
    authority: 'Municipal Solid Waste Management Department',
    portal: 'https://swachhatahiseva.gov.in/',
    label: 'Swachhata public grievance portal',
  },
  'Street Light': {
    authority: 'Municipal Electrical Department or local urban body',
    portal: 'https://pgportal.gov.in/',
    label: 'CPGRAMS public grievance portal',
  },
};

const resolveCivicRouting = (req, res) => {
  const route = ROUTES[req.body?.category];
  if (!route) {
    return res.status(400).json({ success: false, message: 'Select a supported civic issue category.' });
  }
  return res.json({ success: true, category: req.body.category, ...route });
};

module.exports = { resolveCivicRouting };
