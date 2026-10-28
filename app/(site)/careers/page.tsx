import PageComponent from '@/src/views/Careers';
import { toNextMetadata } from '@/lib/pageMetaStore';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  return toNextMetadata('careers');
}

export default function CareersPage() {
  return <PageComponent />;
}
