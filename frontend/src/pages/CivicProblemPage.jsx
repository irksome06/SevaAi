import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  ImagePlus,
  Lightbulb,
  MapPin,
  Shield,
  Trash2,
  TrafficCone,
  Waves,
  X,
  Clock,
  ChevronRight,
  ClipboardList,
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { trackingApi } from '../services/api';
import '../styles/civic-problem.css';

const categories = [
  {
    id: 'road-damage',
    label: 'Road Damage',
    description: 'Potholes, cracked roads, cave-ins, or damaged pedestrian sidewalks',
    icon: TrafficCone,
    colorClass: 'category-road',
  },
  {
    id: 'water-crisis',
    label: 'Water Crisis',
    description: 'Pipe leaks, waterlogging, low pressure, or contaminated supply',
    icon: Waves,
    colorClass: 'category-water',
  },
  {
    id: 'garbage-waste',
    label: 'Garbage / Waste',
    description: 'Missed waste collection, overflowing public bins, or illegal dumping',
    icon: Trash2,
    colorClass: 'category-waste',
  },
  {
    id: 'street-light',
    label: 'Street Light',
    description: 'Broken lamps, flickering fixtures, or dark unsafe street stretches',
    icon: Lightbulb,
    colorClass: 'category-light',
  },
];

