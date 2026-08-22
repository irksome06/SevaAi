import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Copy, Download, ExternalLink, FileText, Pencil, Printer } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { rtiApi } from '../services/api';

const fields = [
  ['fullName', 'Full name'], ['address', 'Permanent address'], ['phone', 'Contact number'], ['email', 'Email address'],
  ['department', 'Department / authority'], ['departmentAddress', 'Department address'], ['locality', 'Locality'],
  ['ward', 'Ward number'], ['financialYear', 'Financial year'], ['street', 'Street name'], ['place', 'Place'], ['date', 'Date'],
];

const valueOrBlank = (value) => value?.trim() || '[Not provided]';
const FALLBACK_RTI_PORTAL = 'https://rtionline.gov.in/';

export default function RtiGeneratorPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [editing, setEditing] = useState(true);
  const [notice, setNotice] = useState('');
  const [officialPortal, setOfficialPortal] = useState(FALLBACK_RTI_PORTAL);
  const [draft, setDraft] = useState(() => ({
    fullName: user?.fullName || '', address: '', phone: user?.phone || '', email: user?.email || '',
    department: '', departmentAddress: '', locality: '', ward: '', financialYear: '2025-2026', street: '',
    place: '', date: new Date().toLocaleDateString('en-GB'),
  }));

  const documentText = useMemo(() => `APPLICATION UNDER THE RIGHT TO INFORMATION ACT, 2005

To,
The Public Information Officer,
${valueOrBlank(draft.department)}
${valueOrBlank(draft.departmentAddress)}

Subject: Request for information regarding road repairs and infrastructure development in ${valueOrBlank(draft.locality)} under Section 6(1) of the RTI Act.

1. Full Name of the Applicant: ${valueOrBlank(draft.fullName)}
2. Permanent Address: ${valueOrBlank(draft.address)}
3. Contact Number: ${valueOrBlank(draft.phone)}
4. Email ID: ${valueOrBlank(draft.email)}

5. Particulars of Information Required:
I kindly request the following information:

a) Please provide a certified copy of the total budget allocated for road repairs in Ward ${valueOrBlank(draft.ward)} for the financial year ${valueOrBlank(draft.financialYear)}.

b) Provide details of contractor(s) awarded the tender for repairing the main road in ${valueOrBlank(draft.locality)}, including the tender amount and expected date of completion.

c) Supply a copy of the quality inspection report for patch works along ${valueOrBlank(draft.street)}.

6. Application Fee Details: Attached Postal Order / DD as applicable for Rs. 10/-.
7. Below Poverty Line (BPL): No

Declaration:
I state that the information sought does not fall within the restrictions contained in Sections 8 and 9 of the RTI Act, 2005. I am a citizen of India and am eligible to seek this information.

Place: ${valueOrBlank(draft.place)}
Date: ${valueOrBlank(draft.date)}

(Signature of Applicant)`, [draft]);

  const update = (key, value) => setDraft((current) => ({ ...current, [key]: value }));
  const copy = async () => { await navigator.clipboard.writeText(documentText); setNotice('RTI application copied to clipboard.'); };
  const download = () => { const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([documentText], { type: 'text/plain;charset=utf-8' })); link.download = 'rti-application.txt'; link.click(); URL.revokeObjectURL(link.href); setNotice('RTI application downloaded.'); };
  const applyOnline = async () => {
    try {
      const response = await rtiApi.getOfficialPortal();
      const portalUrl = response.url || FALLBACK_RTI_PORTAL;
      setOfficialPortal(portalUrl);
      window.open(portalUrl, '_blank', 'noopener,noreferrer');
    } catch {
      window.open(officialPortal, '_blank', 'noopener,noreferrer');
      setNotice('Opening the official RTI portal. Download your draft first.');
    }
  };

  return <div className="rti-page">
    <header className="rti-header print-hide"><button type="button" onClick={() => navigate('/dashboard')}><ArrowLeft size={18} /> Dashboard</button><div><strong>RTI Mitra</strong><span>Application assistant</span></div><span>Step 7 of 8 · Review</span></header>
    <main className="rti-main">
      <section className="rti-intro"><p>FINAL REVIEW</p><h1>Review your RTI application</h1><span>Complete your details, review the document, and save it as a PDF when ready.</span></section>
      {editing && <section className="rti-editor print-hide"><div><h2>Application details</h2><p>These details update the document preview immediately.</p></div><div className="rti-field-grid">{fields.map(([key, label]) => <label key={key}>{label}<input value={draft[key]} onChange={(event) => update(key, event.target.value)} /></label>)}</div></section>}
      <article className="rti-paper"><div className="rti-paper-bar"><span><FileText size={15} /> Form-A (See Rule 3(1))</span><span>Draft</span></div><pre>{documentText}</pre></article>
      <section className="rti-actions print-hide"><div><button type="button" onClick={() => setEditing((current) => !current)}><Pencil size={16} /> {editing ? 'Close editor' : 'Edit details'}</button><button type="button" onClick={copy}><Copy size={16} /> Copy text</button><button type="button" onClick={download}><Download size={16} /> Download</button></div><div className="rti-primary-actions"><button type="button" className="rti-primary" onClick={() => window.print()}><Printer size={16} /> Generate PDF</button><button type="button" className="rti-apply" onClick={applyOnline}><ExternalLink size={16} /> Apply on official portal</button></div></section>
    </main>
    {notice && <div className="rti-notice print-hide" role="status">{notice}</div>}
  </div>;
}
