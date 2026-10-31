'use client';

import ImageUploadField from './ImageUploadField';

const IMAGE_KEYS = /^(image|photo|thumb|thumbnail|ogImage|icon|src|cover|logo|poster|avatar|background)$/i;

function isImageKey(key) {
  return IMAGE_KEYS.test(String(key || ''));
}

function blankItem(sample) {
  if (sample == null) return '';
  if (Array.isArray(sample)) return [];
  if (typeof sample === 'object') {
    const next = {};
    Object.keys(sample).forEach((key) => {
      const value = sample[key];
      if (typeof value === 'number') next[key] = 0;
      else if (typeof value === 'boolean') next[key] = false;
      else if (Array.isArray(value)) next[key] = [];
      else if (value && typeof value === 'object') next[key] = blankItem(value);
      else next[key] = '';
    });
    return next;
  }
  if (typeof sample === 'number') return 0;
  if (typeof sample === 'boolean') return false;
  return '';
}

export default function CmsFieldEditor({ path = [], value, onChange, section = 'misc', depth = 0 }) {
  const key = path[path.length - 1];
  const label = path.length ? String(key) : 'Root';

  if (value == null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    if (typeof value === 'boolean') {
      return (
        <div className="cms-field">
          <label className="admin-label">
            <input type="checkbox" checked={Boolean(value)} onChange={(e) => onChange(e.target.checked)} /> {label}
          </label>
        </div>
      );
    }
    if (isImageKey(key) || (typeof value === 'string' && /\.(jpe?g|png|gif|webp|svg|mp4|webm)(\?|$)/i.test(value))) {
      return (
        <ImageUploadField
          label={label}
          value={value == null ? '' : String(value)}
          section={section}
          onChange={onChange}
        />
      );
    }
    const isLong = typeof value === 'string' && (value.length > 120 || String(key).toLowerCase().includes('desc') || String(key).toLowerCase().includes('content') || String(key).toLowerCase().includes('message') || String(key).toLowerCase().includes('paragraph') || String(key).toLowerCase().includes('answer') || String(key).toLowerCase().includes('script') || String(key).toLowerCase().includes('subtitle') || String(key).toLowerCase().includes('summary'));
    return (
      <div className="cms-field">
        <label className="admin-label">{label}</label>
        {isLong ? (
          <textarea
            className="admin-input cms-textarea"
            rows={4}
            value={value == null ? '' : String(value)}
            onChange={(e) => onChange(e.target.value)}
          />
        ) : (
          <input
            className="admin-input"
            type={typeof value === 'number' ? 'number' : 'text'}
            value={value == null ? '' : value}
            onChange={(e) =>
              onChange(typeof value === 'number' ? (e.target.value === '' ? 0 : Number(e.target.value)) : e.target.value)
            }
          />
        )}
      </div>
    );
  }

  if (Array.isArray(value)) {
    const sample = value[0];
    return (
      <div className={`cms-array ${depth ? 'cms-array--nested' : ''}`}>
        <div className="cms-array-header">
          <h4>{label}</h4>
          <button
            type="button"
            className="admin-btn admin-btn--primary"
            onClick={() => onChange([...(value || []), blankItem(sample)])}
          >
            Add item
          </button>
        </div>
        {(value || []).map((item, index) => (
          <div key={`${path.join('.')}-${index}`} className="cms-array-item">
            <div className="cms-array-item-header">
              <strong>
                {label} #{index + 1}
              </strong>
              <div className="cms-array-item-actions">
                <button
                  type="button"
                  className="admin-btn"
                  disabled={index === 0}
                  onClick={() => {
                    const next = [...value];
                    [next[index - 1], next[index]] = [next[index], next[index - 1]];
                    onChange(next);
                  }}
                >
                  Up
                </button>
                <button
                  type="button"
                  className="admin-btn"
                  disabled={index >= value.length - 1}
                  onClick={() => {
                    const next = [...value];
                    [next[index + 1], next[index]] = [next[index], next[index + 1]];
                    onChange(next);
                  }}
                >
                  Down
                </button>
                <button
                  type="button"
                  className="admin-btn"
                  onClick={() => onChange(value.filter((_, i) => i !== index))}
                >
                  Remove
                </button>
              </div>
            </div>
            <CmsFieldEditor
              path={[...path, index]}
              value={item}
              section={section}
              depth={depth + 1}
              onChange={(nextItem) => {
                const next = [...value];
                next[index] = nextItem;
                onChange(next);
              }}
            />
          </div>
        ))}
      </div>
    );
  }

  if (typeof value === 'object') {
    const keys = Object.keys(value);
    return (
      <div className={`cms-object ${depth ? 'cms-object--nested' : ''}`}>
        {depth > 0 ? <h4 className="cms-object-title">{label}</h4> : null}
        <div className="cms-object-grid">
          {keys.map((childKey) => (
            <CmsFieldEditor
              key={[...path, childKey].join('.')}
              path={[...path, childKey]}
              value={value[childKey]}
              section={section}
              depth={depth + 1}
              onChange={(nextChild) => onChange({ ...value, [childKey]: nextChild })}
            />
          ))}
        </div>
      </div>
    );
  }

  return null;
}
