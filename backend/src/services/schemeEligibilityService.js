// Source-backed catalogue. Rules provide a preliminary guide only; official portals decide eligibility.
const verifiedOn = '2026-08-21';
const schemes = [
  { id: 'pm-kisan', name: 'PM-KISAN', category: 'Agriculture', department: 'Department of Agriculture & Farmers Welfare', benefit: '₹6,000 per year in three instalments for eligible landholding farmer families.', requirements: ['Landholding farmer family', 'Not in an official exclusion category', 'e-KYC and bank details as required by the portal'], steps: ['Open New Farmer Registration', 'Complete the official registration and e-KYC', 'Check status on the official portal'], officialUrl: 'https://pmkisan.gov.in/RegistrationFormupdated.aspx', source: 'https://pmkisan.gov.in/', lastVerified: verifiedOn, rule: 'pm-kisan' },
  { id: 'pmay-u-2', name: 'PMAY-U 2.0', category: 'Housing', department: 'Ministry of Housing and Urban Affairs', benefit: 'Housing assistance under the applicable PMAY-U 2.0 vertical; official guidelines state assistance can be up to ₹2.50 lakh per unit.', requirements: ['Urban household', 'No pucca house anywhere in India', 'Annual household income within the applicable EWS/LIG/MIG band'], steps: ['Open the PMAY-U 2.0 portal', 'Choose Apply for PMAY-U 2.0', 'Complete the official form and ULB verification'], officialUrl: 'https://pmay-urban.gov.in/', source: 'https://pmay-urban.gov.in/uploads/guidelines/Operational-Guidelines-of-PMAY-U-2.pdf', lastVerified: verifiedOn, rule: 'pmay-u-2' },
  { id: 'post-matric-sc', name: 'Post-Matric Scholarship for SC Students', category: 'Education', department: 'Ministry of Social Justice & Empowerment', benefit: 'Financial assistance for eligible SC students pursuing recognised post-matric studies; award amounts depend on the applicable scheme terms.', requirements: ['Scheduled Caste category', 'Passed matriculation or higher secondary as applicable', 'Enrolment in a recognised post-matric course'], steps: ['Check the current scheme listing on NSP', 'Use/obtain the required One Time Registration', 'Submit the official application before the portal deadline'], officialUrl: 'https://scholarships.gov.in/', source: 'https://www.education.gov.in/sites/upload_files/mhrd/files/upload_document/2110annex1to21_eng.pdf', lastVerified: verifiedOn, rule: 'post-matric-sc' },
  { id: 'pm-jay', name: 'Ayushman Bharat PM-JAY', category: 'Health', department: 'National Health Authority', benefit: 'Health assurance eligibility is determined through the official beneficiary system.', requirements: ['Official beneficiary eligibility check is required'], steps: ['Open the official beneficiary portal', 'Use the portal’s eligibility search', 'Follow the official instructions for any available benefit'], officialUrl: 'https://beneficiary.nha.gov.in/', source: 'https://beneficiary.nha.gov.in/', lastVerified: verifiedOn, rule: 'official-check' },
];

const requiredFor = { 'pm-kisan': ['state', 'isFarmer', 'incomeTaxPayer', 'governmentEmployee'], 'pmay-u-2': ['state', 'areaType', 'annualIncome', 'ownsPuccaHouse'], 'post-matric-sc': ['category', 'education'], 'official-check': [] };
const evaluate = (scheme, profile = {}) => {
  const missing = (requiredFor[scheme.rule] || []).filter((key) => profile[key] === undefined || profile[key] === null || profile[key] === '');
  if (scheme.rule === 'official-check') return { status: 'More Information Required', missing: ['Official PM-JAY beneficiary check'], reasons: ['This portal does not reproduce or infer PM-JAY beneficiary eligibility.'] };
  if (scheme.rule === 'pm-kisan') {
    if (profile.isFarmer === false || profile.incomeTaxPayer || profile.governmentEmployee) return { status: 'Not Eligible', missing: [], reasons: ['The supplied profile does not meet a preliminary PM-KISAN condition or indicates an exclusion category.'] };
  }
  if (scheme.rule === 'pmay-u-2') {
    if (profile.areaType === 'Rural' || profile.ownsPuccaHouse || Number(profile.annualIncome) > 900000) return { status: 'Not Eligible', missing: [], reasons: ['The supplied profile conflicts with the published PMAY-U 2.0 preliminary conditions.'] };
  }
  if (scheme.rule === 'post-matric-sc' && profile.category && profile.category !== 'SC') return { status: 'Not Eligible', missing: [], reasons: ['This scholarship is for SC students.'] };
  if (missing.length) return { status: 'More Information Required', missing, reasons: ['Complete the listed profile details for a preliminary match.'] };
  return { status: scheme.rule === 'pmay-u-2' || scheme.rule === 'post-matric-sc' ? 'Possibly Eligible' : 'Eligible', missing: [], reasons: ['Your supplied profile meets the structured preliminary checks. Official verification is still required.'] };
};
module.exports = { schemes, evaluate };
