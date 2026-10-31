import { redirect } from 'next/navigation';

export default function CertificateAdminRedirectPage() {
  redirect('/superadmin?tab=certificates');
}
