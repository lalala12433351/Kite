import PageComponent from '@/src/views/Placement';
import { resolvePageMetadata } from '@/lib/siteContent';

export const metadata = resolvePageMetadata('placement');

export default function Page() {
  return <PageComponent />;
}
