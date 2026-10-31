import PageComponent from '@/src/views/NewsDetail';
import { resolvePageMetadata } from '@/lib/siteContent';

export const metadata = resolvePageMetadata('newsDetail');

export default function Page() {
  return <PageComponent />;
}
