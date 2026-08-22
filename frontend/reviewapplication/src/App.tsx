import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Check,
  Copy,
  Download,
  FileText,
  HelpCircle,
  Landmark,
  LoaderCircle,
  Paperclip,
  Pencil,
  Printer,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Draft = {
  fullName: string;
  fatherSpouseName: string;
  address: string;
  phone: string;
  email: string;
  department: string;
  departmentAddress: string;
  locality: string;
  ward: string;
  financialYear: string;
  street: string;
  place: string;
  date: string;
};

type Attachment = {
  name: string;
  size: number;
  type: string;
  storagePath?: string;
};

const draftId = '00000000-0000-0000-0000-000000000001';

const initialDraft: Draft = {
  fullName: '[User Full Name Placeholder]',
  fatherSpouseName: '[Father/Spouse Name Placeholder]',
  address: '[Applicant Full Address Placeholder]',
  phone: '[Applicant Phone Number]',
  email: '[Applicant Email]',
  department: '[Department/Authority Name Placeholder]',
  departmentAddress: '[Department Address Placeholder]',
  locality: '[Locality Name]',
  ward: '[Number]',
  financialYear: '2023-2024',
  street: '[Street Name]',
  place: '[City Placeholder]',
  date: '[Current Date Placeholder]',
};

const formFields: [keyof Draft, string, string][] = [
  ['fullName', 'Full name', 'Enter your name as it appears on your identity document'],
  ['fatherSpouseName', 'Father or spouse name', 'Enter father or spouse name'],
  ['address', 'Permanent address', 'House number, street, locality'],
  ['phone', 'Contact number', '10-digit mobile number'],
  ['email', 'Email address', 'name@example.com'],
  ['department', 'Department / authority', 'Public authority receiving this application'],
  ['departmentAddress', 'Department address', 'Office address with PIN code'],
  ['locality', 'Locality', 'Area or locality'],
  ['ward', 'Ward number', 'Ward or constituency number'],
  ['financialYear', 'Financial year', 'For example, 2025-2026'],
  ['street', 'Street name', 'Road or street connected to your request'],
  ['place', 'Place', 'City or town'],
  ['date', 'Date', 'Application date'],
];

function displayValue(value: string, fallback = 'Not provided') {
  return value.trim() || fallback;
}

