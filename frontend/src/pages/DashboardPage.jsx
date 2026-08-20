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
  FileText,
  HelpCircle,
  FolderLock,
  Layers,
  Bot,
  Search,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LanguageSelector, { LANGUAGES } from '../components/LanguageSelector';
import ServiceCard from '../components/ServiceCard';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, logout, language, t } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  // Find native name of user's preferred language
  const currentLangObj = LANGUAGES.find((l) => l.code === (user?.preferredLanguage || language)) || LANGUAGES[0];

  const getInitials = (name) => {
    if (!name) return 'C';
    return name
      .split(' ')
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  // The 6 citizen service modules (AI assistant is now floating bottom-right widget)
  const serviceModules = [
    {
      id: 'civic-problem',
      title: t('modCivicTitle'),
      description: t('modCivicDesc'),
      icon: AlertTriangle,
      iconColorClass: 'icon-civic',
      badgeText: t('phase2Module'),
      onClick: () => navigate('/report-civic-problem'),
      actionText: 'Report a problem',
    },
    {
      id: 'complaint-gen',
      title: t('modComplaintTitle'),
      description: t('modComplaintDesc'),
      icon: FileText,
      iconColorClass: 'icon-ai',
      badgeText: t('phase2Module'),
    },
    {
      id: 'rti-gen',
      title: t('modRtiTitle'),
      description: t('modRtiDesc'),
      icon: HelpCircle,
      iconColorClass: 'icon-rti',
      badgeText: t('phase2Module'),
    },
    {
      id: 'schemes',
      title: t('modSchemesTitle'),
      description: t('modSchemesDesc'),
      icon: Search,
      iconColorClass: 'icon-schemes',
      badgeText: t('phase2Module'),
    },
    {
      id: 'app-tracker',
      title: t('modTrackerTitle'),
      description: t('modTrackerDesc'),
      icon: Layers,
      iconColorClass: 'icon-tracker',
      badgeText: t('phase2Module'),
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
      <div className="app-background-pattern" />

      {/* Dashboard Top Navbar */}
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

            <div className="user-profile-badge">
              <div className="user-avatar">{getInitials(user?.fullName)}</div>
              <div className="user-info-text">
                <span className="user-name-label">{user?.fullName || 'Citizen User'}</span>
                <span className="user-role-label">{t('verifiedCitizen')}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="btn btn-danger-outline"
              style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}
              title={t('logout')}
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
            <Sparkles size={14} />
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
        <section className="profile-overview-card">
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
              <span className="stat-value">{currentLangObj.native} ({currentLangObj.label})</span>
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

        {/* Service Modules Grid */}
        <section>
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
          <p style={{ fontSize: '0.75rem', marginTop: '0.35rem', color: 'var(--color-text-light)' }}>
            {t('footerDesc')}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default DashboardPage;
