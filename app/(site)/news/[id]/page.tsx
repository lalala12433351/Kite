import PageComponent from '@/src/views/NewsDetail';
import { toNextMetadata } from '@/lib/pageMetaStore';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  return toNextMetadata('newsDetail');
}

export default function NewsDetailPage() {
  return <PageComponent />;
}
