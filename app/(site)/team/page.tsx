import PageComponent from '@/src/views/Team';
import { resolvePageMetadata } from '@/lib/siteContent';

export const metadata = resolvePageMetadata('team');

export default function Page() {
  return <PageComponent />;
}
