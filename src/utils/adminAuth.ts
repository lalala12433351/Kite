'use client';

export async function submitAdminLogin(username, password) {
  try {
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ username: String(username || '').trim(), password }),
    });
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

export async function fetchAdminSession() {
  try {
    const response = await fetch('/api/admin/session', { credentials: 'same-origin' });
    if (!response.ok) return { loggedIn: false };
    return response.json();
  } catch {
    return { loggedIn: false };
  }
}

export async function submitAdminLogout() {
  try {
    await fetch('/api/admin/logout', { method: 'POST', credentials: 'same-origin' });
  } catch {
    // ignore network errors on logout
  }
}
