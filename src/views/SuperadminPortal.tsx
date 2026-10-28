'use client';

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from '@/lib/router';
import { fetchAdminSession, submitAdminLogin, submitAdminLogout } from '@/src/utils/adminAuth';
import { CERTIFICATE_BATCHES } from '@/lib/certificateBatches';
import CareersAdmin from './CareersAdmin';
import AviationCareersAdmin from './AviationCareersAdmin';
import NewsAdmin from './NewsAdmin';
import GalleryAdminHub from './GalleryAdminHub';
import HeroSlidesAdmin from './HeroSlidesAdmin';
import BlogsAdmin from './BlogsAdmin';
import PageMetaAdmin from './PageMetaAdmin';

type Tab = 'home' | 'hero' | 'blogs' | 'seo' | 'certificates' | 'careers' | 'aviation' | 'news' | 'gallery';

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

const VALID_TABS: Tab[] = ['home', 'hero', 'blogs', 'seo', 'certificates', 'careers', 'aviation', 'news', 'gallery'];

function SuperadminPortal() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loadingCerts, setLoadingCerts] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkOverwrite, setBulkOverwrite] = useState(true);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [bulkErrors, setBulkErrors] = useState<{ row: number; error: string }[]>([]);
  const [search, setSearch] = useState('');

  const showToast = (type: 'success' | 'error', text: string) => {
    setToast({ type, text });
    window.setTimeout(() => setToast(null), 3200);
  };

  const goTab = (tab: Tab) => {
    setActiveTab(tab);
    const url = tab === 'home' ? '/superadmin' : `/superadmin?tab=${tab}`;
    navigate(url, { replace: true });
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab') as Tab | null;
    if (tab && VALID_TABS.includes(tab)) setActiveTab(tab);

    fetchAdminSession()
      .then((session) => {
        if (session?.loggedIn) setIsAuthenticated(true);
      })
      .finally(() => setCheckingSession(false));
  }, []);

  const loadCertificates = async () => {
    setLoadingCerts(true);
    try {
      const response = await fetch('/api/certificates', { credentials: 'same-origin' });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.success) {
        showToast('error', data.error || data.message || 'Failed to load certificates');
        setCertificates([]);
        return;
      }
      setCertificates(Array.isArray(data.certificates) ? data.certificates : []);
    } catch {
      showToast('error', 'Failed to load certificates');
    } finally {
      setLoadingCerts(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && activeTab === 'certificates') {
      loadCertificates();
    }
  }, [isAuthenticated, activeTab]);

  const filteredCertificates = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return certificates;
    return certificates.filter((cert) =>
      [cert.certificateNumber, cert.studentName, cert.batch, cert.course, cert.status]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q)),
    );
  }, [certificates, search]);

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    const session = await submitAdminLogin(username.trim(), password.trim());
    if (session?.ok) {
      localStorage.setItem('kiteUnifiedAdmin', 'true');
      localStorage.setItem('kiteCertificateAdmin', 'true');
      localStorage.setItem('kiteAdminUser', username.trim() || 'Admin');
      window.dispatchEvent(new Event('adminAuthChanged'));
      setIsAuthenticated(true);
      setPassword('');
    } else {
      setLoginError(session?.message || 'Invalid username or password. Check ADMIN env vars if login stays unavailable.');
    }
    setIsLoggingIn(false);
  };

  const handleLogout = async () => {
    await submitAdminLogout();
    localStorage.removeItem('kiteUnifiedAdmin');
    localStorage.removeItem('kiteCertificateAdmin');
    localStorage.removeItem('kiteCareersAdmin');
    localStorage.removeItem('kiteAviationAdmin');
    localStorage.removeItem('kiteNewsAdmin');
    localStorage.removeItem('kiteGalleryAdmin');
    localStorage.removeItem('kiteAdminUser');
    window.dispatchEvent(new Event('adminAuthChanged'));
    setIsAuthenticated(false);
    goTab('home');
    setUsername('');
    setPassword('');
  };

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
        showToast('error', data.error || 'Save failed');
        return;
      }
      showToast('success', editingId ? 'Certificate updated' : 'Certificate added');
      resetForm();
      await loadCertificates();
    } catch {
      showToast('error', 'Save failed');
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
        showToast('error', data.error || 'Delete failed');
        return;
      }
      showToast('success', 'Certificate deleted');
      if (editingId === id) resetForm();
      await loadCertificates();
    } catch {
      showToast('error', 'Delete failed');
    }
  };

  const handleBulkUpload = async (event: FormEvent) => {
    event.preventDefault();
    if (!bulkFile) {
      showToast('error', 'Choose an Excel or CSV file first');
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
        showToast('error', data.error || 'Bulk upload failed');
        return;
      }
      showToast('success', data.message || 'Bulk upload complete');
      setBulkErrors(Array.isArray(data.errors) ? data.errors : []);
      setBulkFile(null);
      await loadCertificates();
    } catch {
      showToast('error', 'Bulk upload failed');
    } finally {
      setBulkBusy(false);
    }
  };

  const downloadTemplate = () => {
    const anchor = document.createElement('a');
    anchor.href = '/templates/kite-certificates-template.xlsx';
    anchor.download = 'kite-certificates-template.xlsx';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };

  if (checkingSession) {
    return (
      <div className="superadmin-shell superadmin-shell--loading">
        <div className="superadmin-loader">Loading portal…</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="superadmin-login">
        <div className="superadmin-login__glow" aria-hidden />
        <div className="superadmin-login__card">
          <div className="superadmin-login__brand">
            <div className="superadmin-login__icon" aria-hidden>
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h1>Superadmin Portal</h1>
            <p>Log in to manage certificates and site content.</p>
          </div>

          {loginError && <div className="superadmin-login__error">{loginError}</div>}

          <form onSubmit={handleLogin} className="superadmin-login__form">
            <label>
              <span>Username</span>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                autoComplete="username"
              />
            </label>
            <label>
              <span>Password</span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                autoComplete="current-password"
              />
            </label>
            <button type="submit" disabled={isLoggingIn}>
              {isLoggingIn ? 'Authenticating…' : 'Secure Log In'}
            </button>
          </form>

          <div className="superadmin-login__footer">
            <Link to="/">Return to Website</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="superadmin-shell">
      {toast && (
        <div className={`superadmin-toast superadmin-toast--${toast.type}`} role="status">
          {toast.text}
        </div>
      )}

      <header className="superadmin-topbar">
        <div className="superadmin-topbar__inner">
          <div className="superadmin-topbar__brand">
            <div className="superadmin-topbar__mark" aria-hidden />
            <div>
              <h1>Kite Control Panel</h1>
              <p>Superadmin content manager</p>
            </div>
          </div>
          <div className="superadmin-topbar__actions">
            <button type="button" className="superadmin-btn superadmin-btn--ghost" onClick={() => goTab('home')}>
              Dashboard
            </button>
            <Link to="/students/verify" className="superadmin-btn superadmin-btn--ghost">
              Verify page
            </Link>
            <Link to="/" className="superadmin-btn superadmin-btn--ghost">
              Live site
            </Link>
            <button type="button" className="superadmin-btn superadmin-btn--danger" onClick={handleLogout}>
              Log out
            </button>
          </div>
        </div>
      </header>

      {activeTab !== 'home' && (
        <nav className="superadmin-subnav">
          {(
            [
              ['hero', 'Hero Banner'],
              ['blogs', 'Blog'],
              ['seo', 'SEO Meta'],
              ['certificates', 'Certificates'],
              ['careers', 'Careers'],
              ['aviation', 'Aviation'],
              ['news', 'News'],
              ['gallery', 'Gallery'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={`superadmin-subnav__btn ${activeTab === id ? 'is-active' : ''}`}
              onClick={() => goTab(id)}
            >
              {label}
            </button>
          ))}
        </nav>
      )}

      <main className="superadmin-main">
        {activeTab === 'home' && (
          <section className="superadmin-home">
            <div className="superadmin-home__intro">
              <h2>Welcome to Kite Superadmin</h2>
              <p>Everything stays in this portal — pick a section below.</p>
            </div>

            <div className="superadmin-tile-grid">
              <button type="button" className="superadmin-tile" onClick={() => goTab('hero')}>
                <span className="superadmin-tile__icon superadmin-tile__icon--amber" aria-hidden />
                <strong>Hero Banner</strong>
                <small>Manage homepage hero carousel slides, copy, buttons, and images.</small>
              </button>
              <button type="button" className="superadmin-tile" onClick={() => goTab('blogs')}>
                <span className="superadmin-tile__icon superadmin-tile__icon--violet" aria-hidden />
                <strong>Blog</strong>
                <small>WordPress-style posts, block editor, RankMath SEO, and comments.</small>
              </button>
              <button type="button" className="superadmin-tile" onClick={() => goTab('seo')}>
                <span className="superadmin-tile__icon superadmin-tile__icon--green" aria-hidden />
                <strong>SEO Meta Tags</strong>
                <small>Edit page titles and meta descriptions for Google and browser tabs.</small>
              </button>
              <button type="button" className="superadmin-tile" onClick={() => goTab('certificates')}>
                <span className="superadmin-tile__icon superadmin-tile__icon--blue" aria-hidden />
                <strong>Certificates</strong>
                <small>Add, edit, revoke, and Excel bulk upload student certificates.</small>
              </button>
              <button type="button" className="superadmin-tile" onClick={() => goTab('careers')}>
                <span className="superadmin-tile__icon superadmin-tile__icon--amber" aria-hidden />
                <strong>Careers</strong>
                <small>Manage institute job posts.</small>
              </button>
              <button type="button" className="superadmin-tile" onClick={() => goTab('aviation')}>
                <span className="superadmin-tile__icon superadmin-tile__icon--green" aria-hidden />
                <strong>Aviation Careers</strong>
                <small>Manage aviation job listings.</small>
              </button>
              <button type="button" className="superadmin-tile" onClick={() => goTab('news')}>
                <span className="superadmin-tile__icon superadmin-tile__icon--violet" aria-hidden />
                <strong>News</strong>
                <small>Publish and edit news updates.</small>
              </button>
              <button type="button" className="superadmin-tile" onClick={() => goTab('gallery')}>
                <span className="superadmin-tile__icon superadmin-tile__icon--blue" aria-hidden />
                <strong>Gallery</strong>
                <small>Upload and organise media albums.</small>
              </button>
            </div>
          </section>
        )}

        {activeTab === 'hero' && (
          <section className="superadmin-section">
            <button type="button" className="superadmin-back" onClick={() => goTab('home')}>
              ← Dashboard
            </button>
            <HeroSlidesAdmin onToast={showToast} />
          </section>
        )}

        {activeTab === 'blogs' && (
          <section className="superadmin-section">
            <button type="button" className="superadmin-back" onClick={() => goTab('home')}>
              ← Dashboard
            </button>
            <BlogsAdmin onToast={showToast} />
          </section>
        )}

        {activeTab === 'seo' && (
          <section className="superadmin-section">
            <button type="button" className="superadmin-back" onClick={() => goTab('home')}>
              ← Dashboard
            </button>
            <PageMetaAdmin onToast={showToast} />
          </section>
        )}

        {activeTab === 'certificates' && (
          <section className="superadmin-section">
            <div className="superadmin-section__header">
              <div>
                <button type="button" className="superadmin-back" onClick={() => goTab('home')}>
                  ← Dashboard
                </button>
                <h2>Certificate Manager</h2>
                <p>Single entry and Excel/CSV bulk import. Public verify: /students/verify</p>
              </div>
              <div className="superadmin-section__meta">{certificates.length} records</div>
            </div>

            <div className="superadmin-grid">
              <div className="superadmin-panel">
                <h3>{editingId ? 'Edit certificate' : 'Add certificate'}</h3>
                <form onSubmit={handleSubmit} className="superadmin-form">
                  <label>
                    <span>Certificate number</span>
                    <input name="certificateNumber" value={formData.certificateNumber} onChange={handleChange} required />
                  </label>
                  <label>
                    <span>Student name</span>
                    <input name="studentName" value={formData.studentName} onChange={handleChange} required />
                  </label>
                  <label>
                    <span>Batch</span>
                    <select name="batch" value={formData.batch} onChange={handleChange} required>
                      <option value="">Select batch</option>
                      {CERTIFICATE_BATCHES.map((batch) => (
                        <option key={batch} value={batch}>
                          {batch}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    <span>Issue date</span>
                    <input type="date" name="issueDate" value={formData.issueDate} onChange={handleChange} />
                  </label>
                  <label>
                    <span>Status</span>
                    <select name="status" value={formData.status} onChange={handleChange}>
                      <option value="valid">Valid</option>
                      <option value="revoked">Revoked</option>
                    </select>
                  </label>
                  <div className="superadmin-form__actions">
                    <button type="submit" className="superadmin-btn superadmin-btn--primary" disabled={saving}>
                      {saving ? 'Saving…' : editingId ? 'Update' : 'Add certificate'}
                    </button>
                    {editingId && (
                      <button type="button" className="superadmin-btn superadmin-btn--ghost" onClick={resetForm}>
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>

              <div className="superadmin-panel">
                <h3>Excel / CSV bulk upload</h3>
                <p className="superadmin-help">
                  Columns: Certificate Number, Student Name, Batch, Issue Date, Status. Batch must match a flyer
                  course (AASSC / IATA Online / IATA Offline).
                </p>
                <button type="button" className="superadmin-link" onClick={downloadTemplate}>
                  Download Excel template
                </button>
                <form onSubmit={handleBulkUpload} className="superadmin-form">
                  <label>
                    <span>Spreadsheet file</span>
                    <input
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={(e) => setBulkFile(e.target.files?.[0] || null)}
                    />
                  </label>
                  <label className="superadmin-check">
                    <input
                      type="checkbox"
                      checked={bulkOverwrite}
                      onChange={(e) => setBulkOverwrite(e.target.checked)}
                    />
                    Overwrite existing certificate numbers
                  </label>
                  <button type="submit" className="superadmin-btn superadmin-btn--primary" disabled={bulkBusy}>
                    {bulkBusy ? 'Uploading…' : 'Upload Excel'}
                  </button>
                </form>
                {bulkErrors.length > 0 && (
                  <div className="superadmin-errors">
                    <strong>Row errors</strong>
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
            </div>

            <div className="superadmin-panel superadmin-panel--table">
              <div className="superadmin-table-toolbar">
                <h3>All certificates</h3>
                <input
                  className="superadmin-search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search number, name, batch…"
                />
              </div>

              {loadingCerts ? (
                <p className="superadmin-empty">Loading certificates…</p>
              ) : filteredCertificates.length === 0 ? (
                <p className="superadmin-empty">No certificates yet. Add one or upload Excel.</p>
              ) : (
                <div className="superadmin-table-wrap">
                  <table className="superadmin-table">
                    <thead>
                      <tr>
                        <th>Number</th>
                        <th>Student</th>
                        <th>Batch</th>
                        <th>Status</th>
                        <th>Issued</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCertificates.map((cert) => (
                        <tr key={cert.id}>
                          <td>{cert.certificateNumber}</td>
                          <td>{cert.studentName}</td>
                          <td>{cert.batch || cert.course || '—'}</td>
                          <td>
                            <span className={`superadmin-status superadmin-status--${cert.status}`}>{cert.status}</span>
                          </td>
                          <td>{cert.issueDate || '—'}</td>
                          <td className="superadmin-table__actions">
                            <button type="button" onClick={() => handleEdit(cert)}>
                              Edit
                            </button>
                            <button type="button" className="is-danger" onClick={() => handleDelete(cert.id)}>
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        )}

        {activeTab === 'careers' && (
          <section className="superadmin-section">
            <button type="button" className="superadmin-back" onClick={() => goTab('home')}>
              ← Dashboard
            </button>
            <CareersAdmin embedded onLogout={handleLogout} />
          </section>
        )}

        {activeTab === 'aviation' && (
          <section className="superadmin-section">
            <button type="button" className="superadmin-back" onClick={() => goTab('home')}>
              ← Dashboard
            </button>
            <AviationCareersAdmin embedded onLogout={handleLogout} />
          </section>
        )}

        {activeTab === 'news' && (
          <section className="superadmin-section">
            <button type="button" className="superadmin-back" onClick={() => goTab('home')}>
              ← Dashboard
            </button>
            <NewsAdmin embedded onLogout={handleLogout} />
          </section>
        )}

        {activeTab === 'gallery' && (
          <section className="superadmin-section">
            <button type="button" className="superadmin-back" onClick={() => goTab('home')}>
              ← Dashboard
            </button>
            <GalleryAdminHub embedded onLogout={handleLogout} />
          </section>
        )}
      </main>
    </div>
  );
}

export default SuperadminPortal;
