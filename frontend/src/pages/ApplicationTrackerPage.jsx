import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock3,
  ExternalLink,
  FileSearch,
  FolderOpen,
  LoaderCircle,
  Search,
  ShieldCheck,
  X,
  Copy,
  Check,
  RefreshCw,
  AlertCircle,
  Calendar,
  Layers,
  Building
} from 'lucide-react';
import { trackingApi } from '../services/api';
import '../styles/application-tracker.css';

const TYPE_LABELS = {
  civic_report: 'Civic report',
  scheme_application: 'Scheme application',
  rti_application: 'RTI application',
  scholarship_application: 'Scholarship application',
  other: 'Service request',
};

const STATUS_CLASSES = {
  Draft: 'neutral',
  Submitted: 'blue',
  Received: 'blue',
  'Under Review': 'amber',
  Assigned: 'purple',
  'In Progress': 'purple',
  'Action Taken': 'green',
  Approved: 'green',
  Rejected: 'red',
  Resolved: 'green',
  Completed: 'green',
  Closed: 'neutral',
  'Pending Action': 'orange',
};

const formatDate = (
  value,
  options = { day: 'numeric', month: 'short', year: 'numeric' }
) =>
  value ? new Intl.DateTimeFormat('en-IN', options).format(new Date(value)) : '—';

function StatusBadge({ status }) {
  return (
    <span className={`tracker-status tracker-status-${STATUS_CLASSES[status] || 'neutral'}`}>
      {status}
    </span>
  );
}

