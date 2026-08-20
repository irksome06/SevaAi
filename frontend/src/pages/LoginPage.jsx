import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, AlertCircle, ShieldCheck, Smartphone, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthNavbar from '../components/AuthNavbar';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginWithEmail, t } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(location.state?.message ? '' : '');
  const [successMsg, setSuccessMsg] = useState(location.state?.successMsg || '');
  const [fieldErrors, setFieldErrors] = useState({});

  const validate = () => {
    const errors = {};
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!formData.email.trim()) {
      errors.email = `${t('emailLabel')} is required.`;
    } else if (!emailRegex.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!formData.password) {
      errors.password = `${t('passwordLabel')} is required.`;
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError('');

    try {
      await loginWithEmail(formData.email, formData.password);
      const destination = location.state?.from?.pathname || '/dashboard';
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="app-background-pattern" />
      <AuthNavbar />

      <main className="auth-card-container">
        <div className="auth-card">
          <div className="auth-card-header">
            <h2>{t('loginTitle')}</h2>
            <p>{t('loginSubtitle')}</p>
          </div>

          {/* Auth Method Switcher Tabs */}
          <div className="auth-tabs">
            <button
              type="button"
              className="auth-tab-btn active"
              aria-selected="true"
            >
              <Mail size={16} />
              {t('emailTab')}
            </button>
            <button
              type="button"
              className="auth-tab-btn"
              onClick={() => navigate('/phone-login')}
              aria-selected="false"
            >
              <Smartphone size={16} />
              {t('phoneTab')}
            </button>
          </div>

          {/* Alert Messages */}
          {successMsg && (
            <div className="auth-alert auth-alert-success" role="alert">
              <CheckCircle size={18} style={{ flexShrink: 0 }} />
              <div>{successMsg}</div>
            </div>
          )}

          {error && (
            <div className="auth-alert auth-alert-error" role="alert">
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Email Address */}
            <div className="form-group">
              <label className="form-label" htmlFor="email-input">
                {t('emailLabel')} <span className="req">*</span>
              </label>
              <div className="input-with-icon">
                <span className="input-icon-left">
                  <Mail size={18} />
                </span>
                <input
                  id="email-input"
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

            {/* Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="password-input">
                {t('passwordLabel')} <span className="req">*</span>
              </label>
              <div className="input-with-icon">
                <span className="input-icon-left">
                  <Lock size={18} />
                </span>
                <input
                  id="password-input"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={t('passwordPlaceholder')}
                  className={`form-control has-left-icon has-right-icon ${
                    fieldErrors.password ? 'is-invalid' : ''
                  }`}
                  autoComplete="current-password"
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
                  {t('authenticatingBtn')}
                </>
              ) : (
                t('signInBtn')
              )}
            </button>
          </form>

          <div className="auth-card-footer">
            {t('noAccountPrompt')}{' '}
            <Link to="/register">{t('createAccountLink')}</Link>
          </div>

          <div className="auth-trust-badge">
            <ShieldCheck size={16} />
            <span>{t('encryptedBadge')}</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
