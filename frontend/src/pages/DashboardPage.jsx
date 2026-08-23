import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  LogOut,
  User,
  Mail,
  Smartphone,
  Globe,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  FolderLock,
  Layers,
  PhoneCall,
  Search,
  Sparkles,
  Award,
  ExternalLink,
  Info
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LanguageSelector, { LANGUAGES } from '../components/LanguageSelector';
import ServiceCard from '../components/ServiceCard';
import DashboardFlashcards from '../components/DashboardFlashcards';
import '../styles/dashboard.css';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, logout, language, t } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  // Find native name of user's preferred language
  const currentLangObj =
    LANGUAGES.find((l) => l.code === (user?.preferredLanguage || language)) || LANGUAGES[0];

  const getInitials = (name) => {
    if (!name) return 'C';
    return name
      .split(' ')
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  // The 6 citizen service modules (preserves all tab names and routes)
  const serviceModules = [
    {
      id: 'civic-problem',
      title: t('modCivicTitle'),
      description: t('modCivicDesc'),
      icon: AlertTriangle,
      iconColorClass: 'icon-civic',
      onClick: () => navigate('/report-civic-problem'),
      actionText: 'Report a problem',
    },
    {
      id: 'schemes',
      title: t('modSchemesTitle'),
      description: t('modSchemesDesc'),
      icon: Search,
      iconColorClass: 'icon-schemes',
      onClick: () => navigate('/scheme-eligibility'),
      actionText: 'Check eligibility',
    },
    {
      id: 'rti-gen',
      title: t('modRtiTitle'),
      description: t('modRtiDesc'),
      icon: HelpCircle,
      iconColorClass: 'icon-rti',
      onClick: () => navigate('/rti-generator'),
      actionText: 'Create RTI application',
    },
    {
      id: 'quick-access',
      title: 'Quick Access',
      description: 'Find emergency helplines, verified government contacts, and nearby offices.',
      icon: PhoneCall,
      iconColorClass: 'icon-quick-access',
      onClick: () => navigate('/quick-access'),
      actionText: 'Open Quick Access',
    },
    {
      id: 'app-tracker',
      title: t('modTrackerTitle'),
      description: t('modTrackerDesc'),
      icon: Layers,
      iconColorClass: 'icon-tracker',
      onClick: () => navigate('/my-applications'),
      actionText: 'View my records',
    },
    {
      id: 'documents',
      title: t('modDocumentsTitle'),
      description: t('modDocumentsDesc'),
      icon: FolderLock,
      iconColorClass: 'icon-vault',
      onClick: () => navigate('/document-vault'),
      actionText: 'Open My Vault',
    },
  ];

  return (
    <div className="dashboard-layout">
      <div className="gov-top-ribbon" />
      <div className="app-background-pattern" />

      {/* Official Dashboard Top Navbar */}
      <header className="dashboard-navbar">
        <div className="dashboard-nav-container">
          <div className="brand-logo-group">
            <div className="brand-emblem">
              <Shield size={24} strokeWidth={2.4} />
            </div>
            <div>
              <div className="brand-title">
                {t('brandTitle')}<span className="saffron-dot">.</span>
              </div>
              <div className="brand-subtitle">{t('brandSubtitle')}</div>
            </div>
          </div>

          <div className="nav-actions-group">
            <LanguageSelector />

            <div
              className="user-profile-badge interactive-profile-badge"
              onClick={() => navigate('/profile')}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && navigate('/profile')}
              tabIndex={0}
              role="button"
              aria-label="View citizen profile and account details"
              title="Click to view and edit your citizen profile"
            >
              <div className="user-avatar">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.fullName || 'Citizen Avatar'}
                    className="user-avatar-img"
                  />
                ) : (
                  getInitials(user?.fullName)
                )}
              </div>
              <div className="user-info-text">
                <span className="user-name-label">{user?.fullName || 'Citizen User'}</span>
                <span className="user-role-label">{t('verifiedCitizen')}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="btn btn-danger-outline btn-sm-logout"
              title={t('logout')}
              aria-label={t('logout')}
            >
              <LogOut size={16} />
              <span>{t('logout')}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Dashboard Main Content */}
      <main className="dashboard-main">
        {/* Welcome Hero Banner */}
        <section className="citizen-hero-banner">
          <div className="hero-pill-tag">
            <Shield size={14} />
            {t('authSuccessTag')}
          </div>
          <h1 className="hero-title">
            {t('namasteGreeting', { name: user?.fullName?.split(' ')[0] || 'Citizen' })}
          </h1>
          <p className="hero-description">
            {t('dashboardSubtitle')}
          </p>
        </section>

        {/* Citizen Profile Details Card */}
        <section className="profile-overview-card" aria-label="Citizen Profile Overview">
          <div className="profile-stat-item">
            <div className="stat-icon-wrapper stat-icon-blue">
              <User size={20} />
            </div>
            <div className="stat-details">
              <span className="stat-label">{t('statFullName')}</span>
              <span className="stat-value">{user?.fullName || 'Not specified'}</span>
            </div>
          </div>

          <div className="profile-stat-item">
            <div className="stat-icon-wrapper stat-icon-blue">
              {user?.email ? <Mail size={20} /> : <Smartphone size={20} />}
            </div>
            <div className="stat-details">
              <span className="stat-label">{user?.email ? t('statEmail') : t('statMobile')}</span>
              <span className="stat-value">{user?.email || user?.phone || 'N/A'}</span>
            </div>
          </div>

          <div className="profile-stat-item">
            <div className="stat-icon-wrapper stat-icon-amber">
              <Globe size={20} />
            </div>
            <div className="stat-details">
              <span className="stat-label">{t('statLanguage')}</span>
              <span className="stat-value">
                {currentLangObj.native} ({currentLangObj.label})
              </span>
            </div>
          </div>

          <div className="profile-stat-item">
            <div className="stat-icon-wrapper stat-icon-emerald">
              <CheckCircle2 size={20} />
            </div>
            <div className="stat-details">
              <span className="stat-label">{t('statVerification')}</span>
              <span className="stat-badge stat-badge-verified">
                <CheckCircle2 size={13} /> {t('activeVerified')}
              </span>
            </div>
          </div>
        </section>

        {/* Real-Time Government & Civic News Flashcards */}
        <DashboardFlashcards />

        {/* Service Modules Section */}
        <section className="service-modules-section" aria-label="Available Citizen Services">
          <div className="section-header">
            <div>
              <h3>{t('serviceModulesTitle')}</h3>
              <p>{t('serviceModulesSubtitle')}</p>
            </div>
          </div>

          <div className="services-grid">
            {serviceModules.map((mod) => (
              <ServiceCard
                key={mod.id}
                title={mod.title}
                description={mod.description}
                icon={mod.icon}
                iconColorClass={mod.iconColorClass}
                badgeText={mod.badgeText}
                onClick={mod.onClick}
                actionText={mod.actionText}
              />
            ))}
          </div>
        </section>
      </main>

      {/* Dashboard Footer */}
      <footer className="dashboard-footer">
        <div className="container">
          <p>
            <strong>{t('footerTitle')}</strong>
          </p>
          <p className="footer-subtext">
            {t('footerDesc')}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default DashboardPage;
