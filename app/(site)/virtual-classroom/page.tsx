import PageComponent from '@/src/views/VirtualClassroom';
import { resolvePageMetadata } from '@/lib/siteContent';

export const metadata = resolvePageMetadata('virtualClassroom');

export default function Page() {
  return <PageComponent />;
}
