import PageComponent from '@/src/views/News';
import { pageMeta } from '@/lib/pageMeta';

export const metadata = pageMeta.news;

export default function NewsPage() {
  return <PageComponent />;
}
