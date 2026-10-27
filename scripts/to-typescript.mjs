import fs from 'fs';
import path from 'path';

const roots = ['app', 'lib', 'src'].map((dir) => path.join(process.cwd(), dir));

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.(js|jsx)$/.test(entry.name)) out.push(full);
  }
  return out;
}

const files = roots.flatMap((dir) => walk(dir));

for (const file of files) {
  let text = fs.readFileSync(file, 'utf8');
  text = text.replace(/(from\s+['"][^'"]+)\.(jsx|js)(['"])/g, '$1$3');
  text = text.replace(/(import\(\s*['"][^'"]+)\.(jsx|js)(['"]\s*\))/g, '$1$3');
  const next = file.replace(/\.jsx$/, '.tsx').replace(/\.js$/, '.ts');
  fs.writeFileSync(next, text);
  fs.unlinkSync(file);
}

console.log('renamed', files.length, 'files');
