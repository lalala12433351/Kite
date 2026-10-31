/** Batch options from Kite Institute course flyer (AASSC + IATA Online/Offline). */
export const CERTIFICATE_BATCHES = [
  'Diploma in Aviation & Hospitality (AASSC · 1 Year)',
  'Post Graduation Diploma (AASSC · 6 Months)',
  'GDS Fares & Ticketing — Online (IATA · 6 Months)',
  'Air Cargo Introductory — Online (IATA · 6 Months)',
  'Foundation in Travel & Tourism — Online (IATA · 6 to 8 Months)',
  'GDS Fares & Ticketing — Offline (IATA · 6 Months)',
  'Air Cargo Introductory — Offline (IATA · 6 Months)',
  'Airport Operations Fundamentals (IATA · 6 Months)',
  'Foundation in Travel & Tourism — Offline (IATA · 6 to 8 Months)',
  'Passenger Ground Services (IATA · 6 Months)',
] as const;

export type CertificateBatch = (typeof CERTIFICATE_BATCHES)[number];

export function isKnownBatch(value: string) {
  return CERTIFICATE_BATCHES.includes(value as CertificateBatch);
}
