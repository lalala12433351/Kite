import fs from 'fs';
import path from 'path';
import { dataDir } from '@/lib/content';
import { atomicWriteJson } from '@/lib/safeJsonStore';
import { CERTIFICATE_BATCHES, isKnownBatch } from '@/lib/certificateBatches';

export type CertificateStatus = 'valid' | 'revoked' | 'expired';

export type Certificate = {
  id: number;
  certificateNumber: string;
  studentName: string;
  batch: string;
  course?: string;
  issueDate?: string;
  expiryDate?: string;
  status: CertificateStatus;
  createdAt: string;
  updatedAt: string;
};

const FILE = path.join(dataDir, 'certificates.json');

function ensureFile() {
  if (!fs.existsSync(FILE)) {
    fs.mkdirSync(path.dirname(FILE), { recursive: true });
    fs.writeFileSync(FILE, '[]\n', 'utf8');
  }
}

export function normalizeCode(value: string) {
  return String(value || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '');
}

export function normalizeName(value: string) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

export function namesMatch(storedName: string, inputName: string) {
  const stored = normalizeName(storedName);
  const input = normalizeName(inputName);
  if (!stored || !input) return false;
  if (stored === input) return true;
  const storedParts = stored.split(' ').filter(Boolean);
  const inputParts = input.split(' ').filter(Boolean);
  return inputParts.some((part) => storedParts.includes(part)) || storedParts.some((part) => inputParts.includes(part));
}

function deriveStatus(cert: Omit<Certificate, 'status'> & { status?: CertificateStatus }): CertificateStatus {
  if (cert.status === 'revoked') return 'revoked';
  if (cert.expiryDate) {
    const expiry = new Date(cert.expiryDate);
    if (!Number.isNaN(expiry.getTime()) && expiry.getTime() < Date.now()) return 'expired';
  }
  return 'valid';
}

export function readCertificates(): Certificate[] {
  ensureFile();
  try {
    const raw = JSON.parse(fs.readFileSync(FILE, 'utf8'));
    if (!Array.isArray(raw)) return [];
    return raw.map((item) => {
      const batch = String(item.batch || item.course || '').trim();
      const base = {
        id: Number(item.id) || 0,
        certificateNumber: String(item.certificateNumber || '').trim(),
        studentName: String(item.studentName || '').trim(),
        batch,
        course: item.course ? String(item.course).trim() : batch,
        issueDate: item.issueDate ? String(item.issueDate).trim() : '',
        expiryDate: item.expiryDate ? String(item.expiryDate).trim() : '',
        createdAt: String(item.createdAt || new Date().toISOString()),
        updatedAt: String(item.updatedAt || item.createdAt || new Date().toISOString()),
        status: item.status as CertificateStatus | undefined,
      };
      return { ...base, status: deriveStatus(base) };
    });
  } catch {
    return [];
  }
}

export function writeCertificates(list: Certificate[]) {
  ensureFile();
  atomicWriteJson(FILE, Array.isArray(list) ? list : []);
  return list;
}

export function publicCertificate(cert: Certificate) {
  return {
    certificateNumber: cert.certificateNumber,
    studentName: cert.studentName,
    batch: cert.batch || cert.course || '',
    course: cert.course || cert.batch || '',
    issueDate: cert.issueDate || '',
    status: cert.status,
    valid: cert.status === 'valid',
  };
}

export function findCertificateByNumber(code: string) {
  const normalized = normalizeCode(code);
  if (!normalized) return null;
  return readCertificates().find((cert) => normalizeCode(cert.certificateNumber) === normalized) || null;
}

export function verifyCertificate(code: string, name: string) {
  const cert = findCertificateByNumber(code);
  if (!cert) {
    return { ok: false as const, error: 'Certificate not found', reason: 'not_found' as const };
  }
  if (!namesMatch(cert.studentName, name)) {
    return {
      ok: false as const,
      error: 'The name entered does not match this certificate. Please try again with the correct first or last name.',
      reason: 'name_mismatch' as const,
    };
  }
  const payload = publicCertificate(cert);
  if (!payload.valid) {
    return {
      ok: true as const,
      certificate: payload,
      message: payload.status === 'revoked' ? 'This certificate has been revoked.' : 'This certificate has expired.',
    };
  }
  return { ok: true as const, certificate: payload, message: 'Certificate is valid.' };
}

