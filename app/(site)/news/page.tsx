import PageComponent from '@/src/views/News';
import { toNextMetadata } from '@/lib/pageMetaStore';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  return toNextMetadata('news');
}

export default function NewsPage() {
  return <PageComponent />;
}
