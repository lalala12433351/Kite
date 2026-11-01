import PageComponent from '@/src/views/AviationCareers';
import { toNextMetadata } from '@/lib/pageMetaStore';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  return toNextMetadata('aviationCareers');
}

export default function AviationCareersPage() {
  return <PageComponent />;
}
