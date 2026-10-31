'use client';

import { useRef, useState } from 'react';
import { uploadCmsFile } from '@/src/utils/cmsApi';
import { cmsAssetUrl } from '@/src/hooks/useCmsContent';

export default function ImageUploadField({ label, value, onChange, section = 'misc', hint = '' }) {
  const inputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const preview = cmsAssetUrl(value);

  const handleUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const result = await uploadCmsFile(file, section);
      onChange(result.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="cms-field cms-field--image">
      <label className="admin-label">{label}</label>
      <div className="cms-image-row">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="cms-image-preview" />
        ) : (
          <div className="cms-image-preview cms-image-preview--empty">No image</div>
        )}
        <div className="cms-image-controls">
          <input
            type="text"
            className="admin-input"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="/images/... or upload"
          />
          <div className="cms-image-actions">
            <button
              type="button"
              className="admin-btn admin-btn--primary"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
            >
              {uploading ? 'Uploading…' : 'Upload'}
            </button>
            {value ? (
              <button type="button" className="admin-btn" onClick={() => onChange('')}>
                Clear
              </button>
            ) : null}
          </div>
          {hint ? <p className="cms-field-hint">{hint}</p> : null}
          {error ? <p className="admin-login-error">{error}</p> : null}
        </div>
      </div>
      <input ref={inputRef} type="file" accept="image/*,video/*,audio/*,.pdf" hidden onChange={handleUpload} />
    </div>
  );
}
