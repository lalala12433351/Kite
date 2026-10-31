import PageComponent from '@/src/views/StudentHub';
import { resolvePageMetadata } from '@/lib/siteContent';

export const metadata = resolvePageMetadata('studentHub');

export default function Page() {
  return <PageComponent />;
}
