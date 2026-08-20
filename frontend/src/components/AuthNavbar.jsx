import React from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import LanguageSelector from './LanguageSelector';
import { useAuth } from '../context/AuthContext';

export const AuthNavbar = () => {
  const { t } = useAuth();

  return (
    <header className="auth-header-bar">
      <Link to="/" className="brand-logo-group">
        <div className="brand-emblem">
          <Shield size={24} strokeWidth={2.4} />
        </div>
        <div>
          <div className="brand-title">
            {t('brandTitle')}<span className="saffron-dot">.</span>
          </div>
          <div className="brand-subtitle">{t('brandSubtitle')}</div>
        </div>
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <LanguageSelector />
      </div>
    </header>
  );
};

export default AuthNavbar;
