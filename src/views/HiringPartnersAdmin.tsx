'use client';

import { ChangeEvent, useEffect, useState } from 'react';
import type { HiringPartner } from '@/lib/hiringPartners';
import { resolvePartnerLogo } from '@/lib/partnerLogos';

const blankPartner = (): HiringPartner => ({
  id: `p-${Date.now()}`,
  name: '',
  label: '',
  url: 'https://',
  className: '',
  imageUrl: '',
  bgColor: '',
});

function slugFromLabel(label: string) {
  return label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '')
    .slice(0, 40);
}

function PartnerPreview({ partner }: { partner: HiringPartner }) {
  const resolved = resolvePartnerLogo(partner.name, partner.imageUrl);
  const bg = partner.bgColor || resolved.bg || '#f0f1f3';

  if (resolved.src) {
    return (
      <div className="partners-admin__thumb" style={{ backgroundColor: bg }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={resolved.src} alt={partner.label || partner.name || 'Logo'} />
      </div>
    );
  }

  return (
    <div className="partners-admin__thumb partners-admin__thumb--empty" style={{ backgroundColor: bg }}>
      <span>No logo</span>
    </div>
  );
}

function HiringPartnersAdmin({
  onToast,
}: {
  onToast?: (type: 'success' | 'error', text: string) => void;
}) {
  const [partners, setPartners] = useState<HiringPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const notify = (type: 'success' | 'error', text: string) => {
    onToast?.(type, text);
  };

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/hiring-partners', { credentials: 'same-origin' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        notify('error', data.error || 'Failed to load hiring partners');
        setPartners([]);
        return;
      }
      setPartners(Array.isArray(data.partners) ? data.partners : []);
    } catch {
      notify('error', 'Failed to load hiring partners');
      setPartners([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updatePartner = (index: number, patch: Partial<HiringPartner>) => {
    setPartners((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  };

  const onLabelChange = (index: number, label: string) => {
    const current = partners[index];
    const shouldSyncSlug =
      !current?.name || current.name === slugFromLabel(current.label || '');
    updatePartner(index, {
      label,
      ...(shouldSyncSlug ? { name: slugFromLabel(label) } : {}),
    });
  };

  const addPartner = () => {
    setPartners((prev) => [...prev, blankPartner()]);
  };

  const deletePartner = (id: string) => {
    setPartners((prev) => prev.filter((p) => p.id !== id));
  };

  const movePartner = (index: number, direction: -1 | 1) => {
    setPartners((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      const [item] = next.splice(index, 1);
      next.splice(target, 0, item);
      return next;
    });
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/hiring-partners', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partners }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        notify('error', data.error || 'Save failed');
        return;
      }
      setPartners(Array.isArray(data.partners) ? data.partners : partners);
      notify('success', data.message || 'Hiring partners saved');
    } catch {
      notify('error', 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const uploadLogo = async (event: ChangeEvent<HTMLInputElement>, index: number) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setUploadingId(partners[index]?.id || String(index));
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/hiring-partners/upload', {
        method: 'POST',
        credentials: 'same-origin',
        body: form,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success || !data.url) {
        notify('error', data.error || 'Logo upload failed');
        return;
      }
      updatePartner(index, { imageUrl: data.url });
      notify('success', 'Logo updated');
    } catch {
      notify('error', 'Logo upload failed');
    } finally {
      setUploadingId(null);
    }
  };

  if (loading) {
    return <p className="superadmin-empty">Loading hiring partners…</p>;
  }

  return (
    <div className="partners-admin">
      <div className="partners-admin__toolbar">
        <div>
          <h2>Hiring Partners / Airlines</h2>
          <p>Logo grid on Home, About, and Placement. Drag order with ↑ ↓, then Save.</p>
        </div>
        <div className="partners-admin__toolbar-actions">
          <button type="button" className="superadmin-btn superadmin-btn--ghost" onClick={addPartner}>
            + Add
          </button>
          <button
            type="button"
            className="superadmin-btn superadmin-btn--primary"
            onClick={save}
            disabled={saving}
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      <div className="partners-admin__table">
        <div className="partners-admin__head" aria-hidden>
          <span>Logo</span>
          <span>Name</span>
          <span>Website</span>
          <span>Type</span>
          <span />
        </div>

        {partners.map((partner, index) => (
          <div key={partner.id} className="partners-admin__row">
            <div className="partners-admin__logo-cell">
              <PartnerPreview partner={partner} />
              <div className="partners-admin__logo-actions">
                <input
                  type="file"
                  accept="image/*,.svg"
                  id={`upload-partner-${partner.id}`}
                  className="partners-admin__file"
                  onChange={(e) => uploadLogo(e, index)}
                  disabled={uploadingId === partner.id}
                />
                <label htmlFor={`upload-partner-${partner.id}`} className="partners-admin__upload-link">
                  {uploadingId === partner.id ? '…' : partner.imageUrl ? 'Replace' : 'Upload'}
                </label>
                {partner.imageUrl ? (
                  <button
                    type="button"
                    className="partners-admin__upload-link"
                    onClick={() => updatePartner(index, { imageUrl: '' })}
                  >
                    Reset
                  </button>
                ) : null}
              </div>
            </div>

            <label className="partners-admin__field">
              <span className="partners-admin__sr">Name</span>
              <input
                type="text"
                value={partner.label}
                placeholder="Air India"
                onChange={(e) => onLabelChange(index, e.target.value)}
              />
            </label>

            <label className="partners-admin__field">
              <span className="partners-admin__sr">Website</span>
              <input
                type="url"
                value={partner.url}
                placeholder="https://"
                onChange={(e) => updatePartner(index, { url: e.target.value })}
              />
            </label>

            <label className="partners-admin__field">
              <span className="partners-admin__sr">Type</span>
              <select
                value={partner.className || ''}
                onChange={(e) => updatePartner(index, { className: e.target.value })}
              >
                <option value="">Airline / Other</option>
                <option value="hotel">Hotel</option>
                <option value="travel">Travel</option>
                <option value="auto">Auto</option>
              </select>
            </label>

            <div className="partners-admin__row-actions">
              <button
                type="button"
                className="superadmin-btn superadmin-btn--ghost"
                onClick={() => movePartner(index, -1)}
                disabled={index === 0}
                aria-label="Move up"
              >
                ↑
              </button>
              <button
                type="button"
                className="superadmin-btn superadmin-btn--ghost"
                onClick={() => movePartner(index, 1)}
                disabled={index === partners.length - 1}
                aria-label="Move down"
              >
                ↓
              </button>
              <button
                type="button"
                className="superadmin-btn superadmin-btn--danger"
                onClick={() => deletePartner(partner.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="partners-admin__footer">
        <button
          type="button"
          className="superadmin-btn superadmin-btn--primary"
          onClick={save}
          disabled={saving}
        >
          {saving ? 'Saving…' : 'Save Partners'}
        </button>
      </div>
    </div>
  );
}

export default HiringPartnersAdmin;
