/**
 * Resolve base path for PHP backends (sendmail-*, telecrm-lead.php).
 *
 * On kiteaviation.in, PHP lives at the document root:
 *   /telecrm-status.php, /sendmail-contact.php
 * not under /qa/. When the SPA is served from /qa/ only, use that prefix.
 */
export function getPhpBackendBase() {
  if (typeof window !== 'undefined') {
    const path = window.location.pathname || '/';
    if (path === '/qa' || path.startsWith('/qa/')) {
      const envBase = '/';
      return envBase.endsWith('/') ? envBase : `${envBase}/`;
    }
    return '/';
  }

  const envBase = '/';
  return envBase.endsWith('/') ? envBase : `${envBase}/`;
}

export function getPhpBackendUrl(relativeScript) {
  const base = getPhpBackendBase();
  const origin =
    typeof window !== 'undefined' ? window.location.origin : 'http://localhost';
  return new URL(relativeScript, `${origin}${base}`).href;
}
