import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Smartphone, ShieldCheck, AlertCircle, ArrowLeft, RotateCcw, Clock, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthNavbar from '../components/AuthNavbar';
import OtpInput from '../components/OtpInput';

export const PhoneLoginPage = () => {
  const navigate = useNavigate();
  const { requestPhoneOtp, verifyPhoneOtpAndLogin, language, t } = useAuth();

  // Step 1: 'phone', Step 2: 'otp'
  const [step, setStep] = useState('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [mockOtp, setMockOtp] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [isOtpInvalid, setIsOtpInvalid] = useState(false);
  
  // Countdown timer for Resend OTP (30 seconds)
  const [countdown, setCountdown] = useState(30);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    let timer;
    if (step === 'otp' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  const validatePhone = (phone) => {
    const clean = phone.replace(/\D/g, '');
    if (!clean) {
      return `${t('mobileNumberLabel')} is required.`;
    }
    if (clean.length !== 10) {
      return 'Please enter a 10-digit mobile number.';
    }
    if (!/^[6-9]\d{9}$/.test(clean)) {
      return 'Indian mobile numbers must start with 6, 7, 8, or 9.';
    }
    return '';
  };

  const handlePhoneChange = (e) => {
    const rawVal = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhoneNumber(rawVal);
    if (phoneError) setPhoneError('');
    if (error) setError('');
  };

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    const validationError = validatePhone(phoneNumber);
    if (validationError) {
      setPhoneError(validationError);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await requestPhoneOtp(phoneNumber);
      setMockOtp(response.devOtp || '');
      setStep('otp');
      setCountdown(30);
      setCanResend(false);
      setOtpCode('');
      setIsOtpInvalid(false);
    } catch (err) {
      setError(err.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (!canResend || loading) return;
    setLoading(true);
    setError('');
    setIsOtpInvalid(false);

    try {
      const response = await requestPhoneOtp(phoneNumber);
      setMockOtp(response.devOtp || '');
      setCountdown(30);
      setCanResend(false);
      setOtpCode('');
    } catch (err) {
      setError(err.message || 'Failed to resend OTP.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e?.preventDefault();
    if (otpCode.length !== 6) {
      setError('Please enter the complete 6-digit OTP code.');
      setIsOtpInvalid(true);
      return;
    }

    setLoading(true);
    setError('');
    setIsOtpInvalid(false);

    try {
      await verifyPhoneOtpAndLogin(phoneNumber, otpCode, '', language);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Incorrect or expired OTP.');
      setIsOtpInvalid(true);
    } finally {
      setLoading(false);
    }
  };

  // Change phone number option
  const handleChangePhone = () => {
    setStep('phone');
    setOtpCode('');
    setMockOtp('');
    setError('');
    setIsOtpInvalid(false);
  };

  return (
    <div className="auth-wrapper">
      <div className="app-background-pattern" />
      <AuthNavbar />

      <main className="auth-card-container">
        <div className="auth-card">
          <div className="auth-card-header">
            <h2>{step === 'phone' ? t('phoneVerificationTitle') : t('verifyOtpTitle')}</h2>
            <p>
              {step === 'phone'
                ? t('phoneVerificationSubtitle')
                : t('verifyOtpSubtitle', { phone: phoneNumber })}
            </p>
          </div>

          {/* Switcher Tab if on Step 1 */}
          {step === 'phone' && (
            <div className="auth-tabs">
              <button
                type="button"
                className="auth-tab-btn"
                onClick={() => navigate('/login')}
                aria-selected="false"
              >
                <Mail size={16} />
                {t('emailTab')}
              </button>
              <button
                type="button"
                className="auth-tab-btn active"
                aria-selected="true"
              >
                <Smartphone size={16} />
                {t('phoneTab')}
              </button>
            </div>
          )}

          {error && (
            <div className="auth-alert auth-alert-error" role="alert">
              <AlertCircle size={18} style={{ flexShrink: 0 }} />
              <div>{error}</div>
            </div>
          )}

          {step === 'phone' ? (
            /* STEP 1: Phone Number Input */
            <form onSubmit={handleSendOtp} noValidate>
              <div className="form-group">
                <label className="form-label" htmlFor="phone-input">
                  {t('mobileNumberLabel')} <span className="req">*</span>
                </label>
                <div className={`phone-input-group ${phoneError ? 'is-invalid' : ''}`}>
                  <div className="phone-prefix-box">
                    <span className="flag">🇮🇳</span>
                    <span>+91</span>
                  </div>
                  <input
                    id="phone-input"
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={10}
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    placeholder="9876543210"
                    className="phone-number-field"
                    autoComplete="tel-national"
                    disabled={loading}
                    autoFocus
                  />
                </div>
                {phoneError && (
                  <div className="field-error-text">
                    <AlertCircle size={13} />
                    {phoneError}
                  </div>
                )}
                <div className="field-hint">
                  {t('mobileNumberHint')}
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-block"
                disabled={loading || phoneNumber.length !== 10}
                style={{ marginTop: '1.5rem' }}
              >
                {loading ? (
                  <>
                    <span className="spinner" />
                    {t('sendingOtpBtn')}
                  </>
                ) : (
                  t('getOtpBtn')
                )}
              </button>
            </form>
          ) : (
            /* STEP 2: 6-Digit OTP Verification Screen */
            <div>
              <div className="otp-container">
                {mockOtp && (
                  <div className="auth-alert auth-alert-info" role="status">
                    <ShieldCheck size={18} style={{ flexShrink: 0 }} />
                    <div><strong>Mock OTP:</strong> {mockOtp}</div>
                  </div>
                )}
                <OtpInput
                  value={otpCode}
                  onChange={(val) => {
                    setOtpCode(val);
                    if (isOtpInvalid) setIsOtpInvalid(false);
                    if (error) setError('');
                  }}
                  length={6}
                  isInvalid={isOtpInvalid}
                  disabled={loading}
                />

                <div className="otp-meta-actions">
                  <button
                    type="button"
                    onClick={handleChangePhone}
                    className="change-phone-link"
                    disabled={loading}
                  >
                    <ArrowLeft size={14} /> {t('changeNumber')}
                  </button>

                  {canResend ? (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="otp-resend-btn"
                      disabled={loading}
                    >
                      <RotateCcw size={13} style={{ display: 'inline', marginRight: '4px' }} />
                      {t('resendOtp')}
                    </button>
                  ) : (
                    <span className="otp-countdown-badge">
                      <Clock size={14} />
                      {t('resendIn', { seconds: countdown })}
                    </span>
                  )}
                </div>
              </div>

              <button
                type="button"
                onClick={handleVerifyOtp}
                className="btn btn-primary btn-block"
                disabled={loading || otpCode.length !== 6}
                style={{ marginTop: '1.25rem' }}
              >
                {loading ? (
                  <>
                    <span className="spinner" />
                    {t('verifyingOtpBtn')}
                  </>
                ) : (
                  t('verifyOtpBtn')
                )}
              </button>
            </div>
          )}

          <div className="auth-card-footer">
            {t('preferEmailPrompt')}{' '}
            <Link to="/login">{t('signInWithEmailLink')}</Link>
          </div>

          <div className="auth-trust-badge">
            <ShieldCheck size={16} />
            <span>{t('authGatewayBadge')}</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PhoneLoginPage;
