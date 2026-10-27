import PageComponent from '@/src/views/FlightAnnouncements';
import { pageMeta } from '@/lib/pageMeta';

export const metadata = pageMeta.flightAnnouncements;

export default function FlightAnnouncementsPage() {
  return <PageComponent />;
}
