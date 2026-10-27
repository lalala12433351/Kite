import PageComponent from '@/src/views/Home';
import { pageMeta } from '@/lib/pageMeta';

export const metadata = { ...pageMeta.home, title: { absolute: pageMeta.home.title } };

export default function HomePage() {
  return <PageComponent />;
}
