import fs from 'fs';

const files = [
  'src/pages/AdminDashboard.jsx',
  'src/pages/NewsAdmin.jsx',
  'src/pages/GalleryAdmin.jsx',
  'src/pages/CareersAdmin.jsx',
  'src/pages/AviationCareersAdmin.jsx',
];

const importLine = "import { submitAdminLogin, fetchAdminSession, submitAdminLogout } from '@/src/utils/adminAuth';\n";

for (const file of files) {
  let text = fs.readFileSync(file, 'utf8');
  text = text.replace(
    /if \(normalizedUsername === 'admin' && normalizedPassword === '[^']+'\) \{/g,
    'const session = await submitAdminLogin(normalizedUsername, normalizedPassword);\n    if (session?.ok) {'
  );
  text = text.replace(/const handleLogin = \(event\) => \{/g, 'const handleLogin = async (event) => {');
  text = text.replace(/const handleLogin = \(e\) => \{/g, 'const handleLogin = async (e) => {');
  if (!text.includes('adminAuth')) {
    text = text.replace("'use client';\n\n", `'use client';\n\n${importLine}`);
  }
  if (text.includes("=== 'admin' && normalizedPassword")) {
    throw new Error(`password check remains in ${file}`);
  }
  fs.writeFileSync(file, text);
}

const phoneFiles = [
  'src/services/chatAnswers.js',
  'src/services/assistantEngine.js',
  'src/services/aviationHospitalityFAQ.js',
];
for (const file of phoneFiles) {
  const text = fs.readFileSync(file, 'utf8').replaceAll('+91 81470 16007', '+91 70228 33935');
  fs.writeFileSync(file, text);
}

for (const file of ['src/pages/Home.jsx', 'src/pages/About.jsx', 'src/pages/Placement.jsx']) {
  const text = fs.readFileSync(file, 'utf8').replaceAll(
    "{ name: 'vistara', url: 'https://www.airindia.com/' }",
    "{ name: 'vistara', url: 'https://www.airvistara.com/' }"
  );
  fs.writeFileSync(file, text);
}

let gallery = fs.readFileSync('src/pages/GalleryAdmin.jsx', 'utf8');
gallery = gallery.replaceAll("`${'/'}gallery-admin.php`", "'/api/gallery-admin'");
fs.writeFileSync('src/pages/GalleryAdmin.jsx', gallery);

let api = fs.readFileSync('src/utils/galleryAdminApi.js', 'utf8');
api = api.replace(
  /export function getGalleryAdminApiUrl\(\) \{[\s\S]*?\}/,
  `export function getGalleryAdminApiUrl() {\n  return '/api/gallery-admin';\n}`
);
fs.writeFileSync('src/utils/galleryAdminApi.js', api);

let forms = fs.readFileSync('src/utils/formSubmit.js', 'utf8');
forms = forms.replace(
  /const ENDPOINTS = \{[\s\S]*?\};/,
  `const ENDPOINTS = {
  enquiry: 'api/forms/enquiry',
  contact: 'api/forms/contact',
  job: 'api/forms/job',
  chat: 'api/forms/chat',
};`
);
fs.writeFileSync('src/utils/formSubmit.js', forms);

let tele = fs.readFileSync('src/utils/telecrmLead.js', 'utf8');
tele = tele.replace(
  /function getTelecrmLeadUrl\(\) \{\n  return getPhpBackendUrl\('telecrm-lead\.php'\);\n\}/,
  `function getTelecrmLeadUrl() {\n  return '/api/telecrm';\n}`
);
fs.writeFileSync('src/utils/telecrmLead.js', tele);

let quill = fs.readFileSync('src/components/RichTextEditor.jsx', 'utf8');
quill = quill.replace("import('react-quill')", "import('react-quill-new')");
quill = quill.replace("import('react-quill/dist/quill.snow.css')", "import('react-quill-new/dist/quill.snow.css')");
fs.writeFileSync('src/components/RichTextEditor.jsx', quill);

console.log('patches applied');
