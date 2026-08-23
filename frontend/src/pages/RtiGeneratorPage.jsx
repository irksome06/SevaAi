import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Copy,
  Download,
  FileText,
  Pencil,
  Printer,
  Shield,
  Check,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import '../styles/rti-generator.css';

const fields = [
  ['fullName', 'Full Name'],
  ['address', 'Permanent Address'],
  ['phone', 'Contact Number'],
  ['email', 'Email Address'],
  ['department', 'Department / Public Authority'],
  ['departmentAddress', 'Department Address'],
  ['locality', 'Locality / Area'],
  ['ward', 'Ward Number'],
  ['financialYear', 'Financial Year'],
  ['street', 'Street / Road Name'],
  ['place', 'Place'],
  ['date', 'Date'],
];

const valueOrBlank = (value) => value?.trim() || '[Not provided]';

// Official RTI Online Submission Portal URL (Direct Request page)
const RTI_OFFICIAL_URL = 'https://rtionline.gov.in/request/request.php';

export default function RtiGeneratorPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [editing, setEditing] = useState(true);
  const [notice, setNotice] = useState('');
  const [copied, setCopied] = useState(false);
  const [draft, setDraft] = useState(() => ({
    fullName: user?.fullName || '',
    address: '',
    phone: user?.phone || '',
    email: user?.email || '',
    department: '',
    departmentAddress: '',
    locality: '',
    ward: '',
    financialYear: '2025-2026',
    street: '',
    place: '',
    date: new Date().toLocaleDateString('en-GB'),
  }));

  const documentText = useMemo(
    () => `APPLICATION UNDER THE RIGHT TO INFORMATION ACT, 2005

To,
The Public Information Officer (PIO),
${valueOrBlank(draft.department)}
${valueOrBlank(draft.departmentAddress)}

Subject: Request for information regarding public works and infrastructure in ${valueOrBlank(draft.locality)} under Section 6(1) of the RTI Act, 2005.

1. Full Name of the Applicant: ${valueOrBlank(draft.fullName)}
2. Permanent Address: ${valueOrBlank(draft.address)}
3. Contact Number: ${valueOrBlank(draft.phone)}
4. Email ID: ${valueOrBlank(draft.email)}

5. Particulars of Information Required:
I kindly request the following certified information under the Right to Information Act, 2005:

a) Please provide a certified copy of the total budget allocated for road repairs and civic infrastructure in Ward ${valueOrBlank(draft.ward)} for the financial year ${valueOrBlank(draft.financialYear)}.

b) Provide details of contractor(s) awarded the tender for repairing the main road in ${valueOrBlank(draft.locality)}, including the sanctioned tender amount, completion timeline, and penalty clauses for delay.

c) Supply a copy of the quality inspection and audit report for patch works along ${valueOrBlank(draft.street)}.

6. Application Fee Details: Attached Postal Order / DD / Court Fee Stamp for Rs. 10/- as prescribed.
7. Below Poverty Line (BPL) Status: No

Declaration:
I state that the information sought does not fall within the restrictions contained in Sections 8 and 9 of the RTI Act, 2005. I am a citizen of India and am eligible to seek this information.

Place: ${valueOrBlank(draft.place)}
Date: ${valueOrBlank(draft.date)}

(Signature of Applicant)`,
    [draft]
  );

  const update = (key, value) => setDraft((current) => ({ ...current, [key]: value }));

  const copy = async () => {
    await navigator.clipboard.writeText(documentText);
    setCopied(true);
    setNotice('RTI application copied to clipboard.');
    setTimeout(() => {
      setCopied(false);
      setNotice('');
    }, 3000);
  };

  const download = () => {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(
      new Blob([documentText], { type: 'text/plain;charset=utf-8' })
    );
    link.download = 'rti-application.txt';
    link.click();
    URL.revokeObjectURL(link.href);
    setNotice('RTI application downloaded as text file.');
    setTimeout(() => setNotice(''), 3000);
  };

  return (
    <div className="rti-page">
      <div className="gov-top-ribbon print-hide" />
      <div className="app-background-pattern print-hide" />

      {/* Topbar */}
      <header className="rti-header print-hide">
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          aria-label="Back to dashboard"
        >
          <ArrowLeft size={18} />
          <span>Dashboard</span>
        </button>

        <div className="rti-header-brand">
          <div className="rti-emblem">
            <Shield size={18} strokeWidth={2.4} />
          </div>
          <div>
            <strong>RTI Mitra</strong>
            <span>Right to Information Assistant</span>
          </div>
        </div>

        <span className="rti-step-badge">Step 7 of 8 · Review &amp; Export</span>
      </header>

      {/* Main Content */}
      <main className="rti-main">
        <section className="rti-intro print-hide">
          <p className="rti-kicker">APPLICATION DRAFT &amp; VERIFICATION</p>
          <h1>Review Your RTI Application</h1>
          <span>
            Verify your details below. The document preview updates in real-time. When ready, copy or export your application.
          </span>
        </section>

        {editing && (
          <section className="rti-editor print-hide">
            <div className="rti-editor-header">
              <h2>Applicant &amp; Authority Details</h2>
              <p>These fields immediately update the official Form-A document below.</p>
            </div>
            <div className="rti-field-grid">
              {fields.map(([key, label]) => (
                <div key={key} className="rti-input-group">
                  <label className="rti-label" htmlFor={`rti-${key}`}>
                    {label}
                  </label>
                  <input
                    id={`rti-${key}`}
                    className="form-control"
                    value={draft[key]}
                    onChange={(event) => update(key, event.target.value)}
                    placeholder={`Enter ${label.toLowerCase()}...`}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Paper Document Preview */}
        <article className="rti-paper">
          <div className="rti-paper-bar print-hide">
            <span className="rti-rule-tag">
              <FileText size={15} /> Form-A (See Rule 3(1) of RTI Rules)
            </span>
            <span className="rti-draft-tag">Verified Citizen Draft</span>
          </div>
          <pre>{documentText}</pre>
        </article>

        {/* Action Toolbar */}
        <section className="rti-actions print-hide">
          <div className="rti-action-btn-group">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setEditing((current) => !current)}
            >
              <Pencil size={16} />
              <span>{editing ? 'Hide Editor' : 'Edit Details'}</span>
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={copy}
            >
              {copied ? <Check size={16} color="#059669" /> : <Copy size={16} />}
              <span>{copied ? 'Copied' : 'Copy Text'}</span>
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={download}
            >
              <Download size={16} />
              <span>Download (.txt)</span>
            </button>
          </div>

          <button
            type="button"
            className="btn btn-secondary rti-print-btn"
            onClick={() => window.print()}
          >
            <Printer size={16} />
            <span>Generate PDF</span>
          </button>
        </section>

        {/* Minimal Bottom Apply Box */}
        <section className="rti-bottom-apply-box print-hide">
          <div className="bottom-apply-text">
            <strong>Ready to file your RTI request?</strong>
            <p>Submit your application directly on the official Government of India portal.</p>
          </div>
          <a
            href={RTI_OFFICIAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary rti-apply-now-btn"
          >
            <span>Apply Now</span>
            <ExternalLink size={16} />
          </a>
        </section>
      </main>

      {notice && (
        <div className="rti-notice print-hide" role="status">
          <CheckCircle2 size={16} />
          <span>{notice}</span>
        </div>
      )}
    </div>
  );
}