type CertificateInput = {
  certificateNumber?: string;
  studentName?: string;
  batch?: string;
  course?: string;
  issueDate?: string;
  expiryDate?: string;
  status?: string;
};

function resolveBatch(input: CertificateInput) {
  const batch = String(input.batch || input.course || '').trim();
  if (!batch) throw new Error('Batch is required');
  if (!isKnownBatch(batch)) {
    // Allow Excel values that match a known batch ignoring case/spacing
    const normalized = batch.toLowerCase().replace(/\s+/g, ' ');
    const match = CERTIFICATE_BATCHES.find((item) => item.toLowerCase() === normalized);
    if (match) return match;
    throw new Error(`Unknown batch. Use one of the Kite flyer batches.`);
  }
  return batch;
}

function cleanInput(input: CertificateInput) {
  const certificateNumber = String(input.certificateNumber || '').trim();
  const studentName = String(input.studentName || '').trim();
  const batch = resolveBatch(input);
  const course = String(input.course || batch).trim() || batch;
  const issueDate = String(input.issueDate || '').trim();
  const expiryDate = String(input.expiryDate || '').trim();
  const statusRaw = String(input.status || 'valid').trim().toLowerCase();
  const status: CertificateStatus = statusRaw === 'revoked' ? 'revoked' : statusRaw === 'expired' ? 'expired' : 'valid';

  if (!certificateNumber) throw new Error('Certificate number is required');
  if (!studentName) throw new Error('Student name is required');

  return { certificateNumber, studentName, batch, course, issueDate, expiryDate, status };
}

export function addCertificate(input: CertificateInput) {
  const cleaned = cleanInput(input);
  const list = readCertificates();
  if (list.some((cert) => normalizeCode(cert.certificateNumber) === normalizeCode(cleaned.certificateNumber))) {
    throw new Error('A certificate with this number already exists');
  }
  const now = new Date().toISOString();
  const maxId = list.reduce((max, cert) => Math.max(max, Number(cert.id) || 0), 0);
  const next: Certificate = {
    id: maxId + 1,
    ...cleaned,
    status: deriveStatus({ ...cleaned, createdAt: now, updatedAt: now, id: maxId + 1 }),
    createdAt: now,
    updatedAt: now,
  };
  list.push(next);
  writeCertificates(list);
  return next;
}

export function updateCertificate(id: number, input: CertificateInput) {
  const list = readCertificates();
  const index = list.findIndex((cert) => Number(cert.id) === Number(id));
  if (index < 0) throw new Error('Certificate not found');
  const cleaned = cleanInput(input);
  const duplicate = list.find(
    (cert) => cert.id !== id && normalizeCode(cert.certificateNumber) === normalizeCode(cleaned.certificateNumber),
  );
  if (duplicate) throw new Error('A certificate with this number already exists');
  const now = new Date().toISOString();
  const updated: Certificate = {
    ...list[index],
    ...cleaned,
    status: deriveStatus({ ...list[index], ...cleaned, updatedAt: now }),
    updatedAt: now,
  };
  list[index] = updated;
  writeCertificates(list);
  return updated;
}

export function deleteCertificate(id: number) {
  const list = readCertificates();
  const next = list.filter((cert) => Number(cert.id) !== Number(id));
  if (next.length === list.length) throw new Error('Certificate not found');
  writeCertificates(next);
  return true;
}

