import PageComponent from '@/src/views/Courses';
import { toNextMetadata } from '@/lib/pageMetaStore';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  return toNextMetadata('courses');
}

export default function CoursesPage() {
  return <PageComponent />;
}
