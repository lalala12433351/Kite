import PageComponent from '@/src/views/VirtualClassroom';
import { toNextMetadata } from '@/lib/pageMetaStore';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  return toNextMetadata('virtualClassroom');
}

export default function VirtualClassroomPage() {
  return <PageComponent />;
}
