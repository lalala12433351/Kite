import PageComponent from '@/src/views/Courses';
import { pageMeta } from '@/lib/pageMeta';

export const metadata = pageMeta.courses;

export default function CoursesPage() {
  return <PageComponent />;
}
