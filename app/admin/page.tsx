import PageComponent from '@/src/views/AdminDashboard';
import { toNextMetadata } from '@/lib/pageMetaStore';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  return toNextMetadata('admin');
}

export default function AdminDashboardPage() {
  return <PageComponent />;
}
