import fs from 'fs';
import path from 'path';
import { dataDir } from '@/lib/content';

const BACKUP_DIR = path.join(dataDir, 'backups');
const MAX_BACKUPS_PER_FILE = 30;

function ensureBackupDir() {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

function stamp() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

/** Keep the newest N backups for a given basename prefix. */
function pruneBackups(baseName: string) {
  const prefix = `${baseName}.`;
  const files = fs
    .readdirSync(BACKUP_DIR)
    .filter((name) => name.startsWith(prefix) && name.endsWith('.json'))
    .map((name) => ({
      name,
      mtime: fs.statSync(path.join(BACKUP_DIR, name)).mtimeMs,
    }))
    .sort((a, b) => b.mtime - a.mtime);

  for (const old of files.slice(MAX_BACKUPS_PER_FILE)) {
    try {
      fs.unlinkSync(path.join(BACKUP_DIR, old.name));
    } catch {
      // ignore prune errors
    }
  }
}

/**
 * Copy the current file to data/backups before overwriting.
 * Never throws for missing source files.
 */
export function backupJsonFile(filePath: string) {
  if (!fs.existsSync(filePath)) return null;
  ensureBackupDir();
  const baseName = path.basename(filePath, '.json');
  const dest = path.join(BACKUP_DIR, `${baseName}.${stamp()}.json`);
  fs.copyFileSync(filePath, dest);
  pruneBackups(baseName);
  return dest;
}

/**
 * Write JSON atomically: temp file in the same directory, then rename.
 * Creates a backup of the previous file first when it exists.
 */
export function atomicWriteJson(filePath: string, data: unknown) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  backupJsonFile(filePath);

  const payload = `${JSON.stringify(data, null, 2)}\n`;
  const tmp = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(tmp, payload, 'utf8');
  fs.renameSync(tmp, filePath);
}

/**
 * Block accidental wipes: refuse saving an empty array when the on-disk
 * file already contains items.
 */
export function assertNotEmptyOverwrite(filePath: string, incomingLength: number, label: string) {
  if (incomingLength > 0) return;
  if (!fs.existsSync(filePath)) return;
  try {
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (Array.isArray(raw) && raw.length > 0) {
      throw new Error(
        `Refusing to save an empty ${label} list — that would delete ${raw.length} existing item(s). Reload and try again.`,
      );
    }
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('Refusing to save')) throw error;
    // corrupt/unreadable existing file — allow write
  }
}

/**
 * Merge incoming records onto existing ones by id so missing fields /
 * omitted posts in a partial payload do not erase stored data.
 */
export function mergeById<T extends { id: string }>(
  existing: T[],
  incoming: T[],
  options?: { allowDelete?: boolean },
): T[] {
  const allowDelete = options?.allowDelete !== false;
  const existingMap = new Map(existing.map((item) => [item.id, item]));
  const seen = new Set<string>();
  const merged: T[] = [];

  for (const item of incoming) {
    const id = String(item?.id || '');
    if (!id) continue;
    seen.add(id);
    const prev = existingMap.get(id);
    merged.push(prev ? ({ ...prev, ...item, id } as T) : item);
  }

  if (!allowDelete) {
    for (const item of existing) {
      if (!seen.has(item.id)) merged.push(item);
    }
  }

  return merged;
}
