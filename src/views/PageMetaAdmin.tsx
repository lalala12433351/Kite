'use client';

import { useEffect, useState } from 'react';
import {
  DEFAULT_PAGE_META,
  PAGE_META_ADMIN_ROWS,
  type PageMetaEntry,
  type PageMetaKey,
} from '@/lib/pageMetaDefaults';

type PagesState = Record<PageMetaKey, PageMetaEntry>;

function PageMetaAdmin({
  onToast,
}: {
  onToast?: (type: 'success' | 'error', text: string) => void;
}) {
  const [pages, setPages] = useState<PagesState>(DEFAULT_PAGE_META);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('');

  const notify = (type: 'success' | 'error', text: string) => onToast?.(type, text);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/page-meta', { credentials: 'same-origin' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        notify('error', data.error || 'Failed to load page meta');
        return;
      }
      setPages({ ...DEFAULT_PAGE_META, ...(data.pages || {}) });
    } catch {
      notify('error', 'Failed to load page meta');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const update = (key: PageMetaKey, field: keyof PageMetaEntry, value: string) => {
    setPages((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
  };

  const resetRow = (key: PageMetaKey) => {
    setPages((prev) => ({ ...prev, [key]: { ...DEFAULT_PAGE_META[key] } }));
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/page-meta', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pages }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        notify('error', data.error || 'Save failed');
        return;
      }
      if (data.pages) setPages({ ...DEFAULT_PAGE_META, ...data.pages });
      notify('success', data.message || 'Meta tags saved');
    } catch {
      notify('error', 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const rows = PAGE_META_ADMIN_ROWS.filter((row) => {
    const q = filter.trim().toLowerCase();
    if (!q) return true;
    return (
      row.label.toLowerCase().includes(q) ||
      row.path.toLowerCase().includes(q) ||
      row.key.toLowerCase().includes(q)
    );
  });

  if (loading) return <p className="superadmin-empty">Loading page meta…</p>;

  return (
    <div className="page-meta-admin">
      <div className="page-meta-admin__toolbar">
        <div>
          <h2>SEO Meta Tags</h2>
          <p>
            Edit each page’s <strong>title</strong> (browser tab / Google title) and{' '}
            <strong>meta description</strong>. Changes apply site-wide after save.
          </p>
        </div>
        <button
          type="button"
          className="superadmin-btn superadmin-btn--primary"
          onClick={save}
          disabled={saving}
        >
          {saving ? 'Saving…' : 'Save All Meta Tags'}
        </button>
      </div>

      <input
        className="page-meta-admin__search"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Filter by page name or URL…"
      />

      <div className="page-meta-admin__list">
        {rows.map((row) => {
          const entry = pages[row.key] || DEFAULT_PAGE_META[row.key];
          const titleLen = String(entry.title || '').length;
          const descLen = String(entry.description || '').length;
          return (
            <article key={row.key} className="page-meta-admin__card">
              <div className="page-meta-admin__card-head">
                <div>
                  <h3>{row.label}</h3>
                  <code>{row.path}</code>
                </div>
                <button type="button" className="superadmin-btn superadmin-btn--ghost" onClick={() => resetRow(row.key)}>
                  Reset to default
                </button>
              </div>

              <label>
                <span>
                  Meta title <em>({titleLen} chars — aim ~50–60)</em>
                </span>
                <input
                  type="text"
                  value={entry.title || ''}
                  onChange={(e) => update(row.key, 'title', e.target.value)}
                />
              </label>

              <label>
                <span>
                  Meta description <em>({descLen} chars — aim ~120–160)</em>
                </span>
                <textarea
                  rows={3}
                  value={entry.description || ''}
                  onChange={(e) => update(row.key, 'description', e.target.value)}
                />
              </label>

              <label>
                <span>Keywords (optional, comma separated)</span>
                <input
                  type="text"
                  value={entry.keywords || ''}
                  placeholder="aviation institute, cabin crew, bangalore"
                  onChange={(e) => update(row.key, 'keywords', e.target.value)}
                />
              </label>
            </article>
          );
        })}
      </div>

      <div className="page-meta-admin__footer">
        <button
          type="button"
          className="superadmin-btn superadmin-btn--primary"
          onClick={save}
          disabled={saving}
        >
          {saving ? 'Saving…' : 'Save All Meta Tags'}
        </button>
      </div>
    </div>
  );
}

export default PageMetaAdmin;
