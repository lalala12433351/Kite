import PageComponent from '@/src/views/Courses';
import { resolvePageMetadata } from '@/lib/siteContent';

export const metadata = resolvePageMetadata('courses');

export default function Page() {
  return <PageComponent />;
}
