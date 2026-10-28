'use client';

import { FormEvent, useState } from 'react';
import { Link } from '@/lib/router';

type CertificateResult = {
  certificateNumber: string;
  studentName: string;
  batch?: string;
  course?: string;
  issueDate?: string;
  status: 'valid' | 'revoked' | 'expired';
  valid: boolean;
};

function formatDisplayDate(value?: string) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function CertificateVerify() {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [certificate, setCertificate] = useState<CertificateResult | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');
    setCertificate(null);

    try {
      const response = await fetch('/api/certificates/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim(), name: name.trim() }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) {
        setError(data.error || 'Verification failed. Please try again.');
        return;
      }
      setCertificate(data.certificate || null);
      setMessage(data.message || '');
    } catch {
      setError('Verification failed. Please try again in a moment.');
    } finally {
      setLoading(false);
    }
  };

  const statusClass =
    certificate?.status === 'valid'
      ? 'certificate-verify-result--valid'
      : certificate?.status === 'revoked'
        ? 'certificate-verify-result--revoked'
        : 'certificate-verify-result--expired';

  return (
    <div className="content-box inside-page certificate-verify-page">
      <div className="content-block">
        <div className="certificate-verify-card">
          <h1>Verify Certificate</h1>
          <p className="certificate-verify-lead">
            Enter the certificate number and the student&apos;s first or last name to verify authenticity and
            validate credentials issued by Kite Institute of Aviation &amp; Hospitality.
          </p>

          <form className="certificate-verify-form" onSubmit={handleSubmit}>
            <label className="admin-label" htmlFor="certificate-code">
              Certificate number
            </label>
            <input
              id="certificate-code"
              className="admin-input"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. KITE-2026-0001"
              required
              autoComplete="off"
            />

            <label className="admin-label" htmlFor="certificate-name">
              Student first or last name
            </label>
            <input
              id="certificate-name"
              className="admin-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter first or last name"
              required
              autoComplete="name"
            />

            <button type="submit" className="admin-btn admin-btn--primary" disabled={loading}>
              {loading ? 'Verifying…' : 'Verify Certificate'}
            </button>
          </form>

          {error && <p className="certificate-verify-error">{error}</p>}

          {certificate && (
            <div className={`certificate-verify-result ${statusClass}`}>
              <div className="certificate-verify-result__badge">
                {certificate.valid ? 'Valid' : certificate.status === 'revoked' ? 'Revoked' : 'Expired'}
              </div>
              <h2>{message || (certificate.valid ? 'Certificate is valid' : 'Certificate is not valid')}</h2>
              <dl className="certificate-verify-result__meta">
                <div>
                  <dt>Certificate number</dt>
                  <dd>{certificate.certificateNumber}</dd>
                </div>
                <div>
                  <dt>Student name</dt>
                  <dd>{certificate.studentName}</dd>
                </div>
                <div>
                  <dt>Batch</dt>
                  <dd>{certificate.batch || certificate.course || '—'}</dd>
                </div>
                <div>
                  <dt>Issue date</dt>
                  <dd>{formatDisplayDate(certificate.issueDate)}</dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd>{certificate.status}</dd>
                </div>
              </dl>
            </div>
          )}

          <p className="certificate-verify-admin-link">
            Institute staff:{' '}
            <Link to="/superadmin?tab=certificates">
              Superadmin Portal
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default CertificateVerify;
