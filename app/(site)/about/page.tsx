import PageComponent from '@/src/views/About';
import { toNextMetadata } from '@/lib/pageMetaStore';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  return toNextMetadata('about');
}

export default function AboutPage() {
  return <PageComponent />;
}
