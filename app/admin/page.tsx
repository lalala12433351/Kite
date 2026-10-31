import PageComponent from '@/src/views/AdminDashboard';
import { resolvePageMetadata } from '@/lib/siteContent';

export const metadata = resolvePageMetadata('admin');

export default function AdminDashboardPage() {
  return <PageComponent />;
}
