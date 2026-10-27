import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { createSessionToken, sessionCookie } from '@/lib/session';

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, message: 'Invalid request' }, { status: 400 });
  }

  const username = String(body.username || '').trim();
  const password = String(body.password || '');
  const expectedUser = process.env.ADMIN_USERNAME || 'admin';
  const hash = process.env.ADMIN_PASSWORD_HASH || '';

  if (!hash || !process.env.SESSION_SECRET) {
    return Response.json({ ok: false, message: 'Admin login is not configured' }, { status: 503 });
  }

  const matches = username === expectedUser && (await bcrypt.compare(password, hash));
  if (!matches) {
    return Response.json({ ok: false, message: 'Invalid username or password' }, { status: 401 });
  }

  const token = createSessionToken(username);
  const cookie = sessionCookie(token);
  const jar = await cookies();
  jar.set(cookie.name, cookie.value, cookie.options);
  return Response.json({ ok: true, loggedIn: true, name: username });
}
