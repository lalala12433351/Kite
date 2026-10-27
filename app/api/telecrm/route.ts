export async function POST(request) {
  let lead = {};
  try {
    lead = await request.json();
  } catch {
    lead = {};
  }

  const url = process.env.TELECRM_API_URL;
  const key = process.env.TELECRM_API_KEY;
  if (!url || !key) {
    return Response.json({ ok: true, skipped: true, reason: 'not_configured' });
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify(lead),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return Response.json({ ok: false, skipped: true, reason: 'telecrm_api_error', data });
    }
    return Response.json({ ok: true, data });
  } catch {
    return Response.json({ ok: false, skipped: true, reason: 'telecrm_api_error' });
  }
}