export default function CivicProblemPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [category, setCategory] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [submission, setSubmission] = useState(null);
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [details, setDetails] = useState({ location: '', description: '' });
  const [image, setImage] = useState(null);
  const imageInputRef = useRef(null);

  const openReport = (selectedCategory) => {
    setCategory(selectedCategory);
    setSubmitted(false);
    setSubmission(null);
    setSubmitError('');
    setCopiedId(false);
    setDetails({ location: '', description: '' });
    setImage(null);
  };

  useEffect(() => () => {
    if (image?.preview) URL.revokeObjectURL(image.preview);
  }, [image]);

  const chooseImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setSubmitError('Please select a JPG, PNG, or WEBP image.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setSubmitError('Selected photo exceeds the 5 MB limit.');
      return;
    }
    setSubmitError('');
    setImage({ name: file.name, preview: URL.createObjectURL(file) });
  };

  const copyTrackingId = async () => {
    if (submission?.trackingId) {
      await navigator.clipboard.writeText(submission.trackingId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2500);
    }
  };

  const submitReport = async (event) => {
    event.preventDefault();
    setSubmitError('');
    setIsSubmitting(true);
    try {
      const response = await trackingApi.create({
        type: 'civic_report',
        title: `${category.label} report`,
        category: category.label,
        status: 'Submitted',
        sourceModule: 'Report Civic Problem',
        metadata: {
          location: details.location,
          description: details.description,
          photoAttached: Boolean(image),
          nextAction: 'Your report has been sent to the relevant ward service team for acknowledgement.',
        },
        initialNote: 'Your civic report was submitted and is awaiting acknowledgement.',
      });
      setSubmission(response.record);
      setSubmitted(true);
    } catch (error) {
      setSubmitError(error.message || 'Unable to submit your report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="civic-page">
      <div className="gov-top-ribbon" />
      <div className="app-background-pattern" />

      {/* Official Topbar Navigation */}
      <header className="civic-topbar">
        <div className="civic-topbar-container">
          <button
            type="button"
            className="civic-back-btn"
            onClick={() => navigate('/dashboard')}
            aria-label="Back to dashboard"
          >
            <ArrowLeft size={18} />
            <span>Dashboard</span>
          </button>

          <div className="civic-brand-indicator">
            <div className="civic-emblem-icon">
              <Shield size={18} strokeWidth={2.4} />
            </div>
            <div className="civic-brand-text">
              <strong>SevaAI</strong>
              <span>Civic Grievance Portal</span>
            </div>
          </div>

          <button
            type="button"
            className="civic-nav-action"
            onClick={() => navigate('/my-applications')}
          >
            <ClipboardList size={16} />
            <span>My Applications</span>
          </button>
        </div>
      </header>

      {/* Main Page Body */}
      <main className="civic-main">
        {/* Citizen Hero Banner with Clear Requested Title & Subtitle */}
        <section className="civic-hero-section">
          <div className="civic-hero-content">
            <div className="civic-kicker-badge">
              <Shield size={13} />
              <span>Ward Services · Citizen Grievance Portal</span>
            </div>
            <h1 className="civic-hero-title">Report a Problem</h1>
            <p className="civic-hero-subtitle">
              Tell us what issue you are facing and we’ll guide you through the next steps.
            </p>
          </div>

          <div className="civic-hero-steps-pills">
            <div className="step-pill">
              <span className="step-num">1</span>
              <span>Select Category</span>
            </div>
            <div className="step-arrow">→</div>
            <div className="step-pill">
              <span className="step-num">2</span>
              <span>Provide Details &amp; Location</span>
            </div>
            <div className="step-arrow">→</div>
            <div className="step-pill">
              <span className="step-num">3</span>
              <span>Track Resolution</span>
            </div>
          </div>
        </section>

        {/* Category Selection Grid */}
        <section className="civic-categories-section">
          <div className="section-title-wrap">
            <h2>Select Issue Category</h2>
            <p>Choose the category that best describes your civic issue</p>
          </div>

          <div className="civic-category-grid" aria-label="Civic problem categories">
            {categories.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  type="button"
                  className="civic-category-card"
                  key={item.label}
                  onClick={() => openReport(item)}
                >
                  <div className={`civic-category-icon-wrapper ${item.colorClass}`}>
                    <Icon size={28} />
                  </div>
                  <div className="civic-category-info">
                    <h3 className="civic-category-label">{item.label}</h3>
                    <p className="civic-category-desc">{item.description}</p>
                  </div>
                  <div className="civic-card-action-cue">
                    <span>Report this issue</span>
                    <ChevronRight size={16} />
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Live Recent Updates Section */}
        <section className="civic-updates-card">
          <div className="civic-updates-header">
            <div>
              <span className="civic-updates-kicker">COMMUNITY BULLETIN</span>
              <h2>Recent Activity in Your Area</h2>
            </div>
            <span className="civic-status-live">
              <span className="live-pulse-dot" /> Live Updates
            </span>
          </div>

          <ul className="civic-updates-list">
            <li>
              <div className="update-marker marker-blue" />
              <div className="update-content">
                <strong>Road repair &amp; pothole filling reported</strong>
                <p>Ward team notified for physical site inspection.</p>
              </div>
              <time className="update-time">
                <Clock size={13} /> 2 hours ago
              </time>
            </li>
            <li>
              <div className="update-marker marker-green" />
              <div className="update-content">
                <strong>Main road streetlight fixture resolved</strong>
                <p>Replaced electrical ballast and restored road illumination.</p>
              </div>
              <time className="update-time">
                <Clock size={13} /> 5 hours ago
              </time>
            </li>
          </ul>
        </section>
      </main>

      {/* Reporting Modal Dialog */}
      {category && (
        <div
          className="civic-modal-backdrop"
          onClick={() => setCategory(null)}
          role="presentation"
        >
          <div
            className="civic-modal-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="civic-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="civic-modal-close"
              onClick={() => setCategory(null)}
              aria-label="Close report form"
            >
              <X size={20} />
            </button>

            {submitted ? (
              <div className="civic-success-view">
                <div className="success-icon-badge">
                  <CheckCircle2 size={44} />
                </div>
                <h2>Report Submitted Successfully</h2>
                <p>
                  Your <strong>{category.label}</strong> grievance has been recorded and assigned a unique tracking number for ward follow-up.
                </p>

                {submission?.trackingId && (
                  <div className="tracking-id-pill-box">
                    <span className="tracking-id-label">Official Tracking ID</span>
                    <div className="tracking-id-value-row">
                      <code>{submission.trackingId}</code>
                      <button
                        type="button"
                        onClick={copyTrackingId}
                        className="btn-copy-id"
                        title="Copy tracking ID"
                      >
                        {copiedId ? <Check size={16} color="#059669" /> : <Copy size={16} />}
                        <span>{copiedId ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>
                )}

                <div className="success-actions-group">
                  <button
                    type="button"
                    className="btn btn-primary btn-block"
                    onClick={() => navigate('/my-applications')}
                  >
                    View in My Applications
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-block"
                    onClick={() => setCategory(null)}
                  >
                    Close Window
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={submitReport} className="civic-form">
                <div className="modal-header-section">
                  <div className={`modal-icon-badge ${category.colorClass || ''}`}>
                    <category.icon size={26} />
                  </div>
                  <div>
                    <span className="modal-eyebrow">NEW CIVIC GRIEVANCE</span>
                    <h2 id="civic-modal-title">Report {category.label}</h2>
                  </div>
                </div>
                <p className="modal-instruction">
                  Please provide accurate location and details to assist municipal field officers in dispatching the inspection team.
                </p>

                {/* Form Group: Location */}
                <div className="form-group">
                  <label className="form-label" htmlFor="civic-location">
                    <span>Location / Address</span> <span className="req">*</span>
                  </label>
                  <div className="input-with-icon">
                    <span className="input-icon-left">
                      <MapPin size={17} />
                    </span>
                    <input
                      id="civic-location"
                      required
                      value={details.location}
                      onChange={(event) =>
                        setDetails({ ...details, location: event.target.value })
                      }
                      placeholder="Street name, landmark, ward number, or nearby address"
                      className="form-control has-left-icon"
                      autoFocus
                    />
                  </div>
                </div>

                {/* Form Group: Description */}
                <div className="form-group">
                  <label className="form-label" htmlFor="civic-description">
                    <span>What is the issue?</span> <span className="req">*</span>
                  </label>
                  <textarea
                    id="civic-description"
                    required
                    rows="4"
                    value={details.description}
                    onChange={(event) =>
                      setDetails({ ...details, description: event.target.value })
                    }
                    placeholder="Describe the severity, duration, and specific details of the problem..."
                    className="form-control"
                  />
                </div>

                {/* Photo Upload Attachment */}
                <div className="form-group">
                  <label className="form-label">
                    <span>Photo Evidence (Optional)</span>
                  </label>
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={chooseImage}
                    hidden
                  />
                  {image ? (
                    <div className="civic-photo-preview-card">
                      <img src={image.preview} alt="Selected problem" />
                      <div className="photo-preview-meta">
                        <strong>{image.name}</strong>
                        <button
                          type="button"
                          className="btn-remove-photo"
                          onClick={() => {
                            URL.revokeObjectURL(image.preview);
                            setImage(null);
                            if (imageInputRef.current) imageInputRef.current.value = '';
                          }}
                        >
                          <Trash2 size={14} /> Remove Photo
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="btn-upload-photo"
                      onClick={() => imageInputRef.current?.click()}
                    >
                      <ImagePlus size={18} />
                      <span>Attach Photo Evidence</span>
                      <small>JPG, PNG, or WEBP (Max 5 MB)</small>
                    </button>
                  )}
                </div>

                {submitError && (
                  <div className="auth-alert auth-alert-error" role="alert">
                    <AlertCircle size={17} style={{ flexShrink: 0 }} />
                    <span>{submitError}</span>
                  </div>
                )}

                <div className="modal-footer-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setCategory(null)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner" />
                        <span>Submitting Report...</span>
                      </>
                    ) : (
                      'Submit Grievance Report'
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
