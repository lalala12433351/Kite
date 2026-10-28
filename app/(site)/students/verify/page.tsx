import PageComponent from '@/src/views/CertificateVerify';
import { toNextMetadata } from '@/lib/pageMetaStore';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  return toNextMetadata('certificateVerify');
}

export default function CertificateVerifyPage() {
  return <PageComponent />;
}
