'use client';

import { ChangeEvent, FormEvent, ReactNode, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from '@/lib/router';
import { fetchAdminSession, submitAdminLogin, submitAdminLogout } from '@/src/utils/adminAuth';
import { CERTIFICATE_BATCHES } from '@/lib/certificateBatches';
import CareersAdmin from './CareersAdmin';
import AviationCareersAdmin from './AviationCareersAdmin';
import NewsAdmin from './NewsAdmin';
import GalleryAdminHub from './GalleryAdminHub';
import HiringPartnersAdmin from './HiringPartnersAdmin';
import BlogsAdmin from './BlogsAdmin';
import PageMetaAdmin from './PageMetaAdmin';

type Tab = 'home' | 'partners' | 'blogs' | 'seo' | 'certificates' | 'careers' | 'aviation' | 'news' | 'gallery';

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

const VALID_TABS: Tab[] = ['home', 'partners', 'blogs', 'seo', 'certificates', 'careers', 'aviation', 'news', 'gallery'];

function PortalIcon({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {children}
    </svg>
  );
}

const TILES: {
  id: Exclude<Tab, 'home'>;
  title: string;
  description: string;
  tone: 'blue' | 'amber' | 'green' | 'violet';
  icon: ReactNode;
}[] = [
  {
    id: 'partners',
    title: 'Hiring Partners',
    description: 'Manage airline and hospitality logos on Home, About, and Placement.',
    tone: 'green',
    icon: (
      <PortalIcon>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </PortalIcon>
    ),
  },
  {
    id: 'blogs',
    title: 'Blog',
    description: 'WordPress-style posts, block editor, RankMath SEO, and comments.',
    tone: 'violet',
    icon: (
      <PortalIcon>
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <line x1="10" y1="9" x2="8" y2="9" />
      </PortalIcon>
    ),
  },
  {
    id: 'seo',
    title: 'SEO Meta Tags',
    description: 'Edit page titles and meta descriptions for Google and browser tabs.',
    tone: 'green',
    icon: (
      <PortalIcon>
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </PortalIcon>
    ),
  },
  {
    id: 'certificates',
    title: 'Certificates',
    description: 'Add, edit, revoke, and Excel bulk upload student certificates.',
    tone: 'blue',
    icon: (
      <PortalIcon>
        <circle cx="12" cy="8" r="6" />
        <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
      </PortalIcon>
    ),
  },
  {
    id: 'careers',
    title: 'Careers',
    description: 'Manage institute job posts.',
    tone: 'amber',
    icon: (
      <PortalIcon>
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
        <line x1="12" y1="12" x2="12" y2="12.01" />
        <path d="M2 13a10 4.5 0 0 0 20 0" />
      </PortalIcon>
    ),
  },
  {
    id: 'aviation',
    title: 'Aviation Careers',
    description: 'Manage aviation job listings.',
    tone: 'green',
    icon: (
      <PortalIcon>
        <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
      </PortalIcon>
    ),
  },
  {
    id: 'news',
    title: 'News',
    description: 'Publish and edit news updates.',
    tone: 'violet',
    icon: (
      <PortalIcon>
        <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
        <path d="M18 14h-8" />
        <path d="M15 18h-5" />
        <path d="M10 6h8v4h-8V6Z" />
      </PortalIcon>
    ),
  },
  {
    id: 'gallery',
    title: 'Gallery',
    description: 'Upload and organise media albums.',
    tone: 'blue',
    icon: (
      <PortalIcon>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="9" cy="9" r="2" />
        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
      </PortalIcon>
    ),
  },
];

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
    const rawTab = params.get('tab');
    if (rawTab === 'hero') {
      navigate('/superadmin', { replace: true });
    } else if (rawTab && VALID_TABS.includes(rawTab as Tab)) {
      setActiveTab(rawTab as Tab);
    }

    fetchAdminSession()
      .then((session) => {
        if (session?.loggedIn) setIsAuthenticated(true);
      })
      .finally(() => setCheckingSession(false));
  }, [navigate]);

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
              <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h1>Kite Superadmin</h1>
            <p>Sign in with your admin credentials to manage site content.</p>
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
                placeholder="Admin username"
                autoComplete="username"
                autoFocus
              />
            </label>
            <label>
              <span>Password</span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Admin password"
                autoComplete="current-password"
              />
            </label>
            <button type="submit" disabled={isLoggingIn}>
              {isLoggingIn ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="superadmin-login__footer">
            <Link to="/">Return to website</Link>
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
            <div className="superadmin-topbar__mark" aria-hidden>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.85" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2 4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />
                <path d="M12 18V8" />
              </svg>
            </div>
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
          {TILES.map((tile) => (
            <button
              key={tile.id}
              type="button"
              className={`superadmin-subnav__btn ${activeTab === tile.id ? 'is-active' : ''}`}
              onClick={() => goTab(tile.id)}
            >
              {tile.id === 'seo' ? 'SEO Meta' : tile.id === 'aviation' ? 'Aviation' : tile.title}
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
              {TILES.map((tile) => (
                <button key={tile.id} type="button" className="superadmin-tile" onClick={() => goTab(tile.id)}>
                  <span className={`superadmin-tile__icon superadmin-tile__icon--${tile.tone}`} aria-hidden>
                    {tile.icon}
                  </span>
                  <strong>{tile.title}</strong>
                  <small>{tile.description}</small>
                </button>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'partners' && (
          <section className="superadmin-section">
            <button type="button" className="superadmin-back" onClick={() => goTab('home')}>
              ← Dashboard
            </button>
            <HiringPartnersAdmin onToast={showToast} />
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
            <NewsAdmin embedded onLogout={handleLogout} onToast={showToast} />
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
