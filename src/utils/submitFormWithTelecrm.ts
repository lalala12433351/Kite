import { pushLeadToTelecrm } from './telecrmLead';

const TELECRM_SUBMIT_TIMEOUT_MS = 15000;

/**
 * Send lead to TeleCRM immediately when the user submits (before email).
 * Never throws — email can still run if TeleCRM fails.
 */
export async function syncTelecrmOnSubmit(lead, context = 'form') {
  try {
    const result = (await Promise.race([
      pushLeadToTelecrm(lead),
      new Promise((_, reject) => {
        setTimeout(() => reject(new Error('TeleCRM request timed out')), TELECRM_SUBMIT_TIMEOUT_MS);
      }),
    ])) as { ok?: boolean; skipped?: boolean; data?: { reason?: string }; error?: unknown };

    if (result?.ok && !result?.skipped) {
      console.log(`[TeleCRM] lead synced on submit (${context})`);
    } else if (result?.skipped) {
      console.info(`[TeleCRM] skipped on submit (${context}):`, result?.data?.reason || result?.data);
    } else {
      console.warn(`[TeleCRM] did not sync on submit (${context})`, result?.data || result?.error);
    }

    return result;
  } catch (err) {
    console.warn(`[TeleCRM] error on submit (${context}):`, err);
    return { ok: false, error: err };
  }
}

/** @deprecated Use syncTelecrmOnSubmit — runs TeleCRM before email */
export function startTelecrmLead(lead) {
  return pushLeadToTelecrm(lead);
}

/** @deprecated Use syncTelecrmOnSubmit */
export async function finishTelecrmLead(telecrmPromise, context = 'form') {
  if (!telecrmPromise) return null;
  try {
    return await telecrmPromise;
  } catch (err) {
    console.warn(`[TeleCRM] sync error (${context}):`, err);
    return { ok: false, error: err };
  }
}
