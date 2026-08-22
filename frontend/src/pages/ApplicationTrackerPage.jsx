import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, ChevronRight, ClipboardList, Clock3, ExternalLink, FileSearch, FolderOpen, LoaderCircle, Search, ShieldCheck, X } from 'lucide-react';
import { trackingApi } from '../services/api';
import '../styles/application-tracker.css';

const TYPE_LABELS = {
  civic_report: 'Civic report', scheme_application: 'Scheme application', rti_application: 'RTI application',
  scholarship_application: 'Scholarship application', other: 'Service request',
};

const STATUS_CLASSES = {
  Draft: 'neutral', Submitted: 'blue', Received: 'blue', 'Under Review': 'amber', Assigned: 'purple',
  'In Progress': 'purple', 'Action Taken': 'green', Approved: 'green', Rejected: 'red', Resolved: 'green',
  Completed: 'green', Closed: 'neutral', 'Pending Action': 'orange',
};

const formatDate = (value, options = { day: 'numeric', month: 'short', year: 'numeric' }) =>
  value ? new Intl.DateTimeFormat('en-IN', options).format(new Date(value)) : '—';

function StatusBadge({ status }) {
  return <span className={`tracker-status tracker-status-${STATUS_CLASSES[status] || 'neutral'}`}>{status}</span>;
}

