import fs from 'fs';
import path from 'path';
import { dataDir } from '@/lib/content';
import { atomicWriteJson } from '@/lib/safeJsonStore';

const filePath = path.join(dataDir, 'form-submissions.json');
const MAX_LEADS = 500;

function readLeads() {
  if (!fs.existsSync(filePath)) return [];
  try {
    const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Persist a validated website form so the lead is kept even when email is not configured. */
export function saveFormLead(type: string, fields: Record<string, unknown>) {
  const clean: Record<string, string> = {};
  for (const [key, value] of Object.entries(fields)) {
    if (value == null) continue;
    const text = String(value).trim();
    if (!text) continue;
    clean[key.slice(0, 80)] = text.slice(0, 4000);
  }

  const entry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    receivedAt: new Date().toISOString(),
    fields: clean,
  };

  const existing = readLeads();
  existing.push(entry);
  atomicWriteJson(filePath, existing.slice(-MAX_LEADS));
  return entry;
}
