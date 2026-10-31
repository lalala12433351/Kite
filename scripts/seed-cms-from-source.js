/**
 * Seeds CMS JSON files under data/ from lib/cmsDefaults templates.
 * Only writes files that do not already exist.
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const defaultsDir = path.join(root, 'lib', 'cmsDefaults');
const dataDir = path.join(root, 'data');

const FILES = {
  'site-seo': 'site-seo.json',
  'site-settings': 'site-settings.json',
  home: 'home.json',
  about: 'about.json',
  courses: 'courses.json',
  team: 'team.json',
  placement: 'placement.json',
  contact: 'contact.json',
  'student-hub': 'student-hub.json',
  'flight-announcements': 'flight-announcements.json',
  'virtual-classroom': 'virtual-classroom.json',
  'it-department': 'it-department.json',
  chrome: 'chrome.json',
};

function loadCoursesFromSource() {
  const tsPath = path.join(root, 'src', 'data', 'coursesData.ts');
  const raw = fs.readFileSync(tsPath, 'utf8');
  const arrStart = raw.indexOf('export const courses = [');
  if (arrStart < 0) throw new Error('Could not find courses array in coursesData.ts');
  const bracketStart = raw.indexOf('[', arrStart);
  let depth = 0;
  let end = bracketStart;
  for (let i = bracketStart; i < raw.length; i += 1) {
    const ch = raw[i];
    if (ch === '[') depth += 1;
    if (ch === ']') {
      depth -= 1;
      if (depth === 0) {
        end = i + 1;
        break;
      }
    }
  }
  let arrStr = raw.slice(bracketStart, end);
  arrStr = arrStr.replace(/&amp;/g, '&');
  // eslint-disable-next-line no-eval
  const courses = eval(arrStr);
  return { courses };
}

function readDefault(kind, filename) {
  if (kind === 'courses') {
    return loadCoursesFromSource();
  }
  const filePath = path.join(defaultsDir, filename);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing default template: ${filePath}`);
  }
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function main() {
  fs.mkdirSync(dataDir, { recursive: true });
  const written = [];
  const skipped = [];

  for (const [kind, filename] of Object.entries(FILES)) {
    const dest = path.join(dataDir, filename);
    if (fs.existsSync(dest)) {
      skipped.push(filename);
      continue;
    }
    const payload = readDefault(kind, filename);
    fs.writeFileSync(dest, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
    written.push(filename);
  }

  console.log('CMS seed complete.');
  if (written.length) console.log('Written:', written.join(', '));
  if (skipped.length) console.log('Skipped (already exist):', skipped.join(', '));
}

main();
