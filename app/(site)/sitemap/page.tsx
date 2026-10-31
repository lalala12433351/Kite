import PageComponent from '@/src/views/Sitemap';
import { resolvePageMetadata } from '@/lib/siteContent';

export const metadata = resolvePageMetadata('sitemap');

export default function Page() {
  return <PageComponent />;
}
