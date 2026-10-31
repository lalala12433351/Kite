import PageComponent from '@/src/views/Gallery';
import { resolvePageMetadata } from '@/lib/siteContent';

export const metadata = resolvePageMetadata('gallery');

export default function Page() {
  return <PageComponent />;
}
