import PageComponent from '@/src/views/AdminDashboard';
import { pageMeta } from '@/lib/pageMeta';

export const metadata = pageMeta.admin;

export default function AdminDashboardPage() {
  return <PageComponent />;
}
