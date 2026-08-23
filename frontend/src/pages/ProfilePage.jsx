import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  ArrowLeft,
  User,
  Mail,
  Smartphone,
  MapPin,
  Camera,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Save,
  RotateCcw,
  LoaderCircle,
  Calendar,
  Briefcase,
  Globe,
  ShieldCheck,
  Building,
  Upload
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { LANGUAGES } from '../components/LanguageSelector';
import '../styles/profile.css';

const INDIAN_STATES = [
  'Andaman and Nicobar Islands',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi (NCT)',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Lakshadweep',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
];

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, updateProfile, t } = useAuth();
  const fileInputRef = useRef(null);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    avatar: '',
    gender: '',
    dob: '',
    occupation: '',
    preferredLanguage: 'en',
    location: {
      state: '',
      city: '',
      district: '',
      pincode: '',
      address: '',
    },
  });

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [avatarPreview, setAvatarPreview] = useState('');

  // Hydrate form on mount or user changes
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        avatar: user.avatar || '',
        gender: user.gender || '',
        dob: user.dob || '',
        occupation: user.occupation || '',
        preferredLanguage: user.preferredLanguage || 'en',
        location: {
          state: user.location?.state || '',
          city: user.location?.city || '',
          district: user.location?.district || '',
          pincode: user.location?.pincode || '',
          address: user.location?.address || '',
        },
      });
      setAvatarPreview(user.avatar || '');
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorMsg('');
  };

  const handleLocationChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        [name]: value,
      },
    }));
    setErrorMsg('');
  };

  // Avatar Image Upload
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg('Profile photo must be less than 2 MB in size.');
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/webp', 'image/jpg'].includes(file.type)) {
      setErrorMsg('Please select a valid JPG, PNG, or WEBP image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = reader.result;
      setAvatarPreview(base64Data);
      setFormData((prev) => ({ ...prev, avatar: base64Data }));
      setErrorMsg('');
    };
    reader.readAsDataURL(file);
  };

  // Remove Avatar
  const handleRemoveAvatar = () => {
    setAvatarPreview('');
    setFormData((prev) => ({ ...prev, avatar: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Reset form to user's saved state
  const handleReset = () => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        avatar: user.avatar || '',
        gender: user.gender || '',
        dob: user.dob || '',
        occupation: user.occupation || '',
        preferredLanguage: user.preferredLanguage || 'en',
        location: {
          state: user.location?.state || '',
          city: user.location?.city || '',
          district: user.location?.district || '',
          pincode: user.location?.pincode || '',
          address: user.location?.address || '',
        },
      });
      setAvatarPreview(user.avatar || '');
      setErrorMsg('');
      setSuccessMsg('');
    }
  };

  // Save profile to database
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    if (!formData.fullName || formData.fullName.trim().length < 2) {
      setErrorMsg('Full name must be at least 2 characters long.');
      setSaving(false);
      return;
    }

    try {
      const res = await updateProfile(formData);
      if (res.success) {
        setSuccessMsg('Your citizen profile details have been saved successfully.');
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        setErrorMsg(res.message || 'Failed to update profile.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'An error occurred while updating your profile.');
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'C';
    return name
      .split(' ')
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className="profile-page-layout">
      <div className="gov-top-ribbon" />
      <div className="app-background-pattern" />

      {/* Top Navbar */}
      <header className="profile-navbar">
        <div className="profile-nav-inner">
          <button
            type="button"
            className="profile-back-btn"
            onClick={() => navigate('/dashboard')}
            aria-label="Back to Dashboard"
          >
            <ArrowLeft size={18} />
            <span>Dashboard</span>
          </button>

          <div className="profile-nav-brand">
            <div className="profile-brand-emblem">
              <Shield size={18} strokeWidth={2.4} />
            </div>
            <div>
              <strong>SevaAI</strong>
              <span>Citizen Profile Management</span>
            </div>
          </div>

          <div className="profile-nav-right">
            <span className="profile-status-pill">
              <ShieldCheck size={14} />
              <span>Verified Account</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Profile Content */}
      <main className="profile-main-container">
        {/* Profile Hero Header */}
        <section className="profile-hero-card">
          <div className="profile-avatar-wrapper">
            <div className="profile-avatar-circle">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt={formData.fullName || 'Citizen Avatar'}
                  className="profile-avatar-img"
                />
              ) : (
                <div className="profile-avatar-placeholder">
                  {getInitials(formData.fullName)}
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/jpg"
              onChange={handleAvatarChange}
              hidden
              id="avatar-file-upload"
            />

            <div className="avatar-action-btns">
              <button
                type="button"
                className="btn-avatar-upload"
                onClick={() => fileInputRef.current?.click()}
                title="Upload new profile photo"
              >
                <Camera size={14} />
                <span>{avatarPreview ? 'Change Photo' : 'Upload Photo'}</span>
              </button>

              {avatarPreview && (
                <button
                  type="button"
                  className="btn-avatar-remove"
                  onClick={handleRemoveAvatar}
                  title="Remove photo and use initials"
                >
                  <Trash2 size={14} />
                  <span>Remove</span>
                </button>
              )}
            </div>
          </div>

          <div className="profile-hero-details">
            <div className="hero-kicker-row">
              <span className="citizen-id-badge">
                ID: #{user?._id ? user._id.slice(-6).toUpperCase() : 'CITIZEN'}
              </span>
              <span className="citizen-joined-tag">
                Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '2026'}
              </span>
            </div>
            <h1>{formData.fullName || 'Citizen User'}</h1>
            <p className="profile-hero-subtitle">
              Manage your personal information, contact credentials, and residential details for seamless public service applications.
            </p>
          </div>
        </section>

        {/* Alerts */}
        {successMsg && (
          <div className="profile-alert profile-alert-success" role="status">
            <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="profile-alert profile-alert-error" role="alert">
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="profile-form">
          {/* 1. Personal Information */}
          <section className="profile-section-card">
            <div className="section-card-header">
              <div className="section-icon-badge">
                <User size={18} />
              </div>
              <div>
                <h2>Personal Information</h2>
                <p>Your primary identity details registered across citizen services.</p>
              </div>
            </div>

            <div className="profile-grid-2col">
              <div className="form-group-item">
                <label className="form-item-label" htmlFor="fullName">
                  Full Name <span className="required-star">*</span>
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  className="form-control"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full official name"
                  required
                />
              </div>

              <div className="form-group-item">
                <label className="form-item-label" htmlFor="gender">
                  Gender
                </label>
                <select
                  id="gender"
                  name="gender"
                  className="form-control"
                  value={formData.gender}
                  onChange={handleChange}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other / Transgender</option>
                  <option value="prefer_not_to_say">Prefer not to say</option>
                </select>
              </div>

              <div className="form-group-item">
                <label className="form-item-label" htmlFor="dob">
                  Date of Birth
                </label>
                <input
                  id="dob"
                  name="dob"
                  type="date"
                  className="form-control"
                  value={formData.dob}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group-item">
                <label className="form-item-label" htmlFor="occupation">
                  Occupation / Employment
                </label>
                <input
                  id="occupation"
                  name="occupation"
                  type="text"
                  className="form-control"
                  value={formData.occupation}
                  onChange={handleChange}
                  placeholder="e.g. Farmer, Student, Teacher, Self-employed"
                />
              </div>
            </div>
          </section>

          {/* 2. Contact Credentials */}
          <section className="profile-section-card">
            <div className="section-card-header">
              <div className="section-icon-badge">
                <Mail size={18} />
              </div>
              <div>
                <h2>Contact Information</h2>
                <p>Used for application status SMS notifications, OTP authentication, and verification.</p>
              </div>
            </div>

            <div className="profile-grid-2col">
              <div className="form-group-item">
                <label className="form-item-label" htmlFor="email">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="form-control"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your.email@domain.com"
                />
              </div>

              <div className="form-group-item">
                <label className="form-item-label" htmlFor="phone">
                  Indian Mobile Number (+91)
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className="form-control"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+919876543210"
                />
              </div>
            </div>
          </section>

          {/* 3. Residential Location & Address */}
          <section className="profile-section-card">
            <div className="section-card-header">
              <div className="section-icon-badge">
                <MapPin size={18} />
              </div>
              <div>
                <h2>Location &amp; Address</h2>
                <p>Helps match local municipal ward grievances, state schemes, and helpline directories.</p>
              </div>
            </div>

            <div className="profile-grid-2col">
              <div className="form-group-item">
                <label className="form-item-label" htmlFor="state">
                  State / Union Territory
                </label>
                <select
                  id="state"
                  name="state"
                  className="form-control"
                  value={formData.location.state}
                  onChange={handleLocationChange}
                >
                  <option value="">Select State / UT</option>
                  {INDIAN_STATES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group-item">
                <label className="form-item-label" htmlFor="city">
                  City / Town / Village
                </label>
                <input
                  id="city"
                  name="city"
                  type="text"
                  className="form-control"
                  value={formData.location.city}
                  onChange={handleLocationChange}
                  placeholder="e.g. Mumbai, Patna, Jaipur"
                />
              </div>

              <div className="form-group-item">
                <label className="form-item-label" htmlFor="district">
                  District
                </label>
                <input
                  id="district"
                  name="district"
                  type="text"
                  className="form-control"
                  value={formData.location.district}
                  onChange={handleLocationChange}
                  placeholder="e.g. Pune, Varanasi, South Delhi"
                />
              </div>

              <div className="form-group-item">
                <label className="form-item-label" htmlFor="pincode">
                  Postal PIN Code
                </label>
                <input
                  id="pincode"
                  name="pincode"
                  type="text"
                  maxLength={6}
                  className="form-control"
                  value={formData.location.pincode}
                  onChange={handleLocationChange}
                  placeholder="e.g. 110001"
                />
              </div>

              <div className="form-group-item full-width-field">
                <label className="form-item-label" htmlFor="address">
                  Permanent Street Address
                </label>
                <textarea
                  id="address"
                  name="address"
                  rows={2}
                  className="form-control"
                  value={formData.location.address}
                  onChange={handleLocationChange}
                  placeholder="House/Flat No., Building Name, Street, Locality..."
                />
              </div>
            </div>
          </section>

          {/* 4. Preferences & Account Metadata */}
          <section className="profile-section-card">
            <div className="section-card-header">
              <div className="section-icon-badge">
                <Globe size={18} />
              </div>
              <div>
                <h2>Preferences &amp; Account Details</h2>
                <p>System language preferences and citizen verification metadata.</p>
              </div>
            </div>

            <div className="profile-grid-2col">
              <div className="form-group-item">
                <label className="form-item-label" htmlFor="preferredLanguage">
                  Preferred Portal Language
                </label>
                <select
                  id="preferredLanguage"
                  name="preferredLanguage"
                  className="form-control"
                  value={formData.preferredLanguage}
                  onChange={handleChange}
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.native} ({lang.name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group-item">
                <label className="form-item-label">
                  Authentication Method
                </label>
                <div className="readonly-box">
                  {user?.authProvider === 'phone' ? 'Indian Mobile OTP (+91)' : 'Email & Password Authentication'}
                </div>
              </div>
            </div>
          </section>

          {/* Form Action Buttons */}
          <div className="profile-form-actions">
            <button
              type="button"
              className="btn btn-secondary btn-reset-profile"
              onClick={handleReset}
              disabled={saving}
            >
              <RotateCcw size={16} />
              <span>Reset Changes</span>
            </button>

            <button
              type="submit"
              className="btn btn-primary btn-save-profile"
              disabled={saving}
            >
              {saving ? <LoaderCircle className="spinner-icon" size={16} /> : <Save size={16} />}
              <span>{saving ? 'Saving Profile…' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
