import PageComponent from '@/src/views/Gallery';
import { pageMeta } from '@/lib/pageMeta';

export const metadata = pageMeta.gallery;

export default function GalleryPage() {
  return <PageComponent />;
}
