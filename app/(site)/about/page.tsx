import PageComponent from '@/src/views/About';
import { resolvePageMetadata } from '@/lib/siteContent';

export const metadata = resolvePageMetadata('about');

export default function Page() {
  return <PageComponent />;
}
