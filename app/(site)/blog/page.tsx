import PageComponent from '@/src/views/Blog';
import { toNextMetadata } from '@/lib/pageMetaStore';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  return toNextMetadata('blog');
}

export default function BlogPage() {
  return <PageComponent />;
}
