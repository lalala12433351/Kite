import PageComponent from '@/src/views/Contact';
import { resolvePageMetadata } from '@/lib/siteContent';

export const metadata = resolvePageMetadata('contact');

export default function Page() {
  return <PageComponent />;
}
