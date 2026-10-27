import { pushToDataLayer } from './dataLayer';

/**
 * Push form submission to Google Tag Manager dataLayer.
 * Sends all submitted form fields in form_data.
 * @see https://developers.google.com/tag-platform/tag-manager/datalayer
 *
 * @param {string} formName - Identifier for the form (e.g. 'enquiry', 'job_application')
 * @param {Object} formData - Submitted field values (all keys are sent in form_data)
 */
export function pushFormSubmitted(formName, formData) {
  const form_data = Object.fromEntries(
    Object.entries(formData || {}).filter(([, v]) => v != null && v !== '')
  );
  pushToDataLayer({
    event: 'form_submitted',
    form_name: formName,
    form_data
  });
}
