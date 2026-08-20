import React from 'react';
import { Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা' },
  { code: 'mr', label: 'Marathi', native: 'मराठी' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { code: 'gu', label: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'ur', label: 'Urdu', native: 'اردو' },
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'ml', label: 'Malayalam', native: 'മലയാളം' },
  { code: 'or', label: 'Odia', native: 'ଓଡ଼ିଆ' },
  { code: 'pa', label: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { code: 'as', label: 'Assamese', native: 'অসমীয়া' },
];

export const LanguageSelector = ({ value, onChange, compact = false }) => {
  const auth = useAuth();
  const currentLang = value || (auth ? auth.language : 'en');

  const handleChange = (e) => {
    const newLang = e.target.value;
    if (onChange) {
      onChange(newLang);
    } else if (auth && auth.changeLanguage) {
      auth.changeLanguage(newLang);
    }
  };

  return (
    <div className="lang-selector-wrapper" title="Select Preferred Language">
      <Globe size={16} color="var(--color-primary)" />
      <select
        value={currentLang}
        onChange={handleChange}
        aria-label="Select Language"
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.native} ({lang.label})
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSelector;
