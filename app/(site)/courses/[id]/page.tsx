import PageComponent from '@/src/views/CourseDetail';
import { toNextMetadata } from '@/lib/pageMetaStore';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  return toNextMetadata('course');
}

export default function CourseDetailPage() {
  return <PageComponent />;
}
