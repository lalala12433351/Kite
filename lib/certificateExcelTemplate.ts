import * as XLSX from 'xlsx';
import { CERTIFICATE_BATCHES } from '@/lib/certificateBatches';

/** Canonical Excel columns for certificate bulk upload. */
export const CERTIFICATE_EXCEL_HEADERS = [
  'Certificate Number',
  'Student Name',
  'Batch',
  'Issue Date',
  'Status',
] as const;

export function buildCertificateTemplateWorkbook() {
  const sampleRows = [
    [...CERTIFICATE_EXCEL_HEADERS],
    [
      'KITE-2026-0001',
      'Anita Sharma',
      'Diploma in Aviation & Hospitality (AASSC · 1 Year)',
      '2026-01-15',
      'valid',
    ],
    [
      'KITE-2026-0002',
      'Rahul Kumar',
      'Airport Operations Fundamentals (IATA · 6 Months)',
      '2026-02-01',
      'valid',
    ],
    [
      'KITE-2026-0003',
      'Priya Nair',
      'Passenger Ground Services (IATA · 6 Months)',
      '2026-03-10',
      'valid',
    ],
  ];

  const batchRows = [
    ['Batch (copy exact text into Certificates sheet)'],
    ...CERTIFICATE_BATCHES.map((batch) => [batch]),
  ];

  const notesRows = [
    ['Field', 'Required', 'Format / notes'],
    ['Certificate Number', 'Yes', 'Unique ID, e.g. KITE-2026-0001'],
    ['Student Name', 'Yes', 'Full name as on certificate'],
    ['Batch', 'Yes', 'Must match a value from the Batches sheet exactly'],
    ['Issue Date', 'No', 'YYYY-MM-DD (e.g. 2026-01-15)'],
    ['Status', 'No', 'valid or revoked (default: valid)'],
    ['Expiry Date', 'No', 'Not used — do not include'],
  ];

  const workbook = XLSX.utils.book_new();
  const certificates = XLSX.utils.aoa_to_sheet(sampleRows);
  certificates['!cols'] = [{ wch: 22 }, { wch: 22 }, { wch: 62 }, { wch: 14 }, { wch: 10 }];
  XLSX.utils.book_append_sheet(workbook, certificates, 'Certificates');

  const batches = XLSX.utils.aoa_to_sheet(batchRows);
  batches['!cols'] = [{ wch: 70 }];
  XLSX.utils.book_append_sheet(workbook, batches, 'Batches');

  const notes = XLSX.utils.aoa_to_sheet(notesRows);
  notes['!cols'] = [{ wch: 22 }, { wch: 10 }, { wch: 55 }];
  XLSX.utils.book_append_sheet(workbook, notes, 'Instructions');

  return workbook;
}

export function buildCertificateTemplateBuffer() {
  const workbook = buildCertificateTemplateWorkbook();
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' }) as Buffer;
}
