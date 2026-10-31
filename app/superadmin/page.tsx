import PageComponent from '@/src/views/SuperadminPortal';
import { toNextMetadata } from '@/lib/pageMetaStore';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  return toNextMetadata('superadmin');
}

export default function SuperadminPage() {
  return <PageComponent />;
}