function DetailPanel({ record, onClose }) {
  if (!record) return null;
  const details = Object.entries(record.metadata || {}).filter(([key]) => key !== 'nextAction');
  return <div className="tracker-drawer-backdrop" onMouseDown={onClose} role="presentation">
    <aside className="tracker-drawer" onMouseDown={(event) => event.stopPropagation()} aria-label="Tracking record details">
      <div className="tracker-drawer-header"><div><span className="tracker-type-label">{TYPE_LABELS[record.type]}</span><h2>{record.title}</h2><code>{record.trackingId}</code></div><button type="button" onClick={onClose} aria-label="Close details"><X size={20} /></button></div>
      <div className="tracker-detail-overview"><StatusBadge status={record.status} /><div><span>Last updated</span><strong>{formatDate(record.updatedAt, { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })}</strong></div></div>
      {record.metadata?.nextAction && <section className="tracker-next-action"><Clock3 size={19} /><div><strong>Next action</strong><p>{record.metadata.nextAction}</p></div></section>}
      <section className="tracker-detail-section"><h3>Application details</h3><dl><div><dt>Category</dt><dd>{record.category}</dd></div><div><dt>Source</dt><dd>{record.sourceModule}</dd></div>{record.referenceId && <div><dt>Reference ID</dt><dd>{record.referenceId}</dd></div>}{details.map(([key, value]) => <div key={key}><dt>{key.replace(/([A-Z])/g, ' $1').replace(/^./, (letter) => letter.toUpperCase())}</dt><dd>{Array.isArray(value) ? value.join(', ') : value instanceof Object ? JSON.stringify(value) : String(value)}</dd></div>)}</dl></section>
      <section className="tracker-detail-section"><h3>Tracking timeline</h3><ol className="tracker-timeline">{[...(record.timeline || [])].reverse().map((event) => <li key={event._id || `${event.status}-${event.occurredAt}`}><i /><div><div><StatusBadge status={event.status} /><time>{formatDate(event.occurredAt, { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })}</time></div><p>{event.note}</p><small>{event.actor}</small></div></li>)}</ol></section>
    </aside>
  </div>;
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
    setLoading(true); setError('');
    try {
      const [recordsResponse, summaryResponse] = await Promise.all([trackingApi.getAll(), trackingApi.getSummary()]);
      setRecords(recordsResponse.records || []); setSummary(summaryResponse.summary || null);
    } catch (err) { setError(err.message || 'Unable to load your tracking records.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const filteredRecords = useMemo(() => records.filter((record) => {
    const needle = search.trim().toLowerCase();
    return (!type || record.type === type) && (!status || record.status === status) && (!needle || record.trackingId.toLowerCase().includes(needle) || record.title.toLowerCase().includes(needle));
  }), [records, type, status, search]);

  const openRecord = async (record) => {
    try { const result = await trackingApi.getOne(record.trackingId); setSelected(result.record); }
    catch (err) { setError(err.message || 'Unable to load this record.'); }
  };

  return <div className="tracker-page"><div className="app-background-pattern" />
    <header className="tracker-topbar"><button type="button" onClick={() => navigate('/dashboard')}><ArrowLeft size={18} /> Dashboard</button><div className="tracker-brand"><ShieldCheck size={23} /><span>SevaAI</span><em>My records</em></div><button type="button" className="tracker-help" onClick={load}>Refresh</button></header>
    <main className="tracker-main">
      <section className="tracker-hero"><div><p>PERSONAL SERVICE HUB</p><h1>My Applications &amp; Reports</h1><span>Track every civic report, scheme request, RTI, scholarship, and service application in one place.</span></div><ClipboardList size={56} /></section>
      <section className="tracker-summary-grid" aria-label="Tracking summary">{[
        ['Total', summary?.total, FolderOpen, 'blue'], ['Active / In Progress', summary?.active, LoaderCircle, 'purple'], ['Completed / Resolved', summary?.completed, CheckCircle2, 'green'], ['Pending Action', summary?.pendingAction, Clock3, 'orange'],
      ].map(([label, value, Icon, tone]) => <article className="tracker-summary-card" key={label}><span className={`tracker-summary-icon ${tone}`}><Icon size={21} /></span><div><strong>{loading ? '—' : value ?? 0}</strong><p>{label}</p></div></article>)}</section>
      <section className="tracker-records-section"><div className="tracker-section-heading"><div><h2>All records</h2><p>{loading ? 'Loading your records…' : `${filteredRecords.length} record${filteredRecords.length === 1 ? '' : 's'} shown`}</p></div></div>
        <div className="tracker-filters"><label className="tracker-search"><Search size={18} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search tracking ID or title" /></label><select value={type} onChange={(event) => setType(event.target.value)} aria-label="Filter by type"><option value="">All types</option>{Object.entries(TYPE_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter by status"><option value="">All statuses</option>{Object.keys(STATUS_CLASSES).map((item) => <option key={item}>{item}</option>)}</select></div>
        {error && <div className="tracker-error">{error}<button type="button" onClick={load}>Try again</button></div>}
        {loading ? <div className="tracker-loading"><LoaderCircle size={25} /> Loading applications and reports…</div> : filteredRecords.length ? <div className="tracker-record-list">{filteredRecords.map((record) => <button className="tracker-record" type="button" key={record._id} onClick={() => openRecord(record)}><span className="tracker-record-symbol"><FileSearch size={20} /></span><div className="tracker-record-main"><div className="tracker-record-title"><h3>{record.title}</h3><StatusBadge status={record.status} /></div><p><b>{TYPE_LABELS[record.type]}</b><span>•</span>{record.category}<span>•</span>{record.trackingId}</p><small>Created {formatDate(record.createdAt)}</small></div><ChevronRight className="tracker-chevron" size={21} /></button>)}</div> : <section className="tracker-empty"><FolderOpen size={38} /><h3>No matching records</h3><p>{records.length ? 'Try changing your filters or search phrase.' : 'Start a request and it will appear here for easy tracking.'}</p>{!records.length && <div><button type="button" onClick={() => navigate('/report-civic-problem')}>Report Civic Problem</button><button type="button" onClick={() => navigate('/dashboard')}>Find Schemes</button><button type="button" onClick={() => navigate('/rti-generator')}>Generate RTI</button></div>}</section>}
      </section>
    </main><DetailPanel record={selected} onClose={() => setSelected(null)} />
  </div>;
}
