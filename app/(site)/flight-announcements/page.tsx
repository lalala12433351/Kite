import PageComponent from '@/src/views/FlightAnnouncements';
import { resolvePageMetadata } from '@/lib/siteContent';

export const metadata = resolvePageMetadata('flightAnnouncements');

export default function Page() {
  return <PageComponent />;
}
