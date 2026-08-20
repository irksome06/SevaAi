import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, Globe, AlertCircle, ShieldCheck, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthNavbar from '../components/AuthNavbar';
import { LANGUAGES } from '../components/LanguageSelector';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { registerWithEmail, language, changeLanguage, t } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    preferredLanguage: language || 'en',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const validate = () => {
    const errors = {};
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!formData.fullName.trim()) {
      errors.fullName = `${t('fullNameLabel')} is required.`;
    } else if (formData.fullName.trim().length < 2) {
      errors.fullName = `${t('fullNameLabel')} must be at least 2 characters.`;
    }

    if (!formData.email.trim()) {
      errors.email = `${t('emailLabel')} is required.`;
    } else if (!emailRegex.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!formData.phone) {
      errors.phone = `${t('mobileNumberLabel')} is required.`;
    } else if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      errors.phone = 'Please enter a valid 10-digit Indian mobile number.';
    }

    if (!formData.password) {
      errors.password = `${t('passwordLabel')} is required.`;
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long.';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = `${t('confirmPasswordLabel')} is required.`;
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const nextValue = name === 'phone' ? value.replace(/\D/g, '').slice(0, 10) : value;
    setFormData((prev) => ({ ...prev, [name]: nextValue }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (error) setError('');

    if (name === 'preferredLanguage') {
      changeLanguage(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError('');

    try {
      await registerWithEmail(formData);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Password strength check
  const isLengthValid = formData.password.length >= 8;
  const hasLetter = /[a-zA-Z]/.test(formData.password);
  const hasNumber = /\d/.test(formData.password);

  return (
    <div className="auth-wrapper">
      <div className="app-background-pattern" />
      <AuthNavbar />

      <main className="auth-card-container">
        <div className="auth-card">
          <div className="auth-card-header">
            <h2>{t('registerTitle')}</h2>
            <p>{t('registerSubtitle')}</p>
          </div>

          {error && (
            <div className="auth-alert auth-alert-error" role="alert">
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Full Name */}
            <div className="form-group">
              <label className="form-label" htmlFor="fullName-input">
                {t('fullNameLabel')} <span className="req">*</span>
              </label>
              <div className="input-with-icon">
                <span className="input-icon-left">
                  <User size={18} />
                </span>
                <input
                  id="fullName-input"
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder={t('fullNamePlaceholder')}
                  className={`form-control has-left-icon ${
                    fieldErrors.fullName ? 'is-invalid' : ''
                  }`}
                  autoComplete="name"
                  disabled={loading}
                />
              </div>
              {fieldErrors.fullName && (
                <div className="field-error-text">
                  <AlertCircle size={13} />
                  {fieldErrors.fullName}
                </div>
              )}
            </div>

            {/* Email Address */}
            <div className="form-group">
              <label className="form-label" htmlFor="register-email">
                {t('emailLabel')} <span className="req">*</span>
              </label>
              <div className="input-with-icon">
                <span className="input-icon-left">
                  <Mail size={18} />
                </span>
                <input
                  id="register-email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={t('emailPlaceholder')}
                  className={`form-control has-left-icon ${
                    fieldErrors.email ? 'is-invalid' : ''
                  }`}
                  autoComplete="email"
                  disabled={loading}
                />
              </div>
              {fieldErrors.email && (
                <div className="field-error-text">
                  <AlertCircle size={13} />
                  {fieldErrors.email}
                </div>
              )}
            </div>

            {/* Required phone number */}
            <div className="form-group">
              <label className="form-label" htmlFor="register-phone">
                {t('mobileNumberLabel')} <span className="req">*</span>
              </label>
              <div className={`phone-input-group ${fieldErrors.phone ? 'is-invalid' : ''}`}>
                <div className="phone-prefix-box">
                  <span className="flag">🇮🇳</span>
                  <span>+91</span>
                </div>
                <input
                  id="register-phone"
                  type="tel"
                  inputMode="numeric"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="9876543210"
                  className="phone-number-field"
                  autoComplete="tel-national"
                  disabled={loading}
                />
              </div>
              {fieldErrors.phone && (
                <div className="field-error-text">
                  <AlertCircle size={13} />
                  {fieldErrors.phone}
                </div>
              )}
              <div className="field-hint">Use this number to sign in with OTP.</div>
            </div>

            {/* Preferred Language */}
            <div className="form-group">
              <label className="form-label" htmlFor="preferred-language">
                {t('prefLangLabel')} <span className="req">*</span>
              </label>
              <div className="input-with-icon">
                <span className="input-icon-left">
                  <Globe size={18} />
                </span>
                <select
                  id="preferred-language"
                  name="preferredLanguage"
                  value={formData.preferredLanguage}
                  onChange={handleChange}
                  className="form-control has-left-icon"
                  disabled={loading}
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.native} — {lang.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field-hint">
                {t('prefLangHint')}
              </div>
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="register-password">
                {t('passwordLabel')} <span className="req">*</span>
              </label>
              <div className="input-with-icon">
                <span className="input-icon-left">
                  <Lock size={18} />
                </span>
                <input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={t('passwordPlaceholder')}
                  className={`form-control has-left-icon has-right-icon ${
                    fieldErrors.password ? 'is-invalid' : ''
                  }`}
                  autoComplete="new-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="input-icon-right"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {fieldErrors.password && (
                <div className="field-error-text">
                  <AlertCircle size={13} />
                  {fieldErrors.password}
                </div>
              )}
              {formData.password && (
                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.4rem', fontSize: '0.75rem' }}>
                  <span style={{ color: isLengthValid ? 'var(--color-emerald)' : 'var(--color-text-light)', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                    <Check size={12} /> {t('passwordStrengthLength')}
                  </span>
                  <span style={{ color: hasLetter ? 'var(--color-emerald)' : 'var(--color-text-light)', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                    <Check size={12} /> {t('passwordStrengthLetters')}
                  </span>
                  <span style={{ color: hasNumber ? 'var(--color-emerald)' : 'var(--color-text-light)', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                    <Check size={12} /> {t('passwordStrengthNumbers')}
                  </span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="register-confirm-password">
                {t('confirmPasswordLabel')} <span className="req">*</span>
              </label>
              <div className="input-with-icon">
                <span className="input-icon-left">
                  <Lock size={18} />
                </span>
                <input
                  id="register-confirm-password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder={t('confirmPasswordPlaceholder')}
                  className={`form-control has-left-icon has-right-icon ${
                    fieldErrors.confirmPassword ? 'is-invalid' : ''
                  }`}
                  autoComplete="new-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="input-icon-right"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {fieldErrors.confirmPassword && (
                <div className="field-error-text">
                  <AlertCircle size={13} />
                  {fieldErrors.confirmPassword}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={loading}
              style={{ marginTop: '1.25rem' }}
            >
              {loading ? (
                <>
                  <span className="spinner" />
                  {t('creatingAccountBtn')}
                </>
              ) : (
                t('completeRegistrationBtn')
              )}
            </button>
          </form>

          <div className="auth-card-footer">
            {t('alreadyHaveAccountPrompt')}{' '}
            <Link to="/login">{t('signInLink')}</Link>
          </div>

          <div className="auth-trust-badge">
            <ShieldCheck size={16} />
            <span>{t('secureProtocolBadge')}</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RegisterPage;
