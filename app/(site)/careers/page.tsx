import PageComponent from '@/src/views/Careers';
import { resolvePageMetadata } from '@/lib/siteContent';

export const metadata = resolvePageMetadata('careers');

export default function Page() {
  return <PageComponent />;
}
