import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi, getAuthToken, setAuthToken } from '../services/api';
import { getTranslation } from '../utils/translations';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(getAuthToken());
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('sevaai_lang') || 'en';
  });

  // Verify and hydrate current citizen session on initial mount
  const checkAuth = useCallback(async () => {
    const storedToken = getAuthToken();
    if (!storedToken) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const response = await authApi.getMe();
      if (response.success && response.user) {
        setUser(response.user);
        if (response.user.preferredLanguage) {
          setLanguage(response.user.preferredLanguage);
          localStorage.setItem('sevaai_lang', response.user.preferredLanguage);
        }
      } else {
        setAuthToken(null);
        setToken(null);
        setUser(null);
      }
    } catch (error) {
      console.warn('[AuthContext] Session invalid or expired:', error.message);
      setAuthToken(null);
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  /**
   * Log in with Email and Password
   */
  const loginWithEmail = async (email, password) => {
    const response = await authApi.login({ email, password });
    if (response.success && response.token) {
      setAuthToken(response.token);
      setToken(response.token);
      setUser(response.user);
      if (response.user.preferredLanguage) {
        setLanguage(response.user.preferredLanguage);
        localStorage.setItem('sevaai_lang', response.user.preferredLanguage);
      }
    }
    return response;
  };

  /**
   * Register with Email and Password
   */
  const registerWithEmail = async (formData) => {
    const payload = {
      ...formData,
      preferredLanguage: formData.preferredLanguage || language,
    };
    const response = await authApi.register(payload);
    if (response.success && response.token) {
      setAuthToken(response.token);
      setToken(response.token);
      setUser(response.user);
      if (response.user.preferredLanguage) {
        setLanguage(response.user.preferredLanguage);
        localStorage.setItem('sevaai_lang', response.user.preferredLanguage);
      }
    }
    return response;
  };

  /**
   * Request OTP for Indian phone number
   */
  const requestPhoneOtp = async (phone) => {
    return await authApi.sendOtp(phone);
  };

  /**
   * Verify OTP and log in / create user
   */
  const verifyPhoneOtpAndLogin = async (phone, otp, fullName, preferredLanguage) => {
    const payload = {
      phone,
      otp,
      fullName,
      preferredLanguage: preferredLanguage || language,
    };
    const response = await authApi.verifyOtp(payload);
    if (response.success && response.token) {
      setAuthToken(response.token);
      setToken(response.token);
      setUser(response.user);
      if (response.user.preferredLanguage) {
        setLanguage(response.user.preferredLanguage);
        localStorage.setItem('sevaai_lang', response.user.preferredLanguage);
      }
    }
    return response;
  };

  /**
   * Sign out citizen
   */
  const logout = () => {
    setAuthToken(null);
    setToken(null);
    setUser(null);
  };

  /**
   * Change preferred language
   */
  const changeLanguage = (newLang) => {
    setLanguage(newLang);
    localStorage.setItem('sevaai_lang', newLang);
    if (user) {
      setUser((prev) => (prev ? { ...prev, preferredLanguage: newLang } : prev));
    }
  };

  /**
   * Translation helper hook
   */
  const t = useCallback(
    (key, params = {}) => {
      const activeLang = user?.preferredLanguage || language || 'en';
      return getTranslation(activeLang, key, params);
    },
    [user?.preferredLanguage, language]
  );

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    language,
    t,
    loginWithEmail,
    registerWithEmail,
    requestPhoneOtp,
    verifyPhoneOtpAndLogin,
    logout,
    changeLanguage,
    refreshUser: checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
