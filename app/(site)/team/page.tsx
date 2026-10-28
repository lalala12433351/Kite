import PageComponent from '@/src/views/Team';
import { toNextMetadata } from '@/lib/pageMetaStore';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  return toNextMetadata('team');
}

export default function TeamPage() {
  return <PageComponent />;
}
