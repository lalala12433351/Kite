'use client';

export async function fetchCmsKind(kind) {
  const response = await fetch(`/api/admin/cms/${kind}`, { credentials: 'same-origin' });
  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(json.message || 'Failed to load content');
  }
  return json.data;
}

export async function saveCmsKind(kind, data) {
  const response = await fetch(`/api/admin/cms/${kind}`, {
    method: 'PUT',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data }),
  });
  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(json.message || 'Failed to save');
  }
  return json.data;
}

export async function uploadCmsFile(file, section = 'misc') {
  const form = new FormData();
  form.append('file', file);
  form.append('section', section);
  const response = await fetch('/api/admin/upload', {
    method: 'POST',
    credentials: 'same-origin',
    body: form,
  });
  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(json.message || 'Upload failed');
  }
  return json;
}

export async function fetchPublicContent(kind) {
  const response = await fetch(`/api/content/${kind}`, { credentials: 'same-origin' });
  if (!response.ok) return null;
  return response.json();
}
