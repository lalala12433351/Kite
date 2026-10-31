'use client';

import { useCallback, useEffect, useState } from 'react';
import { fetchCmsKind, saveCmsKind } from '@/src/utils/cmsApi';
import CmsFieldEditor from '@/src/components/admin/CmsFieldEditor';

export default function CmsSectionEditor({ kind, title, description }) {
  const [data, setData] = useState(null);
  const [baseline, setBaseline] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const json = await fetchCmsKind(kind);
      setData(json);
      setBaseline(JSON.parse(JSON.stringify(json)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [kind]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setMessage('');
    try {
      const saved = await saveCmsKind(kind, data);
      setData(saved);
      setBaseline(JSON.parse(JSON.stringify(saved)));
      setMessage('Saved permanently. Public pages will use this content.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (baseline) setData(JSON.parse(JSON.stringify(baseline)));
    setMessage('');
    setError('');
  };

  if (loading) {
    return (
      <div className="cms-section">
        <p>Loading {title}…</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="cms-section">
        <p className="admin-login-error">{error || 'No data'}</p>
        <button type="button" className="admin-btn" onClick={load}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="cms-section">
      <div className="cms-section-header">
        <div>
          <h2>{title}</h2>
          {description ? <p>{description}</p> : null}
        </div>
        <div className="cms-section-actions">
          <button type="button" className="admin-btn" onClick={handleReset} disabled={saving}>
            Reset
          </button>
          <button type="button" className="admin-btn admin-btn--primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>
      {message ? <p className="cms-status cms-status--ok">{message}</p> : null}
      {error ? <p className="cms-status cms-status--err">{error}</p> : null}
      <CmsFieldEditor value={data} onChange={setData} section={kind} path={[]} />
    </div>
  );
}
