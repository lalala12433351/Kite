import PageComponent from '@/src/views/CourseDetail';
import { resolvePageMetadata } from '@/lib/siteContent';

export const metadata = resolvePageMetadata('course');

export default function Page() {
  return <PageComponent />;
}
