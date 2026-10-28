import PageComponent from '@/src/views/VirtualClassroomLogin';
import { toNextMetadata } from '@/lib/pageMetaStore';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  return toNextMetadata('virtualClassroomLogin');
}

export default function VirtualClassroomLoginPage() {
  return <PageComponent />;
}
