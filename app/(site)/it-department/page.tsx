import PageComponent from '@/src/views/KiteItDepartment';
import { toNextMetadata } from '@/lib/pageMetaStore';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  return toNextMetadata('itDepartment');
}

export default function KiteItDepartmentPage() {
  return <PageComponent />;
}
