import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  File,
  FileImage,
  FileText,
  FolderLock,
  LockKeyhole,
  Search,
  ShieldCheck,
  Trash2,
  UploadCloud,
  CheckCircle2,
  Info,
  Shield,
  FileSpreadsheet,
  FileCode
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import '../styles/document-vault.css';

const STORAGE_KEY = 'sevaai-document-vault';
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'text/plain',
  'text/csv',
  'application/json',
]);

const formatFileSize = (bytes) => {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const fileIcon = (type) => {
  if (type.startsWith('image/')) return FileImage;
  if (type === 'application/pdf') return FileText;
  if (type === 'text/csv') return FileSpreadsheet;
  if (type === 'application/json') return FileCode;
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
    return needle
      ? documents.filter((document) => document.name.toLowerCase().includes(needle))
      : documents;
  }, [documents, query]);

  const addFiles = (fileList) => {
    const files = Array.from(fileList || []);
    const validFiles = files.filter(
      (file) => ACCEPTED_TYPES.has(file.type) && file.size <= MAX_FILE_SIZE
    );
    const rejected = files.length - validFiles.length;
    if (!validFiles.length) {
      setNotice('Please select valid PDF, image, TXT, CSV, or JSON files up to 5 MB.');
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
    setNotice(
      rejected
        ? `${validFiles.length} document(s) added. ${rejected} unsupported or oversized file(s) were skipped.`
        : `${validFiles.length} document(s) successfully indexed in your private device vault.`
    );
  };

  const removeDocument = (id) => {
    setDocuments((current) => current.filter((document) => document.id !== id));
    setNotice('Document removed from this browser vault.');
  };

  return (
    <div className="vault-page">
      <div className="gov-top-ribbon" />
      <div className="app-background-pattern" />

      {/* Top Navigation */}
      <header className="vault-header">
        <div className="vault-header-inner">
          <button
            type="button"
            className="vault-back-button"
            onClick={() => navigate('/dashboard')}
            aria-label="Back to dashboard"
          >
            <ArrowLeft size={18} />
            <span>Dashboard</span>
          </button>

          <div className="vault-identity">
            <div className="vault-emblem">
              <Shield size={18} strokeWidth={2.4} />
            </div>
            <div>
              <strong>SevaAI</strong>
              <span>Citizen Document Vault</span>
            </div>
          </div>

          <div className="vault-user-badge">
            <ShieldCheck size={16} />
            <span>{user?.fullName || 'Citizen Session'}</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="vault-main">
        {/* Privacy Hero Banner */}
        <section className="vault-hero">
          <div className="vault-hero-icon">
            <LockKeyhole size={30} />
          </div>
          <div className="vault-hero-text">
            <p className="vault-kicker">
              <ShieldCheck size={14} /> Local-Only Privacy Guarantee
            </p>
            <h1>Keep Your Important Documents Organised</h1>
            <p>
              Save a private, searchable index of your citizen IDs, application receipts, ration cards, and welfare certificates. All files stay strictly on this browser and are never transmitted to external cloud servers.
            </p>
          </div>
        </section>

        {/* Upload Zone */}
        <section className="vault-upload-card">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.jpg,.jpeg,.png,.webp,.txt,.csv,.json"
            onChange={(event) => {
              addFiles(event.target.files);
              event.target.value = '';
            }}
            hidden
          />
          <div
            className={`vault-dropzone ${isDragging ? 'vault-dropzone-active' : ''}`}
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setIsDragging(false);
              addFiles(event.dataTransfer.files);
            }}
          >
            <div className="dropzone-icon-circle">
              <UploadCloud size={28} />
            </div>
            <h2>Upload &amp; Index Documents</h2>
            <p>Drag and drop your files here, or browse from your device.</p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => fileInputRef.current?.click()}
            >
              Choose Files from Device
            </button>
            <span className="dropzone-hint">
              Supported formats: PDF, JPG, PNG, WEBP, TXT, CSV, JSON · Maximum 5 MB each
            </span>
          </div>

          {notice && (
            <div className="vault-notice" role="status">
              <Info size={18} style={{ flexShrink: 0 }} />
              <span>{notice}</span>
            </div>
          )}
        </section>

        {/* Documents Collection */}
        <section className="vault-documents-section">
          <div className="vault-section-heading">
            <div>
              <h2>Your Indexed Documents</h2>
              <p>
                {documents.length} document{documents.length === 1 ? '' : 's'} stored privately on this device
              </p>
            </div>

            <label className="vault-search">
              <Search size={17} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search indexed documents..."
              />
            </label>
          </div>

          {visibleDocuments.length ? (
            <div className="vault-document-list">
              {visibleDocuments.map((document) => {
                const Icon = fileIcon(document.type);
                return (
                  <article className="vault-document-row" key={document.id}>
                    <div className="vault-file-icon">
                      <Icon size={22} />
                    </div>
                    <div className="vault-document-info">
                      <h3>{document.name}</h3>
                      <p>
                        {formatFileSize(document.size)} · Added{' '}
                        {new Date(document.uploadedAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <span className="vault-local-badge">
                      <LockKeyhole size={12} /> Local Device Only
                    </span>
                    <button
                      type="button"
                      className="vault-delete-button"
                      onClick={() => removeDocument(document.id)}
                      aria-label={`Remove ${document.name}`}
                      title="Remove from vault"
                    >
                      <Trash2 size={17} />
                    </button>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="vault-empty-state">
              <FolderLock size={38} />
              <h3>{query ? 'No matching documents found' : 'Your document vault is currently empty'}</h3>
              <p>
                {query
                  ? 'Try searching with a different keyword or clear the search field.'
                  : 'Add your first document above to create a secure, organized record of your citizen paperwork.'}
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
