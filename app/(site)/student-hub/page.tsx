import PageComponent from '@/src/views/StudentHub';
import { toNextMetadata } from '@/lib/pageMetaStore';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  return toNextMetadata('studentHub');
}

export default function StudentHubPage() {
  return <PageComponent />;
}
