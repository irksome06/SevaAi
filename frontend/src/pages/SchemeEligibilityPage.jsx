import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ExternalLink,
  Search,
  ShieldCheck,
  Building,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  FolderOpen,
  Info,
  Check,
  SlidersHorizontal,
  ChevronRight,
  ClipboardList
} from 'lucide-react';
import { schemeEligibilityApi } from '../services/api';
import '../styles/application-tracker.css';

const blank = {
  age: '',
  annualIncome: '',
  education: '',
  occupation: '',
  state: '',
  category: '',
  areaType: '',
  isFarmer: false,
  ownsPuccaHouse: false,
  incomeTaxPayer: false,
  governmentEmployee: false,
  vaultConsent: false,
  aadhaarAssistanceConsent: false,
};

const vault = () => {
  try {
    return JSON.parse(localStorage.getItem('sevaai-document-vault') || '[]').map(
      ({ name, type }) => ({ name, type })
    );
  } catch {
    return [];
  }
};

const statesAndUts = [
  'Andaman and Nicobar Islands',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
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

const educationLevels = [
  'Below matriculation',
  'Matriculation',
  'Higher Secondary',
  'ITI / Diploma',
  'Post-matric / higher education',
  'Graduate',
  'Postgraduate or above',
];

const occupations = [
  'Farmer',
  'Student',
  'Salaried employee',
  'Self-employed / business owner',
  'Homemaker',
  'Daily-wage worker',
  'Unemployed',
  'Retired',
  'Other',
];

export default function SchemeEligibilityPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(blank);
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(true);

  const put = (k, v) => setProfile((p) => ({ ...p, [k]: v }));

  const refresh = async () => {
    const result = await schemeEligibilityApi.recommendations();
    setItems(result.recommendations || []);
  };

  useEffect(() => {
    (async () => {
      try {
        const p = await schemeEligibilityApi.getProfile();
        setProfile({ ...blank, ...(p.profile || {}) });
        await refresh();
      } catch (e) {
        setNotice(e.message);
      } finally {
        setBusy(false);
      }
    })();
  }, []);

  const check = async () => {
    setBusy(true);
    try {
      await schemeEligibilityApi.saveProfile({
        ...profile,
        age: profile.age === '' ? undefined : Number(profile.age),
        annualIncome:
          profile.annualIncome === '' ? undefined : Number(profile.annualIncome),
        vaultDocuments: profile.vaultConsent ? vault() : [],
      });
      await refresh();
      setNotice(
        profile.vaultConsent
          ? 'Profile saved. Only Vault document names and types were shared for reminders; files remain on your device.'
          : 'Profile saved. Preliminary guidance generated; official government authorities make final eligibility determinations.'
      );
    } catch (e) {
      setNotice(e.message);
    } finally {
      setBusy(false);
    }
  };

  const start = async (scheme) => {
    try {
      const result = await schemeEligibilityApi.start(scheme.id);
      window.open(result.officialUrl, '_blank', 'noopener,noreferrer');
      setNotice(`Added "${scheme.name}" to My Applications & opened official portal.`);
    } catch (e) {
      setNotice(e.message);
    }
  };

  const hasEligibilityDetails = Boolean(
    profile.state ||
      profile.category ||
      profile.education ||
      profile.occupation ||
      profile.age ||
      profile.annualIncome ||
      profile.isFarmer ||
      profile.ownsPuccaHouse ||
      profile.incomeTaxPayer ||
      profile.governmentEmployee
  );

  const catalogue = items.filter(
    (s) =>
      !search ||
      `${s.name} ${s.category} ${s.department}`.toLowerCase().includes(search.toLowerCase())
  );

  const matchingSchemes = catalogue.filter((s) =>
    ['Eligible', 'Possibly Eligible'].includes(s.status)
  );

  const visible = hasEligibilityDetails && matchingSchemes.length ? matchingSchemes : catalogue;

  const getStatusBadgeClass = (status) => {
    if (status === 'Eligible') return 'tracker-status-green';
    if (status === 'Possibly Eligible') return 'tracker-status-amber';
    return 'tracker-status-blue';
  };

  return (
    <div className="tracker-page">
      <div className="gov-top-ribbon" />
      <div className="app-background-pattern" />

      {/* Official Topbar Navigation */}
      <header className="tracker-topbar">
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          aria-label="Back to dashboard"
        >
          <ArrowLeft size={18} />
          <span>Dashboard</span>
        </button>

        <div className="tracker-brand">
          <ShieldCheck size={22} />
          <span>SevaAI</span>
          <em>Scheme Eligibility Guidance</em>
        </div>

        <button
          type="button"
          className="tracker-help"
          onClick={() => navigate('/my-applications')}
        >
          <ClipboardList size={16} />
          <span>My Applications</span>
        </button>
      </header>

      {/* Main Container */}
      <main className="tracker-main">
        {/* Hero Section */}
        <section className="tracker-hero">
          <div>
            <p>CENTRAL &amp; STATE WELFARE PROGRAMS</p>
            <h1>Government Scheme Guidance</h1>
            <span>
              Discover verified welfare programs, subsidies, and assistance matched with your eligibility profile.
            </span>
          </div>
          <Search size={54} />
        </section>

        {/* Profile Card */}
        <section className="tracker-records-section" style={{ marginTop: '2rem' }}>
          <div className="tracker-section-heading">
            <div>
              <h2>Your Eligibility Profile</h2>
              <p>
                Provide key demographics to discover welfare schemes you may qualify for. No identity numbers are stored.
              </p>
            </div>
          </div>

          <div className="scheme-profile-form-grid">
            <div className="form-group-item">
              <label className="form-item-label">Age</label>
              <input
                type="number"
                min="0"
                max="120"
                className="form-control"
                value={profile.age ?? ''}
                onChange={(e) => put('age', e.target.value)}
                placeholder="e.g. 35"
              />
            </div>

            <div className="form-group-item">
              <label className="form-item-label">Annual Household Income (₹)</label>
              <input
                type="number"
                min="0"
                className="form-control"
                value={profile.annualIncome ?? ''}
                onChange={(e) => put('annualIncome', e.target.value)}
                placeholder="e.g. 180000"
              />
            </div>

            <div className="form-group-item">
              <label className="form-item-label">State / Union Territory</label>
              <select
                className="form-control"
                value={profile.state ?? ''}
                onChange={(e) => put('state', e.target.value)}
              >
                <option value="">Select State / UT</option>
                {statesAndUts.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group-item">
              <label className="form-item-label">Education Level</label>
              <select
                className="form-control"
                value={profile.education ?? ''}
                onChange={(e) => put('education', e.target.value)}
              >
                <option value="">Select Education Level</option>
                {educationLevels.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group-item">
              <label className="form-item-label">Occupation</label>
              <select
                className="form-control"
                value={profile.occupation ?? ''}
                onChange={(e) => put('occupation', e.target.value)}
              >
                <option value="">Select Occupation</option>
                {occupations.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group-item">
              <label className="form-item-label">Social Category</label>
              <select
                className="form-control"
                value={profile.category ?? ''}
                onChange={(e) => put('category', e.target.value)}
              >
                <option value="">Select Category</option>
                {['General', 'SC', 'ST', 'OBC', 'EWS', 'Other'].map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group-item">
              <label className="form-item-label">Area Type</label>
              <select
                className="form-control"
                value={profile.areaType ?? ''}
                onChange={(e) => put('areaType', e.target.value)}
              >
                <option value="">Select Area Type</option>
                <option value="Urban">Urban</option>
                <option value="Rural">Rural</option>
              </select>
            </div>
          </div>

          {/* Checkbox Criteria Group */}
          <div className="scheme-checkbox-grid">
            {[
              ['isFarmer', 'I am a landholding farmer'],
              ['ownsPuccaHouse', 'My family owns a pucca house'],
              ['incomeTaxPayer', 'I paid income tax in the last assessment year'],
              ['governmentEmployee', 'I am a government employee'],
              [
                'vaultConsent',
                `Use my local Vault index for document reminders (${vault().length} items available)`,
              ],
              [
                'aadhaarAssistanceConsent',
                'I consent to authorised Aadhaar profile assistance (no Aadhaar number is collected)',
              ],
            ].map(([k, label]) => (
              <label key={k} className="scheme-checkbox-item">
                <input
                  type="checkbox"
                  checked={!!profile[k]}
                  onChange={(e) => put(k, e.target.checked)}
                />
                <span>{label}</span>
              </label>
            ))}
          </div>

          <div className="scheme-form-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={check}
              disabled={busy}
            >
              {busy ? (
                <>
                  <span className="spinner" />
                  <span>Checking Eligibility...</span>
                </>
              ) : (
                <>
                  <Search size={16} />
                  <span>Save &amp; Check Eligibility</span>
                </>
              )}
            </button>
          </div>

          {notice && (
            <div className="vault-notice" role="status" style={{ marginTop: '1.25rem' }}>
              <Info size={18} style={{ flexShrink: 0 }} />
              <span>{notice}</span>
            </div>
          )}
        </section>

        {/* Recommended Schemes Section */}
        <section className="tracker-records-section" style={{ marginTop: '2rem' }}>
          <div className="tracker-section-heading">
            <div>
              <h2>Recommended Schemes for You</h2>
              <p>
                Showing {visible.length} scheme{visible.length === 1 ? '' : 's'} based on current criteria
              </p>
            </div>
          </div>

          <div className="tracker-filters" style={{ marginTop: '1rem' }}>
            <label className="tracker-search">
              <Search size={18} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search verified schemes by name, department, or keyword..."
              />
            </label>
          </div>

          <div className="scheme-cards-list">
            {visible.length > 0 ? (
              visible.map((s) => (
                <article className="scheme-item-card" key={s.id}>
                  <div className="scheme-item-header">
                    <div className="scheme-title-group">
                      <span className="scheme-dept-tag">{s.department}</span>
                      <h3 className="scheme-name">{s.name}</h3>
                    </div>
                    <span className={`tracker-status ${getStatusBadgeClass(s.status)}`}>
                      {s.status}
                    </span>
                  </div>

                  <div className="scheme-benefit-box">
                    <strong>Benefit:</strong> {s.benefit}
                  </div>

                  {s.reasons?.length > 0 && (
                    <div className="scheme-meta-row">
                      <span className="scheme-meta-label">Why you qualify:</span>
                      <p className="scheme-meta-val">{s.reasons.join(' ')}</p>
                    </div>
                  )}

                  {s.missing?.length > 0 && (
                    <div className="scheme-meta-row scheme-missing-row">
                      <span className="scheme-meta-label">Additional info needed:</span>
                      <p className="scheme-meta-val">{s.missing.join(', ')}</p>
                    </div>
                  )}

                  {s.requirements?.length > 0 && (
                    <div className="scheme-meta-row">
                      <span className="scheme-meta-label">Requirements:</span>
                      <p className="scheme-meta-val">{s.requirements.join(' • ')}</p>
                    </div>
                  )}

                  {s.steps?.length > 0 && (
                    <div className="scheme-steps-row">
                      <span className="scheme-meta-label">Application Steps:</span>
                      <div className="scheme-steps-pills">
                        {s.steps.map((step, idx) => (
                          <React.Fragment key={idx}>
                            <span className="step-tag">
                              <b>{idx + 1}</b> {step}
                            </span>
                            {idx < s.steps.length - 1 && <span className="step-sep">→</span>}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="scheme-item-footer">
                    <small className="scheme-verified-info">
                      Verified {s.lastVerified} ·{' '}
                      <a href={s.source} target="_blank" rel="noreferrer">
                        Official source <ExternalLink size={12} />
                      </a>
                    </small>

                    <div className="scheme-action-btns">
                      <a
                        className="btn btn-secondary"
                        href={s.officialUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Official Portal <ExternalLink size={14} />
                      </a>
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => start(s)}
                      >
                        Track &amp; Apply <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="tracker-empty">
                <FolderOpen size={40} />
                <h3>No Matching Schemes Found</h3>
                <p>Try adjusting your search keywords or updating your eligibility profile above.</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
