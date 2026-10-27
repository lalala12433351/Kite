/**
 * Public gallery page copy (description under the title).
 * Edited in gallery admin; stored in database/gallery-settings.json.
 */

export const DEFAULT_GALLERY_DESCRIPTION =
  'Every picture tells a story — of passion, progress, and possibilities. Browse through our gallery to relive the inspiring moments, cultural celebrations, and proud achievements that make Kite Institute a truly dynamic place to learn and grow.';

export const GALLERY_SETTINGS_PATH = 'database/gallery-settings.json';

function parseSettingsJson(text) {
  const trimmed = (text || '').trim();
  if (!trimmed || trimmed.startsWith('<')) return null;
  try {
    return JSON.parse(trimmed);
  } catch {
    return null;
  }
}

export function normalizeGallerySettings(raw) {
  const desc = String(raw?.description ?? '').trim();
  return {
    description: desc || DEFAULT_GALLERY_DESCRIPTION,
    updatedAt: raw?.updatedAt || null,
  };
}

/**
 * Load gallery settings for the public Gallery page.
 */
export function loadGallerySettings() {
  const base = '/'.replace(/\/?$/, '/');
  const url = `${base}${GALLERY_SETTINGS_PATH}?t=${Date.now()}`;
  return fetch(url, {
    cache: 'no-cache',
    headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
  })
    .then((response) => (response.ok ? response.text() : null))
    .then((text) => normalizeGallerySettings(parseSettingsJson(text)))
    .catch(() => normalizeGallerySettings(null));
}
