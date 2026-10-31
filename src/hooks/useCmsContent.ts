'use client';

import { useEffect, useState } from 'react';
import { fetchPublicContent } from '@/src/utils/cmsApi';

/**
 * Load public CMS JSON for a kind. Falls back to `fallback` while loading or on error.
 */
export function useCmsContent(kind, fallback = null) {
  const [data, setData] = useState(fallback);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchPublicContent(kind)
      .then((json) => {
        if (cancelled) return;
        if (json && typeof json === 'object') {
          setData(json);
          setError(null);
        } else if (fallback != null) {
          setData(fallback);
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err);
        if (fallback != null) setData(fallback);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [kind]);

  return { data, loading, error };
}

export function cmsAssetUrl(path) {
  if (!path) return '';
  const raw = String(path).trim();
  if (!raw) return '';
  if (raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('/')) return raw;
  return `/${raw.replace(/^\.\//, '')}`;
}
