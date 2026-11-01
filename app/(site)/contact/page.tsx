import PageComponent from '@/src/views/Contact';
import { toNextMetadata } from '@/lib/pageMetaStore';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  return toNextMetadata('contact');
}

export default function ContactPage() {
  return <PageComponent />;
}
