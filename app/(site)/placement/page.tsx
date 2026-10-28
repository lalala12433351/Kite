import PageComponent from '@/src/views/Placement';
import { toNextMetadata } from '@/lib/pageMetaStore';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  return toNextMetadata('placement');
}

export default function PlacementPage() {
  return <PageComponent />;
}
