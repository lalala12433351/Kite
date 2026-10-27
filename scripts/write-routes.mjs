import fs from 'fs';
import path from 'path';

const pages = [
  ['app/(site)/page.js', 'Home', 'home', '@/src/pages/Home'],
  ['app/(site)/about/page.js', 'About', 'about', '@/src/pages/About'],
  ['app/(site)/contact/page.js', 'Contact', 'contact', '@/src/pages/Contact'],
  ['app/(site)/courses/page.js', 'Courses', 'courses', '@/src/pages/Courses'],
  ['app/(site)/courses/[id]/page.js', 'CourseDetail', 'course', '@/src/pages/CourseDetail'],
  ['app/(site)/placement/page.js', 'Placement', 'placement', '@/src/pages/Placement'],
  ['app/(site)/team/page.js', 'Team', 'team', '@/src/pages/Team'],
  ['app/(site)/gallery/page.js', 'Gallery', 'gallery', '@/src/pages/Gallery'],
  ['app/(site)/news/page.js', 'News', 'news', '@/src/pages/News'],
  ['app/(site)/news/[id]/page.js', 'NewsDetail', 'newsDetail', '@/src/pages/NewsDetail'],
  ['app/(site)/student-hub/page.js', 'StudentHub', 'studentHub', '@/src/pages/StudentHub'],
  ['app/(site)/flight-announcements/page.js', 'FlightAnnouncements', 'flightAnnouncements', '@/src/pages/FlightAnnouncements'],
  ['app/(site)/virtual-classroom-login/page.js', 'VirtualClassroomLogin', 'virtualClassroomLogin', '@/src/pages/VirtualClassroomLogin'],
  ['app/(site)/virtual-classroom/page.js', 'VirtualClassroom', 'virtualClassroom', '@/src/pages/VirtualClassroom'],
  ['app/(site)/careers/page.js', 'Careers', 'careers', '@/src/pages/Careers'],
  ['app/(site)/aviation-careers/page.js', 'AviationCareers', 'aviationCareers', '@/src/pages/AviationCareers'],
  ['app/(site)/sitemap/page.js', 'SitemapPage', 'sitemap', '@/src/pages/Sitemap'],
  ['app/(site)/it-department/page.js', 'KiteItDepartment', 'itDepartment', '@/src/pages/KiteItDepartment'],
  ['app/admin/page.js', 'AdminDashboard', 'admin', '@/src/pages/AdminDashboard'],
];

for (const [file, component, metaKey, importPath] of pages) {
  const full = path.join(process.cwd(), file);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  const body = `import PageComponent from '${importPath}';
import { pageMeta } from '@/lib/pageMeta';

export const metadata = pageMeta.${metaKey};

export default function ${component}Page() {
  return <PageComponent />;
}
`;
  fs.writeFileSync(full, body);
}

console.log('wrote', pages.length, 'routes');
