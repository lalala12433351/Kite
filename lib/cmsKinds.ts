export const CMS_KINDS = [
  'site-seo',
  'site-settings',
  'home',
  'about',
  'courses',
  'team',
  'placement',
  'contact',
  'student-hub',
  'flight-announcements',
  'virtual-classroom',
  'it-department',
  'chrome',
] as const;

export type CmsKind = (typeof CMS_KINDS)[number];

export const CMS_FILES: Record<CmsKind, string> = {
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
