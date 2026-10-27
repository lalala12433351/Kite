import { getSession } from '@/lib/session';

export async function GET() {
  const session = await getSession();
  if (!session) return Response.json({ loggedIn: false });
  return Response.json({ loggedIn: true, name: session.name || 'Admin' });
}
