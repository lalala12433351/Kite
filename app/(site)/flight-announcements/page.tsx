import PageComponent from '@/src/views/FlightAnnouncements';
import { toNextMetadata } from '@/lib/pageMetaStore';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  return toNextMetadata('flightAnnouncements');
}

export default function FlightAnnouncementsPage() {
  return <PageComponent />;
}
