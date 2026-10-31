'use client';

import { submitAdminLogin, fetchAdminSession, submitAdminLogout } from '@/src/utils/adminAuth';
import { useEffect, useMemo, useState } from 'react';
import { useLocation } from '@/lib/router';
import CareersAdmin from './CareersAdmin';
import AviationCareersAdmin from './AviationCareersAdmin';
import NewsAdmin from './NewsAdmin';
import GalleryAdminHub from './GalleryAdminHub';
import CmsSectionEditor from './cms/CmsSectionEditor';
import Header from '../components/Header';
import Footer from '../components/Footer';

const ADMIN_KEY = 'kiteUnifiedAdmin';
const ACTIVE_MODULE_KEY = 'kiteUnifiedAdminActiveModule';

const contentModules = [
  {
    id: 'seo',
    label: 'SEO & Meta',
    group: 'Content & SEO',
    component: () => (
      <CmsSectionEditor
        kind="site-seo"
        title="SEO & Meta"
        description="Page titles, descriptions, and Open Graph images used across the site."
      />
    ),
  },
  {
    id: 'settings',
    label: 'Site Settings',
    group: 'Content & SEO',
    component: () => (
      <CmsSectionEditor
        kind="site-settings"
        title="Site Settings"
        description="Phone, emails, address, map coordinates, social links, and brochure URL."
      />
    ),
  },
  {
    id: 'home',
    label: 'Home',
    group: 'Content & SEO',
    component: () => (
      <CmsSectionEditor
        kind="home"
        title="Home Page"
        description="Hero text, cover circle images, why-choose cards, FAQ, videos, and partner strip."
      />
    ),
  },
  {
    id: 'about',
    label: 'About',
    group: 'Content & SEO',
    component: () => (
      <CmsSectionEditor kind="about" title="About Page" description="About copy, MD message, vision and mission." />
    ),
  },
  {
    id: 'courses-cms',
    label: 'Courses',
    group: 'Content & SEO',
    component: () => (
      <CmsSectionEditor
        kind="courses"
        title="Courses"
        description="Course catalogue, covers, eligibility, modules, and KPIs."
      />
    ),
  },
  {
    id: 'team-cms',
    label: 'Team',
    group: 'Content & SEO',
    component: () => (
      <CmsSectionEditor kind="team" title="Team" description="Leadership and trainer profiles, bios, and photos." />
    ),
  },
  {
    id: 'placement-cms',
    label: 'Placement',
    group: 'Content & SEO',
    component: () => (
      <CmsSectionEditor
        kind="placement"
        title="Placement"
        description="Placement hero, student stories, videos, and hiring partners."
      />
    ),
  },
  {
    id: 'contact-cms',
    label: 'Contact',
    group: 'Content & SEO',
    component: () => (
      <CmsSectionEditor kind="contact" title="Contact Page" description="Contact page hero and related display copy." />
    ),
  },
  {
    id: 'student-hub-cms',
    label: 'Student Hub',
    group: 'Content & SEO',
    component: () => (
      <CmsSectionEditor kind="student-hub" title="Student Hub" description="Student Hub cards, copy, and hero media." />
    ),
  },
  {
    id: 'flight-cms',
    label: 'Flight Announcements',
    group: 'Content & SEO',
    component: () => (
      <CmsSectionEditor
        kind="flight-announcements"
        title="Flight Announcements"
        description="Announcement categories, scripts, and audio paths."
      />
    ),
  },
  {
    id: 'vc-cms',
    label: 'Virtual Classroom',
    group: 'Content & SEO',
    component: () => (
      <CmsSectionEditor
        kind="virtual-classroom"
        title="Virtual Classroom"
        description="Lesson list and virtual classroom login page copy."
      />
    ),
  },
  {
    id: 'it-cms',
    label: 'IT Department',
    group: 'Content & SEO',
    component: () => (
      <CmsSectionEditor kind="it-department" title="IT Department" description="Kite IT page content and services." />
    ),
  },
  {
    id: 'chrome-cms',
    label: 'Header & Footer',
    group: 'Content & SEO',
    component: () => (
      <CmsSectionEditor
        kind="chrome"
        title="Header & Footer"
        description="Navigation labels, footer links, and copyright text."
      />
    ),
  },
  { id: 'news', label: 'News', group: 'Publishing', component: NewsAdmin },
  { id: 'careers', label: 'Careers', group: 'Publishing', component: CareersAdmin },
  { id: 'aviation', label: 'Aviation Careers', group: 'Publishing', component: AviationCareersAdmin },
  { id: 'gallery', label: 'Gallery', group: 'Publishing', component: GalleryAdminHub },
];

const modules = contentModules;

