import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ExternalLink,
  Search,
  Radio,
  Building,
  Landmark
} from 'lucide-react';
import { newsApi } from '../services/api';
import '../styles/flashcards.css';

const DEFAULT_NEWS_ITEMS = [
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

const CATEGORY_TABS = [
  { id: 'all', label: 'All Updates', icon: Sparkles },
  { id: 'schemes', label: 'Govt Schemes', icon: Search },
  { id: 'news', label: 'Real-Time News', icon: Radio },
  { id: 'civic', label: 'Civic & Welfare', icon: Landmark },
];

export default function DashboardFlashcards() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [newsList, setNewsList] = useState(DEFAULT_NEWS_ITEMS);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const sliderTrackRef = useRef(null);

  // Fetch live flash news
  const fetchNews = async () => {
    try {
      const res = await newsApi.getFlashNews(activeCategory);
      if (res.success && res.news && res.news.length > 0) {
        setNewsList(res.news);
        setCurrentIndex(0);
      } else {
        // Fallback filter
        const filtered = activeCategory === 'all'
          ? DEFAULT_NEWS_ITEMS
          : DEFAULT_NEWS_ITEMS.filter((i) => i.category.toLowerCase() === activeCategory.toLowerCase());
        setNewsList(filtered);
      }
    } catch (err) {
      const filtered = activeCategory === 'all'
        ? DEFAULT_NEWS_ITEMS
        : DEFAULT_NEWS_ITEMS.filter((i) => i.category.toLowerCase() === activeCategory.toLowerCase());
      setNewsList(filtered);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [activeCategory]);

  // Auto-scroll carousel every 6 seconds if not hovered
  useEffect(() => {
    if (isPaused || newsList.length <= 1) return;
    const interval = setInterval(() => {
      if (sliderTrackRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = sliderTrackRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          sliderTrackRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          sliderTrackRef.current.scrollBy({ left: 340, behavior: 'smooth' });
        }
      }
    }, 5500);
    return () => clearInterval(interval);
  }, [isPaused, newsList.length]);

  const handlePrev = () => {
    if (sliderTrackRef.current) {
      sliderTrackRef.current.scrollBy({ left: -340, behavior: 'smooth' });
    }
    setCurrentIndex((prev) => (prev === 0 ? Math.max(0, newsList.length - 1) : prev - 1));
  };

  const handleNext = () => {
    if (sliderTrackRef.current) {
      sliderTrackRef.current.scrollBy({ left: 340, behavior: 'smooth' });
    }
    setCurrentIndex((prev) => (prev + 1) % newsList.length);
  };

  return (
    <section
      className="dashboard-flashcards-section"
      aria-label="Real-Time Government Schemes & Official News Updates"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Section Header with Live Badge & Category Tabs */}
      <div className="flashcards-topbar">
        <div className="flashcards-title-wrap">
          <div className="live-pulse-indicator">
            <span className="pulse-dot" />
            <span className="live-text">REAL-TIME GOVERNMENT SCHEMES &amp; NEWS</span>
          </div>
          <h2>Latest Schemes &amp; Official Circulars</h2>
        </div>

        {/* Carousel Navigation Arrows */}
        <div className="flashcards-nav-controls">
          <button
            type="button"
            className="nav-arrow-btn"
            onClick={handlePrev}
            aria-label="Previous update"
            title="Previous update"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            className="nav-arrow-btn"
            onClick={handleNext}
            aria-label="Next update"
            title="Next update"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flashcards-filter-pills" role="tablist" aria-label="Filter news by topic">
        {CATEGORY_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeCategory === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              className={`filter-pill-btn ${isActive ? 'active' : ''}`}
              onClick={() => setActiveCategory(tab.id)}
              role="tab"
              aria-selected={isActive}
            >
              <Icon size={13} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Flashcards Carousel Slider */}
      <div className="flashcards-carousel-container">
        {newsList.length > 0 ? (
          <div className="flashcards-track" ref={sliderTrackRef}>
            {newsList.map((item) => (
              <a
                key={item.id}
                href={item.externalUrl || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className={`flashcard-item-card tone-${item.badgeClass || 'scheme'} clickable-flashcard`}
                title={`Click to open official portal: ${item.title}`}
              >
                {/* Real GovTech Topic Image Banner Inside Box */}
                <div className="flashcard-image-wrap">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="flashcard-banner-img"
                    loading="lazy"
                  />
                  <div className="flashcard-image-overlay" />
                  <span className={`flashcard-image-badge badge-${item.badgeClass || 'scheme'}`}>
                    {item.categoryLabel || item.category}
                  </span>
                </div>

                {/* Flashcard Header & Meta */}
                <div className="flashcard-header">
                  <div className="flashcard-tag-group">
                    {item.isLive && (
                      <span className="badge-live-tag">
                        <span className="live-mini-dot" /> LIVE
                      </span>
                    )}
                  </div>
                  <span className="flashcard-time">{item.timestamp}</span>
                </div>

                {/* Flashcard Content */}
                <div className="flashcard-body">
                  <h3 className="flashcard-title">{item.title}</h3>
                  <p className="flashcard-summary">{item.summary}</p>
                </div>

                {/* Source Emblem & Official Portal Link */}
                <div className="flashcard-source-row">
                  <div className="source-info-left">
                    <div className="source-emblem">
                      <Building size={12} />
                    </div>
                    <span className="source-name">{item.source}</span>
                  </div>
                  <div className="portal-direct-link" title="Open portal link" aria-label="Open portal">
                    <ExternalLink size={14} />
                  </div>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="flashcards-empty-box">
            <p>No new updates in this category at the moment.</p>
          </div>
        )}
      </div>
    </section>
  );
}
