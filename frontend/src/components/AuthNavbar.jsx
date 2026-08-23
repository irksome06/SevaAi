import React from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import LanguageSelector from './LanguageSelector';
import { useAuth } from '../context/AuthContext';

export const AuthNavbar = () => {
  const { t } = useAuth();

  return (
    <>
      <div className="gov-top-ribbon" />
      <header className="auth-header-bar">
        <Link to="/" className="brand-logo-group" aria-label="SevaAI Home">
          <div className="brand-emblem">
            <Shield size={22} strokeWidth={2.4} />
          </div>
          <div>
            <div className="brand-title">
              {t('brandTitle')}<span className="saffron-dot">.</span>
            </div>
            <div className="brand-subtitle">{t('brandSubtitle')}</div>
          </div>
        </Link>

        <div className="auth-nav-actions">
          <LanguageSelector />
        </div>
      </header>
    </>
  );
};

export default AuthNavbar;