function DetailPanel({ record, onClose }) {
  const [copied, setCopied] = useState(false);
  if (!record) return null;

  const copyId = async () => {
    if (record.trackingId) {
      await navigator.clipboard.writeText(record.trackingId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const details = Object.entries(record.metadata || {}).filter(
    ([key]) => key !== 'nextAction'
  );

  return (
    <div
      className="tracker-drawer-backdrop"
      onMouseDown={onClose}
      role="presentation"
    >
      <aside
        className="tracker-drawer"
        onMouseDown={(event) => event.stopPropagation()}
        aria-label="Tracking record details"
      >
        <div className="tracker-drawer-header">
          <div>
            <span className="tracker-type-label">{TYPE_LABELS[record.type] || 'Record'}</span>
            <h2>{record.title}</h2>
            <div className="drawer-tracking-id-row">
              <code>{record.trackingId}</code>
              <button
                type="button"
                className="btn-copy-mini"
                onClick={copyId}
                title="Copy tracking ID"
              >
                {copied ? <Check size={13} color="#059669" /> : <Copy size={13} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close details panel"
            className="btn-drawer-close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="tracker-detail-overview">
          <div className="overview-status-item">
            <span className="overview-sublabel">Current Status</span>
            <StatusBadge status={record.status} />
          </div>
          <div className="overview-time-item">
            <span className="overview-sublabel">Last updated</span>
            <strong>
              {formatDate(record.updatedAt, {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
              })}
            </strong>
          </div>
        </div>

        {record.metadata?.nextAction && (
          <section className="tracker-next-action">
            <Clock3 size={20} style={{ flexShrink: 0 }} />
            <div>
              <strong>Next Action Required</strong>
              <p>{record.metadata.nextAction}</p>
            </div>
          </section>
        )}

        <section className="tracker-detail-section">
          <h3>Application Details</h3>
          <dl>
            <div>
              <dt>Category</dt>
              <dd>{record.category || 'N/A'}</dd>
            </div>
            <div>
              <dt>Source Module</dt>
              <dd>{record.sourceModule || 'Portal'}</dd>
            </div>
            {record.referenceId && (
              <div>
                <dt>Reference ID</dt>
                <dd>{record.referenceId}</dd>
              </div>
            )}
            {details.map(([key, value]) => (
              <div key={key}>
                <dt>
                  {key
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/^./, (letter) => letter.toUpperCase())}
                </dt>
                <dd>
                  {Array.isArray(value)
                    ? value.join(', ')
                    : value instanceof Object
                    ? JSON.stringify(value)
                    : String(value)}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="tracker-detail-section">
          <h3>Tracking Timeline</h3>
          <ol className="tracker-timeline">
            {[...(record.timeline || [])].reverse().map((event) => (
              <li key={event._id || `${event.status}-${event.occurredAt}`}>
                <i />
                <div>
                  <div className="timeline-top-row">
                    <StatusBadge status={event.status} />
                    <time>
                      {formatDate(event.occurredAt, {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </time>
                  </div>
                  <p>{event.note}</p>
                  <small>Action taken by: {event.actor || 'System'}</small>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </aside>
    </div>
  );
}

export default function ApplicationTrackerPage() {
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [recordsResponse, summaryResponse] = await Promise.all([
        trackingApi.getAll(),
        trackingApi.getSummary(),
      ]);
      setRecords(recordsResponse.records || []);
      setSummary(summaryResponse.summary || null);
    } catch (err) {
      setError(err.message || 'Unable to load your tracking records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filteredRecords = useMemo(
    () =>
      records.filter((record) => {
        const needle = search.trim().toLowerCase();
        return (
          (!type || record.type === type) &&
          (!status || record.status === status) &&
          (!needle ||
            record.trackingId.toLowerCase().includes(needle) ||
            record.title.toLowerCase().includes(needle))
        );
      }),
    [records, type, status, search]
  );

  const openRecord = async (record) => {
    try {
      const result = await trackingApi.getOne(record.trackingId);
      setSelected(result.record);
    } catch (err) {
      setError(err.message || 'Unable to load this record.');
    }
  };

  return (
    <div className="tracker-page">
      <div className="gov-top-ribbon" />
      <div className="app-background-pattern" />

      {/* Official Top Navigation Bar */}
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
          <em>Personal Service Hub</em>
        </div>

        <button
          type="button"
          className="tracker-refresh-btn"
          onClick={load}
          aria-label="Refresh records"
        >
          <RefreshCw size={15} />
          <span>Refresh</span>
        </button>
      </header>

      {/* Main Records Container */}
      <main className="tracker-main">
        <section className="tracker-hero">
          <div>
            <p>PERSONAL SERVICE HUB</p>
            <h1>My Applications &amp; Reports</h1>
            <span>
              Track every civic report, scheme request, RTI, scholarship, and service application in one place.
            </span>
          </div>
          <ClipboardList size={54} />
        </section>

        {/* Summary Metrics Grid */}
        <section className="tracker-summary-grid" aria-label="Tracking summary metrics">
          {[
            ['Total Applications', summary?.total, FolderOpen, 'blue'],
            ['Active / In Progress', summary?.active, LoaderCircle, 'purple'],
            ['Completed / Resolved', summary?.completed, CheckCircle2, 'green'],
            ['Pending Citizen Action', summary?.pendingAction, Clock3, 'orange'],
          ].map(([label, value, Icon, tone]) => (
            <article className="tracker-summary-card" key={label}>
              <span className={`tracker-summary-icon ${tone}`}>
                <Icon size={22} />
              </span>
              <div className="summary-card-text">
                <strong>{loading ? '—' : value ?? 0}</strong>
                <p>{label}</p>
              </div>
            </article>
          ))}
        </section>

        {/* Records List Section */}
        <section className="tracker-records-section">
          <div className="tracker-section-heading">
            <div>
              <h2>All Records</h2>
              <p>
                {loading
                  ? 'Loading your records…'
                  : `${filteredRecords.length} record${
                      filteredRecords.length === 1 ? '' : 's'
                    } found`}
              </p>
            </div>
          </div>

          <div className="tracker-filters">
            <label className="tracker-search">
              <Search size={18} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by tracking ID or title..."
              />
            </label>

            <select
              value={type}
              onChange={(event) => setType(event.target.value)}
              aria-label="Filter by application type"
            >
              <option value="">All Application Types</option>
              {Object.entries(TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>

            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              aria-label="Filter by status"
            >
              <option value="">All Statuses</option>
              {Object.keys(STATUS_CLASSES).map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="tracker-error" role="alert">
              <span>{error}</span>
              <button type="button" onClick={load}>
                Try again
              </button>
            </div>
          )}

          {loading ? (
            <div className="tracker-loading">
              <LoaderCircle size={28} />
              <span>Loading your applications and grievance reports…</span>
            </div>
          ) : filteredRecords.length ? (
            <div className="tracker-record-list">
              {filteredRecords.map((record) => (
                <button
                  className="tracker-record"
                  type="button"
                  key={record._id}
                  onClick={() => openRecord(record)}
                >
                  <span className="tracker-record-symbol">
                    <FileSearch size={20} />
                  </span>
                  <div className="tracker-record-main">
                    <div className="tracker-record-title">
                      <h3>{record.title}</h3>
                      <StatusBadge status={record.status} />
                    </div>
                    <p>
                      <b>{TYPE_LABELS[record.type] || record.type}</b>
                      <span>•</span>
                      {record.category}
                      <span>•</span>
                      <code>{record.trackingId}</code>
                    </p>
                    <small>Created {formatDate(record.createdAt)}</small>
                  </div>
                  <ChevronRight className="tracker-chevron" size={20} />
                </button>
              ))}
            </div>
          ) : (
            <section className="tracker-empty">
              <FolderOpen size={42} />
              <h3>No matching records</h3>
              <p>
                {records.length
                  ? 'Try changing your filter settings or search phrase.'
                  : 'Submit a civic report or scheme application and it will automatically appear here for real-time tracking.'}
              </p>
              {!records.length && (
                <div className="empty-state-actions">
                  <button
                    type="button"
                    onClick={() => navigate('/report-civic-problem')}
                  >
                    Report Civic Problem
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/scheme-eligibility')}
                  >
                    Find Schemes
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/rti-generator')}
                  >
                    Generate RTI
                  </button>
                </div>
              )}
            </section>
          )}
        </section>
      </main>

      <DetailPanel record={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
