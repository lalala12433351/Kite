'use client';

import { useEffect } from 'react';
import { useLocation } from '@/lib/router';
import { GTM_ID } from '../config/gtm';
import { pushToDataLayer } from '../utils/dataLayer';

const GTM_SCRIPT_ID = 'gtm-script';
const GTM_NOSCRIPT_ID = 'gtm-noscript';

/**
 * Push a page_view event for GTM (virtual pageview for SPA route changes).
 */
export function pushPageView(path, title = document?.title) {
  pushToDataLayer({
    event: 'page_view',
    page_path: path,
    page_title: title
  });
}

/**
 * Injects GTM script once. Safe for SSR (no-op on server) and prevents duplicate injection.
 */
function injectGTMScript(id) {
  if (typeof document === 'undefined' || document.getElementById(GTM_SCRIPT_ID)) return;
  pushToDataLayer({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
  const script = document.createElement('script');
  script.id = GTM_SCRIPT_ID;
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${id}`;
  document.head.appendChild(script);
}

function GoogleTagManager() {
  const location = useLocation();

  // Inject GTM script once on mount (client-only)
  useEffect(() => {
    injectGTMScript(GTM_ID);
  }, []);

  // Push page_view on every route change (SPA virtual pageviews)
  useEffect(() => {
    pushPageView(location.pathname + location.search, document.title);
  }, [location.pathname, location.search]);

  // Noscript fallback (same output on SSR and client to avoid hydration mismatch)
  return (
    <noscript>
      <iframe
        id={GTM_NOSCRIPT_ID}
        title="Google Tag Manager"
        src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
        height="0"
        width="0"
        style={{ display: 'none', visibility: 'hidden' }}
      />
    </noscript>
  );
}

export default GoogleTagManager;