const HEADER_ALIASES: Record<string, keyof CertificateInput> = {
  certificatenumber: 'certificateNumber',
  certificate_number: 'certificateNumber',
  certificateno: 'certificateNumber',
  certificate_no: 'certificateNumber',
  certno: 'certificateNumber',
  cert_no: 'certificateNumber',
  code: 'certificateNumber',
  studentname: 'studentName',
  student_name: 'studentName',
  name: 'studentName',
  fullname: 'studentName',
  full_name: 'studentName',
  batch: 'batch',
  batchname: 'batch',
  batch_name: 'batch',
  course: 'course',
  coursename: 'course',
  course_name: 'course',
  program: 'course',
  issuedate: 'issueDate',
  issue_date: 'issueDate',
  dateofissue: 'issueDate',
  date_of_issue: 'issueDate',
  expirydate: 'expiryDate',
  expiry_date: 'expiryDate',
  validuntil: 'expiryDate',
  valid_until: 'expiryDate',
  status: 'status',
};

function mapHeader(header: unknown): keyof CertificateInput | null {
  const key = String(header || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
  const compact = key.replace(/_/g, '');
  return HEADER_ALIASES[key] || HEADER_ALIASES[compact] || null;
}

function excelSerialToIso(value: unknown) {
  if (value == null || value === '') return '';
  if (typeof value === 'number' && Number.isFinite(value)) {
    const utc = Math.round((value - 25569) * 86400 * 1000);
    const date = new Date(utc);
    if (!Number.isNaN(date.getTime())) return date.toISOString().slice(0, 10);
  }
  const asString = String(value).trim();
  const parsed = new Date(asString);
  if (!Number.isNaN(parsed.getTime()) && /^\d{4}-\d{2}-\d{2}/.test(asString)) return asString.slice(0, 10);
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
  return asString;
}

export function rowsFromSheetMatrix(matrix: unknown[][]) {
  if (!Array.isArray(matrix) || matrix.length < 2) return [] as CertificateInput[];
  const headers = (matrix[0] || []).map(mapHeader);
  const rows: CertificateInput[] = [];
  for (let i = 1; i < matrix.length; i += 1) {
    const line = matrix[i] || [];
    if (!line.some((cell) => String(cell ?? '').trim())) continue;
    const row: CertificateInput = {};
    headers.forEach((field, col) => {
      if (!field) return;
      const raw = line[col];
      if (field === 'issueDate' || field === 'expiryDate') {
        row[field] = excelSerialToIso(raw);
      } else {
        row[field] = String(raw ?? '').trim();
      }
    });
    if (!row.batch && row.course) row.batch = row.course;
    rows.push(row);
  }
  return rows;
}

export function bulkUpsertCertificates(rows: CertificateInput[], { overwrite = true } = {}) {
  const list = readCertificates();
  let added = 0;
  let updated = 0;
  let skipped = 0;
  const errors: { row: number; error: string }[] = [];
  let maxId = list.reduce((max, cert) => Math.max(max, Number(cert.id) || 0), 0);

  rows.forEach((row, index) => {
    try {
      const cleaned = cleanInput(row);
      const existingIndex = list.findIndex(
        (cert) => normalizeCode(cert.certificateNumber) === normalizeCode(cleaned.certificateNumber),
      );
      const now = new Date().toISOString();
      if (existingIndex >= 0) {
        if (!overwrite) {
          skipped += 1;
          return;
        }
        list[existingIndex] = {
          ...list[existingIndex],
          ...cleaned,
          status: deriveStatus({ ...list[existingIndex], ...cleaned, updatedAt: now }),
          updatedAt: now,
        };
        updated += 1;
        return;
      }
      maxId += 1;
      list.push({
        id: maxId,
        ...cleaned,
        status: deriveStatus({ ...cleaned, createdAt: now, updatedAt: now, id: maxId }),
        createdAt: now,
        updatedAt: now,
      });
      added += 1;
    } catch (error) {
      errors.push({ row: index + 2, error: error instanceof Error ? error.message : 'Invalid row' });
    }
  });

  writeCertificates(list);
  return { added, updated, skipped, errors, total: list.length };
}

export { CERTIFICATE_BATCHES };
