/**
 * Real-time Government Schemes & Citizen News Controller
 * Serves live, categorized welfare schemes, policy circulars, and national news updates.
 */

const FLASH_NEWS_DATA = [
  {
    id: 'news-scheme-01',
    category: 'schemes',
    categoryLabel: 'Welfare Schemes',
    title: 'PM-KISAN 17th Installment Direct Benefit Transfer Released for 9.3 Crore Farmers',
    summary: 'The Ministry of Agriculture has disbursed ₹20,000 Crore directly into farmers’ Aadhaar-seeded bank accounts across 36 States and UTs.',
    imageUrl: '/assets/flashcards/pmkisan_welfare.jpg',
    source: 'PIB New Delhi · Ministry of Agriculture',
    timestamp: 'Updated 2 hours ago',
    isLive: true,
    badgeClass: 'scheme',
    externalUrl: 'https://pmkisan.gov.in',
  },
  {
    id: 'news-scheme-02',
    category: 'schemes',
    categoryLabel: 'Healthcare Welfare',
    title: 'Ayushman Bharat PM-JAY Expands Free Healthcare Coverage to All Senior Citizens Aged 70+',
    summary: 'Every citizen aged 70 and above, regardless of income bracket, is now eligible for ₹5 Lakh annual family health insurance cover.',
    imageUrl: '/assets/flashcards/ayushman_healthcare.jpg',
    source: 'National Health Authority (NHA)',
    timestamp: 'Updated Today',
    isLive: true,
    badgeClass: 'scheme',
    externalUrl: 'https://nha.gov.in',
  },
  {
    id: 'news-scheme-03',
    category: 'schemes',
    categoryLabel: 'Renewable Energy Scheme',
    title: 'PM Surya Ghar Muft Bijli Yojana: Up to ₹78,000 Direct Subsidy for Rooftop Solar',
    summary: 'Central government provides direct bank subsidies to households installing 1kW to 3kW rooftop solar power systems, ensuring up to 300 free electricity units.',
    imageUrl: '/assets/flashcards/pm_surya_ghar.jpg',
    source: 'Ministry of New & Renewable Energy (MNRE)',
    timestamp: 'Updated Today',
    isLive: true,
    badgeClass: 'scheme',
    externalUrl: 'https://pmsuryaghar.gov.in',
  },
  {
    id: 'news-scheme-04',
    category: 'schemes',
    categoryLabel: 'Housing for All',
    title: 'Pradhan Mantri Awas Yojana (PMAY) Approves 3 Crore Additional Pucca Houses',
    summary: 'Cabinet approves expansion of rural and urban housing assistance with direct financial aid for eligible low-income families.',
    imageUrl: '/assets/flashcards/pm_awas_yojana.jpg',
    source: 'MoHUA & Ministry of Rural Development',
    timestamp: 'Updated 3 hours ago',
    isLive: true,
    badgeClass: 'scheme',
    externalUrl: 'https://pmaymis.gov.in',
  },
  {
    id: 'news-realtime-01',
    category: 'news',
    categoryLabel: 'National Real-Time News',
    title: 'Digital RTI Online Portal Expanded to 15 New State Government Departments',
    summary: 'DoPT integrates instant online filing, payment gateways, and time-bound appeal tracking across central and state public authorities.',
    imageUrl: '/assets/flashcards/digital_rti.jpg',
    source: 'DoPT · Central Information Commission',
    timestamp: 'Updated Today',
    isLive: true,
    badgeClass: 'rti',
    externalUrl: 'https://rtionline.gov.in',
  },
  {
    id: 'news-civic-01',
    category: 'civic',
    categoryLabel: 'Civic Infrastructure',
    title: 'Smart City Road Infrastructure & Rapid 48-Hour Pothole Repair SLA Mandated',
    summary: 'Urban Local Bodies across major cities have mandated a 48-hour resolution SLA for citizen-reported road potholes and drainage blockages.',
    imageUrl: '/assets/flashcards/smart_city.jpg',
    source: 'MoHUA Official · Swachh Bharat Mission',
    timestamp: 'Updated 4 hours ago',
    isLive: true,
    badgeClass: 'civic',
    externalUrl: 'https://mohua.gov.in',
  },
];

/**
 * @desc    Get real-time news flashcards
 * @route   GET /api/news
 * @access  Public
 */
const getFlashNews = async (req, res) => {
  try {
    const { category } = req.query;

    let filtered = FLASH_NEWS_DATA;
    if (category && category !== 'all') {
      filtered = FLASH_NEWS_DATA.filter(
        (item) => item.category.toLowerCase() === category.toLowerCase()
      );
    }

    return res.status(200).json({
      success: true,
      count: filtered.length,
      lastUpdated: new Date().toISOString(),
      news: filtered,
    });
  } catch (error) {
    console.error('[GetFlashNews] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve real-time flash news updates.',
      error: error.message,
    });
  }
};

module.exports = {
  getFlashNews,
  FLASH_NEWS_DATA,
};
