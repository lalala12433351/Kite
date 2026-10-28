'use client';

import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { CERTIFICATE_BATCHES } from '@/lib/certificateBatches';

type Certificate = {
  id: number;
  certificateNumber: string;
  studentName: string;
  batch?: string;
  course?: string;
  issueDate?: string;
  status: 'valid' | 'revoked' | 'expired';
};

const emptyForm = {
  certificateNumber: '',
  studentName: '',
  batch: '',
  issueDate: '',
  status: 'valid',
};

function CertificatesAdmin({ embedded = false, onLogout }: { embedded?: boolean; onLogout?: () => void }) {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const [saving, setSaving] = useState(false);
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkOverwrite, setBulkOverwrite] = useState(true);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [bulkErrors, setBulkErrors] = useState<{ row: number; error: string }[]>([]);

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage(text);
    setMessageType(type);
  };

  const loadCertificates = async () => {
    try {
      const response = await fetch('/api/certificates', { credentials: 'same-origin' });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) {
        showMessage(data.error || data.message || 'Failed to load certificates', 'error');
        setCertificates([]);
        return;
      }
      setCertificates(Array.isArray(data.certificates) ? data.certificates : []);
    } catch {
      showMessage('Failed to load certificates', 'error');
    }
  };

  useEffect(() => {
    loadCertificates();
  }, []);

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setBulkErrors([]);
    try {
      const body = new URLSearchParams();
      body.append('action', editingId ? 'update' : 'add');
      body.append('certificateData', JSON.stringify(formData));
      if (editingId) body.append('certificateId', String(editingId));

      const response = await fetch('/api/certificates', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) {
        showMessage(data.error || 'Save failed', 'error');
        return;
      }
      showMessage(editingId ? 'Certificate updated' : 'Certificate added', 'success');
      resetForm();
      await loadCertificates();
    } catch {
      showMessage('Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (cert: Certificate) => {
    setEditingId(cert.id);
    setFormData({
      certificateNumber: cert.certificateNumber || '',
      studentName: cert.studentName || '',
      batch: cert.batch || cert.course || '',
      issueDate: cert.issueDate || '',
      status: cert.status === 'revoked' ? 'revoked' : 'valid',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this certificate?')) return;
    try {
      const body = new URLSearchParams({ action: 'delete', certificateId: String(id) });
      const response = await fetch('/api/certificates', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) {
        showMessage(data.error || 'Delete failed', 'error');
        return;
      }
      showMessage('Certificate deleted', 'success');
      if (editingId === id) resetForm();
      await loadCertificates();
    } catch {
      showMessage('Delete failed', 'error');
    }
  };

  const handleBulkUpload = async (event: FormEvent) => {
    event.preventDefault();
    if (!bulkFile) {
      showMessage('Choose an Excel or CSV file first', 'error');
      return;
    }
    setBulkBusy(true);
    setBulkErrors([]);
    try {
      const form = new FormData();
      form.append('file', bulkFile);
      form.append('overwrite', bulkOverwrite ? 'true' : 'false');
      const response = await fetch('/api/certificates/bulk', {
        method: 'POST',
        credentials: 'same-origin',
        body: form,
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) {
        showMessage(data.error || 'Bulk upload failed', 'error');
        return;
      }
      showMessage(data.message || 'Bulk upload complete', 'success');
      setBulkErrors(Array.isArray(data.errors) ? data.errors : []);
      setBulkFile(null);
      await loadCertificates();
    } catch {
      showMessage('Bulk upload failed', 'error');
    } finally {
      setBulkBusy(false);
    }
  };

  return (
    <div className={`admin-container ${embedded ? 'admin-container--embedded' : ''}`}>
      {!embedded && (
        <header className="admin-header">
          <h1>Certificate Admin</h1>
          <p>Manage student certificates for public verification.</p>
        </header>
      )}

      {message && <div className={`admin-message admin-message--${messageType}`}>{message}</div>}

      <div className="admin-form-section">
        <h2>{editingId ? 'Edit Certificate' : 'Add Certificate'}</h2>
        <form onSubmit={handleSubmit}>
          <label className="admin-label">Certificate number</label>
          <input
            className="admin-input"
            name="certificateNumber"
            value={formData.certificateNumber}
            onChange={handleChange}
            required
            placeholder="KITE-2026-0001"
          />

          <label className="admin-label">Student name</label>
          <input
            className="admin-input"
            name="studentName"
            value={formData.studentName}
            onChange={handleChange}
            required
            placeholder="Full student name"
          />

          <label className="admin-label">Batch</label>
          <select className="admin-input" name="batch" value={formData.batch} onChange={handleChange} required>
            <option value="">Select batch</option>
            {CERTIFICATE_BATCHES.map((batch) => (
              <option key={batch} value={batch}>
                {batch}
              </option>
            ))}
          </select>

          <label className="admin-label">Issue date</label>
          <input className="admin-input" type="date" name="issueDate" value={formData.issueDate} onChange={handleChange} />

          <label className="admin-label">Status</label>
          <select className="admin-input" name="status" value={formData.status} onChange={handleChange}>
            <option value="valid">Valid</option>
            <option value="revoked">Revoked</option>
          </select>

          <div className="admin-form-buttons">
            <button type="submit" className="admin-btn--save" disabled={saving}>
              {saving ? 'Saving…' : editingId ? 'Update Certificate' : 'Add Certificate'}
            </button>
            {editingId && (
              <button type="button" className="admin-btn--cancel" onClick={resetForm}>
                Cancel
              </button>
            )}
            {embedded && (
              <button type="button" className="admin-btn--logout" onClick={() => onLogout?.()}>
                Logout
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="admin-form-section">
        <h2>Excel / CSV Bulk Upload</h2>
        <p className="certificate-admin-bulk-hint">
          Upload a spreadsheet with columns: <strong>Certificate Number</strong>, <strong>Student Name</strong>,{' '}
          <strong>Batch</strong>, <strong>Issue Date</strong>, <strong>Status</strong>.
        </p>
        <p>
          <a className="certificate-admin-template-link" href="/templates/kite-certificates-template.xlsx" download>
            Download Excel template
          </a>
        </p>
        <form onSubmit={handleBulkUpload}>
          <label className="admin-label">Spreadsheet file</label>
          <input
            className="admin-input"
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={(e) => setBulkFile(e.target.files?.[0] || null)}
          />
          <label className="admin-label certificate-admin-checkbox">
            <input type="checkbox" checked={bulkOverwrite} onChange={(e) => setBulkOverwrite(e.target.checked)} />
            Overwrite existing certificate numbers
          </label>
          <div className="admin-form-buttons">
            <button type="submit" className="admin-btn--save" disabled={bulkBusy}>
              {bulkBusy ? 'Uploading…' : 'Upload Excel'}
            </button>
          </div>
        </form>
        {bulkErrors.length > 0 && (
          <div className="certificate-admin-bulk-errors">
            <h4>Row errors</h4>
            <ul>
              {bulkErrors.slice(0, 20).map((item) => (
                <li key={`${item.row}-${item.error}`}>
                  Row {item.row}: {item.error}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="admin-posts-section">
        <h2>Certificates ({certificates.length})</h2>
        {certificates.length === 0 ? (
          <p className="admin-posts-empty">No certificates yet. Add one or upload Excel.</p>
        ) : (
          <div className="admin-posts-list">
            {certificates.map((cert) => (
              <div
                key={cert.id}
                className={`admin-post-card ${editingId === cert.id ? 'admin-post-card--editing' : ''}`}
              >
                <h3>{cert.certificateNumber}</h3>
                <p>{cert.studentName}</p>
                <div className="admin-post-meta">
                  {(cert.batch || cert.course) && <small>{cert.batch || cert.course}</small>}
                  <small>• {cert.status}</small>
                  {cert.issueDate && <small>• Issued {cert.issueDate}</small>}
                </div>
                <div className="admin-post-actions">
                  <button type="button" className="admin-btn--edit" onClick={() => handleEdit(cert)}>
                    Edit
                  </button>
                  <button type="button" className="admin-btn--delete" onClick={() => handleDelete(cert.id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default CertificatesAdmin;
