/**
 * Parse plain-text / JSON body from sendmail-*.php endpoints.
 */
export function parseFormMailResponse(raw, status) {
  const text = String(raw ?? '').replace(/^\uFEFF/, '').trim();
  const lower = text.toLowerCase();
  const looksLikeHtml = /^\s*<!doctype/i.test(text) || /<html[\s>]/i.test(text);

  if (looksLikeHtml) {
    return {
      ok: false,
      error:
        'Form mail script was not reached (received the website page instead of PHP). Ensure sendmail-contact.php is at the site root (e.g. https://kiteaviation.in/sendmail-contact.php), not only under /qa/.',
    };
  }

  if (lower === 'success' || lower.startsWith('success')) {
    return { ok: true };
  }

  try {
    const json = JSON.parse(text);
    if (json?.ok === true) return { ok: true };
    if (json?.error) return { ok: false, error: String(json.error) };
  } catch {
    /* not JSON */
  }

  if (text) return { ok: false, error: text };
  return {
    ok: false,
    error: status ? `Empty response from mail script (HTTP ${status})` : 'Empty response from mail script',
  };
}
