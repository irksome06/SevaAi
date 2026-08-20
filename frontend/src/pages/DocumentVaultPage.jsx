import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, File, FileImage, FileText, FolderLock, LockKeyhole,
  Search, ShieldCheck, Trash2, UploadCloud,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const STORAGE_KEY = 'sevaai-document-vault';
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_TYPES = new Set([
  'application/pdf', 'image/jpeg', 'image/png', 'image/webp',
  'text/plain', 'text/csv', 'application/json',
]);

const formatFileSize = (bytes) => {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const fileIcon = (type) => {
  if (type.startsWith('image/')) return FileImage;
  if (type === 'application/pdf') return FileText;
  return File;
};

const getSavedDocuments = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
};

export default function DocumentVaultPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const [documents, setDocuments] = useState(getSavedDocuments);
  const [query, setQuery] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
  }, [documents]);

  const visibleDocuments = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return needle ? documents.filter((document) => document.name.toLowerCase().includes(needle)) : documents;
  }, [documents, query]);

  const addFiles = (fileList) => {
    const files = Array.from(fileList || []);
    const validFiles = files.filter((file) => ACCEPTED_TYPES.has(file.type) && file.size <= MAX_FILE_SIZE);
    const rejected = files.length - validFiles.length;
    if (!validFiles.length) {
      setNotice('Choose a PDF, image, TXT, CSV, or JSON file up to 5 MB.');
      return;
    }
    const newDocuments = validFiles.map((file) => ({
      id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
      name: file.name,
      type: file.type,
      size: file.size,
      uploadedAt: new Date().toISOString(),
    }));
    setDocuments((current) => [...newDocuments, ...current]);
    setNotice(rejected ? `${validFiles.length} document(s) added. ${rejected} unsupported or oversized file(s) were skipped.` : `${validFiles.length} document(s) added to your local vault.`);
  };

  const removeDocument = (id) => {
    setDocuments((current) => current.filter((document) => document.id !== id));
    setNotice('Document removed from this browser vault.');
  };

  return (
    <div className="vault-page">
      <header className="vault-header">
        <div className="vault-header-inner">
          <button type="button" className="vault-back-button" onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={18} /> Back to dashboard
          </button>
          <div className="vault-identity"><FolderLock size={20} /> SevaAI Document Vault</div>
          <div className="vault-user">{user?.fullName || 'Citizen'}</div>
        </div>
      </header>

      <main className="vault-main">
        <section className="vault-hero">
          <div className="vault-hero-icon"><LockKeyhole size={30} /></div>
          <div>
            <p className="vault-kicker"><ShieldCheck size={15} /> Private on this device</p>
            <h1>Keep your important documents organised</h1>
            <p>Save a private index of your civic documents, applications, IDs, and receipts. Files stay on this browser and are not uploaded to SevaAI.</p>
          </div>
        </section>

        <section className="vault-upload-card">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.webp,.txt,.csv,.json"
            onChange={(event) => { addFiles(event.target.files); event.target.value = ''; }}
            hidden
          />
          <div
            className={`vault-dropzone ${isDragging ? 'vault-dropzone-active' : ''}`}
            onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(event) => { event.preventDefault(); setIsDragging(false); addFiles(event.dataTransfer.files); }}
          >
            <UploadCloud size={30} />
            <h2>Upload documents</h2>
            <p>Drag files here, or select files from your device.</p>
            <button type="button" className="vault-primary-button" onClick={() => fileInputRef.current?.click()}>Choose files</button>
            <span>PDF, JPG, PNG, WEBP, TXT, CSV, or JSON · maximum 5 MB each</span>
          </div>
          {notice && <p className="vault-notice" role="status">{notice}</p>}
        </section>

        <section className="vault-documents-section">
          <div className="vault-section-heading">
            <div>
              <h2>Your documents</h2>
              <p>{documents.length} document{documents.length === 1 ? '' : 's'} indexed on this device</p>
            </div>
            <label className="vault-search"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search documents" /></label>
          </div>

          {visibleDocuments.length ? (
            <div className="vault-document-list">
              {visibleDocuments.map((document) => {
                const Icon = fileIcon(document.type);
                return (
                  <article className="vault-document-row" key={document.id}>
                    <div className="vault-file-icon"><Icon size={22} /></div>
                    <div className="vault-document-info"><h3>{document.name}</h3><p>{formatFileSize(document.size)} · Added {new Date(document.uploadedAt).toLocaleDateString()}</p></div>
                    <span className="vault-local-badge"><LockKeyhole size={13} /> Local</span>
                    <button type="button" className="vault-delete-button" onClick={() => removeDocument(document.id)} aria-label={`Remove ${document.name}`}><Trash2 size={18} /></button>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="vault-empty-state"><FolderLock size={36} /><h3>{query ? 'No matching documents' : 'Your vault is empty'}</h3><p>{query ? 'Try a different document name.' : 'Add your first document to create a private, organised record.'}</p></div>
          )}
        </section>
      </main>
    </div>
  );
}
