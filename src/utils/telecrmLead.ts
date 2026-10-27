import { getPhpBackendUrl } from './phpBackendUrl';

/**
 * Push a lead to TeleCRM via server-side telecrm-lead.php (token stays on server).
 * Failures are logged only — form submit UX is not blocked.
 */
function getTelecrmLeadUrl() {
  return getPhpBackendUrl('telecrm-lead.php');
}

export async function pushLeadToTelecrm(lead = {}) {
  const url = getTelecrmLeadUrl();
  console.log('[TeleCRM] sending lead…', { url, lead });

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lead),
      keepalive: true,
    });

    const text = await response.text();
    const looksLikeHtml = /^\s*<!doctype/i.test(text) || /<html[\s>]/i.test(text);
    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = looksLikeHtml
        ? {
            ok: false,
            error:
              'telecrm-lead.php was not reached (got the website page). On Node hosting, restart server.js after deploy; on Apache, ensure telecrm-lead.php is in dist/.',
          }
        : { raw: text };
    }

    if (data.skipped) {
      if (data.reason === 'telecrm_api_error') {
        console.info('[TeleCRM] lead not synced (fix credentials in telecrm-config.php). Email was still sent.');
      } else {
        console.info('[TeleCRM] skipped:', data.reason || data);
      }
      return { ok: true, skipped: true, data };
    }

    if (!response.ok) {
      console.info('[TeleCRM] unavailable (HTTP ' + response.status + '). Email was still sent if the form succeeded.');
      return { ok: false, data };
    }

    if (data.ok) {
      console.log('[TeleCRM] lead synced:', data);
    } else {
      console.info('[TeleCRM] no lead synced:', data);
    }

    return { ok: Boolean(data.ok), data };
  } catch (err) {
    console.warn('[TeleCRM] network error:', err);
    return { ok: false, error: err };
  }
}
