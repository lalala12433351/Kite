import PageComponent from '@/src/views/BlogDetail';
import { toNextMetadata } from '@/lib/pageMetaStore';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  return toNextMetadata('blogDetail');
}

export default function BlogDetailPage() {
  return <PageComponent />;
}
