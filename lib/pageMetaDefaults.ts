export type PageMetaEntry = {
  title: string;
  description: string;
  keywords?: string;
  robots?: { index: boolean; follow: boolean };
};

export type PageMetaKey =
  | 'home'
  | 'about'
  | 'courses'
  | 'course'
  | 'placement'
  | 'team'
  | 'gallery'
  | 'news'
  | 'newsDetail'
  | 'blog'
  | 'blogDetail'
  | 'studentHub'
  | 'certificateVerify'
  | 'flightAnnouncements'
  | 'virtualClassroomLogin'
  | 'virtualClassroom'
  | 'careers'
  | 'aviationCareers'
  | 'contact'
  | 'sitemap'
  | 'itDepartment'
  | 'admin'
  | 'superadmin';

/** Human labels + path for the admin SEO editor (public pages only). */
export const PAGE_META_ADMIN_ROWS: {
  key: PageMetaKey;
  label: string;
  path: string;
}[] = [
  { key: 'home', label: 'Home', path: '/' },
  { key: 'about', label: 'About', path: '/about' },
  { key: 'courses', label: 'Courses', path: '/courses' },
  { key: 'course', label: 'Course detail (template)', path: '/courses/[id]' },
  { key: 'placement', label: 'Placement', path: '/placement' },
  { key: 'team', label: 'Our Team', path: '/team' },
  { key: 'gallery', label: 'Media Gallery', path: '/gallery' },
  { key: 'news', label: 'News & Updates', path: '/news' },
  { key: 'newsDetail', label: 'News detail (template)', path: '/news/[id]' },
  { key: 'blog', label: 'Blog', path: '/blog' },
  { key: 'blogDetail', label: 'Blog detail (template)', path: '/blog/[slug]' },
  { key: 'studentHub', label: 'Student Hub', path: '/student-hub' },
  { key: 'certificateVerify', label: 'Verify Certificate', path: '/students/verify' },
  { key: 'flightAnnouncements', label: 'Flight Announcements', path: '/flight-announcements' },
  { key: 'virtualClassroomLogin', label: 'Virtual Classroom Login', path: '/virtual-classroom-login' },
  { key: 'virtualClassroom', label: 'Virtual Classroom', path: '/virtual-classroom' },
  { key: 'careers', label: 'Careers', path: '/careers' },
  { key: 'aviationCareers', label: 'Aviation Careers', path: '/aviation-careers' },
  { key: 'contact', label: 'Contact', path: '/contact' },
  { key: 'sitemap', label: 'Sitemap', path: '/sitemap' },
  { key: 'itDepartment', label: 'IT Department', path: '/it-department' },
];

export const DEFAULT_PAGE_META: Record<PageMetaKey, PageMetaEntry> = {
  home: {
    title: 'Kite Institute of Aviation & Hospitality | Aviation & Hospitality Training',
    description:
      'Kite Institute of Aviation & Hospitality offers top-notch training in aviation, hospitality, and travel management. Start your dream career today!',
  },
  about: {
    title: 'About Kite',
    description: 'India’s aviation and hospitality training institute in Koramangala, Bengaluru.',
  },
  courses: {
    title: 'Courses',
    description: 'Diploma, ground services, ramp, airport operations, travel, and cargo courses at Kite.',
  },
  course: {
    title: 'Course',
    description: 'Course details, eligibility, and curriculum at Kite Institute of Aviation & Hospitality.',
  },
  placement: {
    title: 'Placement',
    description: 'Placement stories and hiring partners of Kite Institute of Aviation & Hospitality.',
  },
  team: {
    title: 'Our Team',
    description: 'Faculty and leadership at Kite Institute of Aviation & Hospitality.',
  },
  gallery: {
    title: 'Media Gallery',
    description: 'Campus, events, and celebrations at Kite Institute of Aviation & Hospitality.',
  },
  news: {
    title: 'News & Updates',
    description: 'Aviation and institute news from Kite Institute of Aviation & Hospitality.',
  },
  newsDetail: {
    title: 'News',
    description: 'News article from Kite Institute of Aviation & Hospitality.',
  },
  blog: {
    title: 'Blog',
    description:
      'Aviation career tips, hospitality insights, and institute guides from Kite Institute of Aviation & Hospitality.',
  },
  blogDetail: {
    title: 'Blog',
    description: 'Article from the Kite Institute blog.',
  },
  studentHub: {
    title: 'Student Hub',
    description: 'Quizzes, virtual classroom, and student tools at Kite.',
  },
  certificateVerify: {
    title: 'Verify Certificate',
    description:
      'Verify Kite Institute student course certificates online using certificate number and student name.',
  },
  flightAnnouncements: {
    title: 'Flight Announcements',
    description: 'Practice cabin-crew announcement scripts at Kite.',
  },
  virtualClassroomLogin: {
    title: 'Virtual Classroom',
    description: 'Preview recorded classroom sessions at Kite.',
  },
  virtualClassroom: {
    title: 'Virtual Classroom',
    description: 'Sample recorded sessions from Kite Institute.',
  },
  careers: {
    title: 'Careers',
    description: 'Jobs at Kite Institute of Aviation & Hospitality.',
  },
  aviationCareers: {
    title: 'Aviation Careers',
    description: 'Airline and airport job posts shared by Kite.',
  },
  contact: {
    title: 'Contact',
    description: 'Address, phone, and enquiry form for Kite Institute in Koramangala, Bengaluru.',
  },
  sitemap: {
    title: 'Sitemap',
    description: 'All pages on the Kite Institute website.',
  },
  itDepartment: {
    title: 'IT Department',
    description: 'Kite Institute IT department services.',
  },
  admin: {
    title: 'Admin',
    description: 'Kite admin',
    robots: { index: false, follow: false },
  },
  superadmin: {
    title: 'Superadmin Portal',
    description: 'Kite superadmin portal',
    robots: { index: false, follow: false },
  },
};
