import PageComponent from '@/src/views/Home';
import { resolvePageMetadata } from '@/lib/siteContent';

const homeMeta = resolvePageMetadata('home');
export const metadata = { ...homeMeta, title: { absolute: homeMeta.title } };

export default function HomePage() {
  return <PageComponent />;
}