function App() {
  const [draft, setDraft] = useState<Draft>(initialDraft);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [notice, setNotice] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  const documentText = useMemo(
    () => `APPLICATION UNDER THE RIGHT TO INFORMATION ACT, 2005

To,
The Public Information Officer,
${displayValue(draft.department)}
${displayValue(draft.departmentAddress)}
[City, State, PIN Placeholder]

Subject: Request for information regarding road repairs and infrastructure development in ${displayValue(draft.locality)} under section 6(1) of the RTI Act.

1. Full Name of the Applicant: ${displayValue(draft.fullName)}
2. Father's/Spouse Name: ${displayValue(draft.fatherSpouseName)}
3. Permanent Address: ${displayValue(draft.address)}
4. Contact Number: ${displayValue(draft.phone)}
5. Email ID: ${displayValue(draft.email)}

6. Particulars of Information Required:
I kindly request you to provide the following information pertaining to the subject mentioned above:

a) Please provide a certified copy of the total budget allocated for road repairs in Ward ${displayValue(draft.ward)} for the financial year ${displayValue(draft.financialYear)}.

b) Provide details of the contractor(s) awarded the tender for repairing the main road in ${displayValue(draft.locality)}, including the tender amount and expected date of completion.

c) Supply a copy of the quality inspection report conducted on the recently completed patch works along ${displayValue(draft.street)}.

7. Application Fee Details: Attached Postal Order / DD No. [Number] dated [Date] for Rs. 10/- favoring [Accounts Officer Name].
8. Below Poverty Line (BPL): No

Attachments submitted with this application:
${attachments.length ? attachments.map((attachment, index) => `${index + 1}. ${attachment.name}`).join('\n') : 'None'}

Declaration:
I state that the information sought does not fall within the restrictions contained in Section 8 and 9 of the RTI Act and to the best of my knowledge it pertains to your office. I also state that I am a citizen of India and I am eligible to seek information under the Right to Information Act 2005.

Place: ${displayValue(draft.place)}
Date: ${displayValue(draft.date)}
(Signature of Applicant)`,
    [draft, attachments],
  );

  const requiredFields: (keyof Draft)[] = ['fullName', 'fatherSpouseName', 'address', 'phone', 'email', 'department', 'departmentAddress', 'place', 'date'];

  const updateDraft = (field: keyof Draft, value: string) => {
    setDraft((current) => ({ ...current, [field]: value }));
    setSaved(false);
  };

  const saveDraft = useCallback(async (nextDraft: Draft = draft) => {
    if (!supabase) {
      setNotice('Preview mode: configure Supabase to sync drafts');
      return;
    }
    setIsSaving(true);
    const { error } = await supabase.from('rti_drafts').upsert({
      id: draftId,
      ...nextDraft,
      attachments,
      status: 'draft',
      updated_at: new Date().toISOString(),
    });
    setIsSaving(false);
    if (error) {
      setNotice('Your changes are ready here, but could not be synced.');
      return;
    }
    setSaved(true);
    setNotice('Draft saved');
  }, [attachments, draft]);

  useEffect(() => {
    let active = true;
    const loadDraft = async () => {
      if (!supabase) return;
      const { data } = await supabase.from('rti_drafts').select('*').eq('id', draftId).maybeSingle();
      if (!active || !data) return;
      setDraft({
        fullName: data.full_name,
        fatherSpouseName: data.father_spouse_name,
        address: data.address,
        phone: data.phone,
        email: data.email,
        department: data.department,
        departmentAddress: data.department_address,
        locality: data.locality,
        ward: data.ward,
        financialYear: data.financial_year,
        street: data.street,
        place: data.place,
        date: data.application_date,
      });
      setAttachments(Array.isArray(data.attachments) ? data.attachments : []);
      setSaved(true);
    };
    void loadDraft();
    return () => {
      active = false;
    };
  }, []);

  const copyText = async () => {
    await navigator.clipboard.writeText(documentText);
    setNotice('Document text copied');
  };

  const validateBeforeDownload = () => {
    const missing = requiredFields.find((field) => !draft[field].trim());
    if (missing) {
      setIsEditing(true);
      setNotice('Complete all applicant, authority, place, and date fields before downloading');
      return false;
    }
    return true;
  };

  const addAttachments = async (files: FileList | null) => {
    if (!files) return;
    try {
      const selectedFiles = Array.from(files);
      const uploaded = await Promise.all(selectedFiles.map(async (file) => {
        if (!supabase) return { name: file.name, size: file.size, type: file.type };
        const storagePath = `${draftId}/${crypto.randomUUID()}-${file.name}`;
        const { error } = await supabase.storage.from('rti-attachments').upload(storagePath, file, { upsert: false });
        if (error) throw new Error(`Could not upload ${file.name}`);
        return { name: file.name, size: file.size, type: file.type, storagePath };
      }));
      setAttachments((current) => [...current, ...uploaded]);
      setSaved(false);
      setNotice(supabase ? 'Documents uploaded and attached to this application' : 'Documents attached in preview mode');
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Could not attach the selected documents');
    }
  };

  const downloadText = () => {
    if (!validateBeforeDownload()) return;
    const blob = new Blob([documentText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'rti-application.txt';
    link.click();
    URL.revokeObjectURL(url);
    setNotice('Text document downloaded');
  };

  const generatePdf = () => {
    if (!validateBeforeDownload()) return;
    window.print();
    setNotice('Print dialog opened — choose “Save as PDF” to finish');
  };

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-[#191c1e]">
      <header className="rti-masthead sticky top-0 z-20 border-b border-[#c9ccd5] bg-white/95 backdrop-blur print:hidden">
        <div className="rti-tricolor" aria-hidden="true"><span /><span /><span /></div>
        <div className="mx-auto flex h-16 max-w-[1100px] items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-3">
            <button aria-label="Go back" className="icon-button text-[#003fb1]" onClick={() => setNotice('You are already at the first preview step')}>
              <ArrowLeft size={20} strokeWidth={1.8} />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="rti-emblem" aria-hidden="true"><Landmark size={19} /></div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#626571]">Government services</p>
                <h1 className="text-[16px] font-bold leading-5 text-[#003fb1]">Right to Information</h1>
              </div>
            </div>
          </div>
          <div className="hidden items-center gap-3 md:flex">
            <div className="flex items-center gap-1.5">
              <span className="step-circle active">7</span>
              <span className="h-px w-8 bg-[#c9ccd5]" />
              <span className="step-circle">8</span>
            </div>
            <span className="text-sm font-medium text-[#626571]">Preview document</span>
          </div>
          <button aria-label="Help" className="icon-button text-[#626571]" onClick={() => setNotice('Review your details, then download or save your PDF')}>
            <HelpCircle size={20} strokeWidth={1.8} />
          </button>
        </div>
        <div className="mx-auto flex max-w-[1100px] justify-center pb-2 md:hidden">
          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#626571]">Step 7 of 8</span>
        </div>
      </header>

      <main className="rti-shell mx-auto flex w-full max-w-[1100px] flex-col items-center gap-8 px-4 py-8 pb-32 md:px-8 md:py-12 md:pb-10">
        <section className="max-w-2xl text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#b7d8c1] bg-[#f2faf4] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#176b3a]"><span className="h-1.5 w-1.5 rounded-full bg-[#e47728]" /> Final review</div>
          <h2 className="text-[25px] font-bold leading-8 tracking-[-0.02em] md:text-[32px] md:leading-10">Review Your Application</h2>
          <p className="mt-2 text-[16px] leading-6 text-[#626571] md:text-[18px] md:leading-7">Carefully review the final document before generating the PDF. This format complies with the Right to Information Act, 2005.</p>
        </section>

        {isEditing && (
          <section className="rti-editor w-full max-w-[800px] rounded border border-[#c9ccd5] bg-white p-5 shadow-sm print:hidden md:p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[#191c1e]">Update application details</p>
                <p className="mt-1 text-xs text-[#626571]">Your changes will appear in the document preview.</p>
              </div>
              <button className="text-sm font-semibold text-[#003fb1]" onClick={() => setIsEditing(false)}>Close</button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {formFields.map(([field, label, hint]) => (
                <label className="flex flex-col gap-1.5 text-sm font-semibold text-[#434654]" key={field} htmlFor={`rti-${field}`}>
                  {label}
                  <span className="text-[11px] font-normal text-[#626571]">{hint}</span>
                  <input id={`rti-${field}`} className="rounded border border-[#aeb2bf] bg-[#fbfcfd] px-3 py-2.5 font-normal text-[#191c1e] outline-none transition focus:border-[#003fb1] focus:ring-2 focus:ring-[#dbe1ff]" value={draft[field]} onChange={(event) => updateDraft(field, event.target.value)} />
                </label>
              ))}
            </div>
            <button className="mt-5 inline-flex items-center gap-2 rounded bg-[#003fb1] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#1a56db]" onClick={() => { void saveDraft(); }}>
              {isSaving ? <LoaderCircle className="animate-spin" size={16} /> : <Check size={16} />}
              Save changes
            </button>
            <div className="mt-6 border-t border-[#e2e5e9] pt-5">
              <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-[#176b3a]" htmlFor="rti-attachments">
                <Paperclip size={16} /> Attach supporting documents
                <input id="rti-attachments" className="sr-only" type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" onChange={(event) => { void addAttachments(event.target.files); }} />
              </label>
              <p className="mt-1 text-xs text-[#626571]">PDF, image, or Word files. Documents are listed in the application before export.</p>
              {attachments.length > 0 && <ul className="mt-3 grid gap-2 text-xs text-[#434654]">{attachments.map((attachment, index) => <li className="flex items-center justify-between rounded border border-[#d7e6da] bg-[#f5fbf6] px-3 py-2" key={`${attachment.name}-${index}`}><span className="flex min-w-0 items-center gap-2"><FileText size={14} className="shrink-0 text-[#176b3a]" /><span className="truncate">{attachment.name}</span></span><button type="button" className="ml-3 font-semibold text-[#b42318]" onClick={() => setAttachments((current) => current.filter((_, attachmentIndex) => attachmentIndex !== index))}>Remove</button></li>)}</ul>}
            </div>
          </section>
        )}

        <article className="document-paper w-full max-w-[800px] overflow-hidden rounded border border-[#c9ccd5] bg-white shadow-[0_10px_30px_rgba(25,28,30,0.06)]">
          <div className="flex items-center justify-between border-b border-[#c9ccd5] bg-[#edeef0] px-5 py-3 text-[10px] font-normal uppercase tracking-[0.08em] text-[#626571] md:px-6">
            <span className="flex items-center gap-1.5"><FileText size={14} /> Form-A (See Rule 3(1))</span>
            <span>Status: {saved ? 'Saved draft' : 'Draft'}</span>
          </div>
          <div className="document-content flex flex-col gap-6 p-6 text-[14px] leading-6 md:p-12 md:text-[16px]">
            <div className="mb-2 text-center">
              <h3 className="text-[14px] font-bold uppercase leading-5 tracking-[0.06em] underline md:text-[16px]">Application Under The Right To Information Act, 2005</h3>
            </div>
            <div className="flex flex-col gap-0.5">
              <p>To,</p><p className="font-bold">The Public Information Officer,</p><p>{displayValue(draft.department)}</p><p>{displayValue(draft.departmentAddress)}</p><p>[City, State, PIN Placeholder]</p>
            </div>
            <div className="flex gap-3"><p className="shrink-0 font-bold">Subject:</p><p className="underline decoration-[#aeb2bf] underline-offset-4">Request for information regarding road repairs and infrastructure development in {displayValue(draft.locality)} under section 6(1) of the RTI Act.</p></div>
            <div className="mt-2 flex flex-col gap-0.5">
              <p><strong>1. Full Name of the Applicant:</strong> {displayValue(draft.fullName)}</p><p><strong>2. Father&apos;s/Spouse Name:</strong> {displayValue(draft.fatherSpouseName)}</p><p><strong>3. Permanent Address:</strong> {displayValue(draft.address)}</p><p><strong>4. Contact Number:</strong> {displayValue(draft.phone)}</p><p><strong>5. Email ID:</strong> {displayValue(draft.email)}</p>
            </div>
            <div className="mt-2"><p className="mb-2 font-bold">6. Particulars of Information Required:</p><p className="mb-2">I kindly request you to provide the following information pertaining to the subject mentioned above:</p><div className="flex flex-col gap-3 pl-5"><div className="flex gap-2"><strong>a)</strong><p>Please provide a certified copy of the total budget allocated for road repairs in Ward {displayValue(draft.ward)} for the financial year {displayValue(draft.financialYear)}.</p></div><div className="flex gap-2"><strong>b)</strong><p>Provide details of the contractor(s) awarded the tender for repairing the main road in {displayValue(draft.locality)}, including the tender amount and expected date of completion.</p></div><div className="flex gap-2"><strong>c)</strong><p>Supply a copy of the quality inspection report conducted on the recently completed patch works along {displayValue(draft.street)}.</p></div></div></div>
            <div className="mt-2 flex flex-col gap-1"><p><strong>7. Application Fee Details:</strong> Attached Postal Order / DD No. [Number] dated [Date] for Rs. 10/- favoring [Accounts Officer Name].</p><p><strong>8. Below Poverty Line (BPL):</strong> No</p></div>
            <div className="mt-2 border-t border-[#e2e5e9] pt-4"><p className="mb-2 font-bold">Attachments submitted:</p>{attachments.length ? <ul className="list-disc pl-5">{attachments.map((attachment, index) => <li key={`${attachment.name}-preview-${index}`}>{attachment.name}</li>)}</ul> : <p className="text-[#626571]">No supporting documents attached.</p>}</div>
            <div className="mt-3 border-t border-dashed border-[#c9ccd5] pt-5"><p className="mb-1 font-bold">Declaration:</p><p className="text-[12px] leading-5">I state that the information sought does not fall within the restrictions contained in Section 8 and 9 of the RTI Act and to the best of my knowledge it pertains to your office. I also state that I am a citizen of India and I am eligible to seek information under the Right to Information Act 2005.</p></div>
            <div className="mt-6 flex items-end justify-between gap-6"><div><p>Place: {displayValue(draft.place)}</p><p>Date: {displayValue(draft.date)}</p></div><div className="flex flex-col items-center gap-1"><div className="h-10 w-32 border-b border-[#8b8f9b]" /><p className="text-xs">(Signature of Applicant)</p></div></div>
          </div>
        </article>

        <div className="flex w-full max-w-[800px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between print:hidden">
          <div className="flex w-full gap-3 sm:w-auto"><button className="action-button" onClick={() => setIsEditing((current) => !current)}><Pencil size={16} /> {isEditing ? 'Close editor' : 'Edit details'}</button><button className="action-button" onClick={() => { void copyText(); }}><Copy size={16} /> Copy text</button><button className="action-button" onClick={downloadText}><Download size={16} /> Download</button></div>
          <button className="primary-button w-full sm:w-auto" onClick={generatePdf}><Printer size={16} /> Generate PDF</button>
        </div>
        <div aria-live="polite" className="fixed bottom-5 left-1/2 z-30 -translate-x-1/2 rounded-full bg-[#191c1e] px-4 py-2 text-xs font-semibold text-white shadow-lg transition print:hidden" style={{ opacity: notice ? 1 : 0 }}>{notice}</div>
      </main>
    </div>
  );
}

export default App;
