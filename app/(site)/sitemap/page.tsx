import PageComponent from '@/src/views/Sitemap';
import { toNextMetadata } from '@/lib/pageMetaStore';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  return toNextMetadata('sitemap');
}

export default function SitemapPagePage() {
  return <PageComponent />;
}
