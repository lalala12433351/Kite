import { cookies } from 'next/headers';

export async function POST() {
  const jar = await cookies();
  jar.set('kite_admin', '', { httpOnly: true, path: '/', maxAge: 0 });
  return Response.json({ ok: true });
}
