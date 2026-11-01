import PageComponent from '@/src/views/Gallery';
import { toNextMetadata } from '@/lib/pageMetaStore';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  return toNextMetadata('gallery');
}

export default function GalleryPage() {
  return <PageComponent />;
}
