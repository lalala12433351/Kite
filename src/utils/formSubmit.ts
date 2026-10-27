import { getPhpBackendUrl } from './phpBackendUrl';

/**
 * Same-origin URLs for form mail PHP scripts at site document root on production.
 */
const ENDPOINTS = {
  enquiry: 'api/forms/enquiry',
  contact: 'api/forms/contact',
  job: 'api/forms/job',
  chat: 'api/forms/chat',
};

export function getFormSubmitUrl(type) {
  const path = ENDPOINTS[type];
  if (!path) {
    throw new Error(`Unknown form submit type: ${type}`);
  }
  return getPhpBackendUrl(path);
}
