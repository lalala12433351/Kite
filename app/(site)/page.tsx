import PageComponent from '@/src/views/Home';
import { toNextMetadata } from '@/lib/pageMetaStore';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  return toNextMetadata('home', { absoluteTitle: true });
}

export default function HomePage() {
  return <PageComponent />;
}
