import PageComponent from '@/src/views/About';
import { pageMeta } from '@/lib/pageMeta';

export const metadata = pageMeta.about;

export default function AboutPage() {
  return <PageComponent />;
}
