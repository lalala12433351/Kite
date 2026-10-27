import PageComponent from '@/src/views/Sitemap';
import { pageMeta } from '@/lib/pageMeta';

export const metadata = pageMeta.sitemap;

export default function SitemapPagePage() {
  return <PageComponent />;
}
