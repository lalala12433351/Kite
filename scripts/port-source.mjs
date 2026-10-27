import fs from 'fs';
import path from 'path';

const root = path.resolve('..');
const srcRoot = path.join(root, 'KiteWeb', 'src');
const dstRoot = path.join(process.cwd(), 'src');

const skip = new Set([
  'entry-client.jsx',
  'entry-server.jsx',
  'App.jsx',
  'AppRoutes.jsx',
  'AppRoutes.public.jsx',
  'main.jsx',
  'App.css',
  'index.css',
]);

function walk(dir, rel = '') {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const relPath = path.join(rel, ent.name);
    if (ent.isDirectory()) {
      walk(path.join(dir, ent.name), relPath);
      continue;
    }
    if (!rel && skip.has(ent.name)) continue;
    const from = path.join(dir, ent.name);
    const to = path.join(dstRoot, relPath);
    fs.mkdirSync(path.dirname(to), { recursive: true });
    const ext = path.extname(ent.name);
    if (ext === '.js' || ext === '.jsx') {
      let text = fs.readFileSync(from, 'utf8');
      text = text.replace(/from ['"]react-router-dom['"]/g, "from '@/lib/router'");
      text = text.replace(/import\.meta\.env\.BASE_URL/g, "'/'");
      text = text.replace(/import\.meta\.env\.DEV/g, "(process.env.NODE_ENV !== 'production')");
      const clientDir = /^(components|pages|hooks)([\\/]|$)/.test(relPath);
      if (clientDir && !text.startsWith("'use client'") && !text.startsWith('"use client"')) {
        text = `'use client';\n\n${text}`;
      }
      fs.writeFileSync(to, text);
    } else {
      fs.copyFileSync(from, to);
    }
  }
}

walk(srcRoot);
console.log('ported source to', dstRoot);
