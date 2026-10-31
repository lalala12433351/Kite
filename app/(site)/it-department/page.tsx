import PageComponent from '@/src/views/KiteItDepartment';
import { resolvePageMetadata } from '@/lib/siteContent';

export const metadata = resolvePageMetadata('itDepartment');

export default function Page() {
  return <PageComponent />;
}
