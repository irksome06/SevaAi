const OFFICIAL_RTI_PORTAL = 'https://rtionline.gov.in/';

exports.getOfficialPortal = (req, res) => {
  res.json({
    success: true,
    name: 'RTI Online - Government of India',
    url: process.env.RTI_OFFICIAL_PORTAL_URL || OFFICIAL_RTI_PORTAL,
  });
};
