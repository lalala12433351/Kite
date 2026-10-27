import PageComponent from '@/src/views/CourseDetail';
import { pageMeta } from '@/lib/pageMeta';

export const metadata = pageMeta.course;

export default function CourseDetailPage() {
  return <PageComponent />;
}
