/**
 * Shared GTM dataLayer helpers (client-only).
 * - Safe for SSR (no window/document usage on server)
 * - Logs every push to the console for debugging
 */
export function ensureDataLayer() {
  if (typeof window === 'undefined') return null;
  window.dataLayer = window.dataLayer || [];
  return window.dataLayer;
}

function patchDataLayerLogging() {
  const dl = ensureDataLayer() as (Record<string, unknown>[] & { _pushPatched?: boolean }) | null;
  if (!dl || dl._pushPatched) return;
  const originalPush = dl.push.bind(dl);
  dl.push = function (payload) {
    // eslint-disable-next-line no-console
    console.log('[GTM dataLayer]', payload);
    return originalPush(payload);
  };
  dl._pushPatched = true;
}

export function pushToDataLayer(payload) {
  const dl = ensureDataLayer();
  if (!dl) return;
  patchDataLayerLogging();
  dl.push(payload);
}

