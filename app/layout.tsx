import './globals.css';
import { Suspense } from 'react';
import GoogleTagManager from '@/src/components/GoogleTagManager';
import ScrollToTop from '@/src/components/ScrollToTop';
import { getPageMeta } from '@/lib/pageMetaStore';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const home = getPageMeta('home');
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://kiteaviation.in'),
    title: {
      default: home.title,
      template: '%s | Kite Institute',
    },
    description: home.description,
    keywords: home.keywords
      ? home.keywords.split(',').map((k) => k.trim()).filter(Boolean)
      : [
          'Aviation Institute',
          'Hospitality Training',
          'Cabin Crew Course',
          'Airport Management',
          'Aviation Courses',
          'Bengaluru',
        ],
    robots: { index: true, follow: true },
    icons: { icon: '/favicon.png' },
  };
}

export const viewport = {
  themeColor: '#0a377f',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Alexandria:wght@100..900&family=Anek+Malayalam:wght@100..800&family=Noto+Sans+Malayalam:wght@100..900&family=Open+Sans:ital,wght@0,300..800;1,300..800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Suspense fallback={null}>
          <GoogleTagManager />
          <ScrollToTop />
          {children}
        </Suspense>
      </body>
    </html>
  );
}
