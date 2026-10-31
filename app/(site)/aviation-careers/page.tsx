import PageComponent from '@/src/views/AviationCareers';
import { resolvePageMetadata } from '@/lib/siteContent';

export const metadata = resolvePageMetadata('aviationCareers');

export default function Page() {
  return <PageComponent />;
}
