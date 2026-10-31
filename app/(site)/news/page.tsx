import PageComponent from '@/src/views/News';
import { resolvePageMetadata } from '@/lib/siteContent';

export const metadata = resolvePageMetadata('news');

export default function Page() {
  return <PageComponent />;
}
