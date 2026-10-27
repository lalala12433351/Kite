'use client';

export async function submitAdminLogin(username, password) {
  const response = await fetch('/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify({ username: String(username || '').trim(), password }),
  });
  if (!response.ok) return null;
  return response.json();
}

export async function fetchAdminSession() {
  const response = await fetch('/api/admin/session', { credentials: 'same-origin' });
  if (!response.ok) return { loggedIn: false };
  return response.json();
}

export async function submitAdminLogout() {
  await fetch('/api/admin/logout', { method: 'POST', credentials: 'same-origin' });
}
