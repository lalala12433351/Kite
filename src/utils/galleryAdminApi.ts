/**
 * Gallery admin API. Writes go through the authenticated Next.js route.
 */
export function getGalleryAdminApiUrl() {
  return '/api/gallery-admin';
}

export function parseGalleryAdminResponse(res) {
  const trimmed = (res.text || '').trim();
  if (trimmed.startsWith('<?php') || trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html')) {
    throw new Error('Gallery API returned an invalid response. Restart the dev server and try again.');
  }
  try {
    return JSON.parse(trimmed);
  } catch {
    throw new Error(trimmed.slice(0, 120) || 'Invalid server response');
  }
}
