import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ServiceCard = ({
  icon: Icon,
  title,
  description,
  badgeText,
  iconColorClass = 'icon-ai',
}) => {
  const { t } = useAuth();
  const displayBadge = badgeText || t('plannedModule');

  return (
    <div className="service-module-card">
      <div>
        <div className="card-top-row">
          <div className={`card-module-icon ${iconColorClass}`}>
            <Icon size={24} />
          </div>
          <span className="module-pill-status">
            {displayBadge}
          </span>
        </div>

        <h4 className="service-card-title">{title}</h4>
        <p className="service-card-desc">{description}</p>
      </div>

      <div className="service-card-footer">
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
          <Sparkles size={14} color="var(--color-accent-saffron)" />
          {t('comingSoon')}
        </span>
        <ArrowRight size={16} />
      </div>
    </div>
  );
};

export default ServiceCard;