function AdminDashboard() {
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const getInitialActiveModule = () => {
    if (typeof window === 'undefined') return modules[0].id;
    const saved = localStorage.getItem(ACTIVE_MODULE_KEY);
    const isValidModule = saved && modules.some((m) => m.id === saved);
    return isValidModule ? saved : modules[0].id;
  };

  const [activeModule, setActiveModule] = useState(() => getInitialActiveModule());

  useEffect(() => {
    fetchAdminSession().then((session) => {
      if (session?.loggedIn) setIsLoggedIn(true);
    });
  }, []);

  useEffect(() => {
    const moduleId = new URLSearchParams(location.search).get('module');
    if (moduleId && modules.some((m) => m.id === moduleId)) {
      setActiveModule(moduleId);
    }
  }, [location.search]);

  useEffect(() => {
    if (isLoggedIn) {
      localStorage.setItem(ACTIVE_MODULE_KEY, activeModule);
    }
  }, [activeModule, isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn) {
      const saved = localStorage.getItem(ACTIVE_MODULE_KEY);
      const isValidModule = saved && modules.some((m) => m.id === saved);
      if (isValidModule && saved !== activeModule) {
        setActiveModule(saved);
      }
    }
  }, [isLoggedIn]);

  const handleLogin = async (event) => {
    event.preventDefault();
    const normalizedUsername = username.trim();
    const normalizedPassword = password.trim();

    const session = await submitAdminLogin(normalizedUsername, normalizedPassword);
    if (session?.ok) {
      setIsLoggedIn(true);
      localStorage.setItem(ADMIN_KEY, 'true');
      localStorage.setItem('kiteGalleryAdmin', 'true');
      localStorage.setItem('kiteAdminUser', normalizedUsername || 'Admin');
      setLoginError(false);
    } else {
      setLoginError(true);
    }
  };

  const handleLogout = async () => {
    await submitAdminLogout();
    localStorage.removeItem(ADMIN_KEY);
    localStorage.removeItem('kiteCareersAdmin');
    localStorage.removeItem('kiteAviationAdmin');
    localStorage.removeItem('kiteNewsAdmin');
    localStorage.removeItem('kiteGalleryAdmin');
    localStorage.removeItem('kiteAdminUser');
    localStorage.removeItem(ACTIVE_MODULE_KEY);
    setIsLoggedIn(false);
    setUsername('');
    setPassword('');
    setActiveModule(modules[0].id);
  };

  const ActiveComponent = useMemo(() => {
    const found = modules.find((module) => module.id === activeModule);
    return found ? found.component : modules[0].component;
  }, [activeModule]);

  const groups = useMemo(() => {
    const map = new Map();
    modules.forEach((module) => {
      const list = map.get(module.group) || [];
      list.push(module);
      map.set(module.group, list);
    });
    return Array.from(map.entries());
  }, []);

  return (
    <div className="admin-dashboard">
      <Header />
      {!isLoggedIn && (
        <div className="admin-login-page">
          <div className="admin-login-card">
            <h2>Kite Admin Portal</h2>
            <p className="admin-login-sub">Sign in to manage SEO, page content, media, news, and careers.</p>
            <form onSubmit={handleLogin}>
              <label className="admin-label">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="admin-input"
                required
              />
              <label className="admin-label">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="admin-input"
                required
              />
              <button type="submit" className="admin-btn admin-btn--primary">
                Login
              </button>
              {loginError && <p className="admin-login-error">Invalid credentials</p>}
            </form>
          </div>
        </div>
      )}
      {isLoggedIn && (
        <div className="unified-admin-dashboard">
          <div className="admin-container">
            <header className="unified-admin-header">
              <div>
                <h1>Kite Content & SEO Admin</h1>
                <p>Edit cover images, page copy, SEO metadata, and publishing modules. Changes save permanently.</p>
              </div>
              <button onClick={handleLogout} className="admin-btn--logout-small">
                Logout
              </button>
            </header>

            <div className="cms-admin-layout">
              <aside className="cms-admin-sidebar">
                {groups.map(([groupName, items]) => (
                  <div key={groupName} className="cms-admin-group">
                    <p className="cms-admin-group-label">{groupName}</p>
                    <nav className="cms-admin-nav">
                      {items.map((module) => (
                        <button
                          key={module.id}
                          type="button"
                          onClick={() => setActiveModule(module.id)}
                          className={`cms-admin-nav-btn ${activeModule === module.id ? 'cms-admin-nav-btn--active' : ''}`}
                        >
                          {module.label}
                        </button>
                      ))}
                    </nav>
                  </div>
                ))}
              </aside>

              <section className="unified-admin-content cms-admin-main">
                <ActiveComponent embedded onLogout={handleLogout} />
              </section>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}

export default AdminDashboard;
