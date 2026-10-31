import PageComponent from '@/src/views/VirtualClassroomLogin';
import { resolvePageMetadata } from '@/lib/siteContent';

export const metadata = resolvePageMetadata('virtualClassroomLogin');

export default function Page() {
  return <PageComponent />;
}
