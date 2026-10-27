'use client';

import { submitAdminLogin, fetchAdminSession, submitAdminLogout } from '@/src/utils/adminAuth';
import { useEffect, useMemo, useState } from 'react';
import { useLocation } from '@/lib/router';
import CareersAdmin from './CareersAdmin';
import AviationCareersAdmin from './AviationCareersAdmin';
import NewsAdmin from './NewsAdmin';
import GalleryAdminHub from './GalleryAdminHub';
import Header from '../components/Header';
import Footer from '../components/Footer';

const ADMIN_KEY = 'kiteUnifiedAdmin';
const ACTIVE_MODULE_KEY = 'kiteUnifiedAdminActiveModule';

const modules = [
  { id: 'careers', label: 'Careers', component: CareersAdmin },
  { id: 'aviation', label: 'Aviation Careers', component: AviationCareersAdmin },
  { id: 'news', label: 'News', component: NewsAdmin },
  { id: 'gallery', label: 'Gallery', component: GalleryAdminHub },
];

function AdminDashboard() {
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Initialize activeModule from localStorage or default to first module
  const getInitialActiveModule = () => {
    if (typeof window === 'undefined') return modules[0].id;
    const saved = localStorage.getItem(ACTIVE_MODULE_KEY);
    const isValidModule = saved && modules.some(m => m.id === saved);
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
  
  // Save active module to localStorage whenever it changes (only when logged in)
  useEffect(() => {
    if (isLoggedIn) {
      localStorage.setItem(ACTIVE_MODULE_KEY, activeModule);
    }
  }, [activeModule, isLoggedIn]);
  
  // Restore active module when logging in
  useEffect(() => {
    if (isLoggedIn) {
      const saved = localStorage.getItem(ACTIVE_MODULE_KEY);
      const isValidModule = saved && modules.some(m => m.id === saved);
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
    setActiveModule(modules[0].id); // Reset to default on logout
  };

  const ActiveComponent = useMemo(() => {
    const found = modules.find((module) => module.id === activeModule);
    return found ? found.component : modules[0].component;
  }, [activeModule]);

  return (
    <div className="admin-dashboard">
      <Header />
      {!isLoggedIn && (
        <div className="admin-login-page">
          <div className="admin-login-card">
            <h2>Kite Admin Portal</h2>
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
                <h1>Kite Unified Admin</h1>
                <p>Manage careers, aviation careers, news, and gallery from a single dashboard.</p>
              </div>
              <button onClick={handleLogout} className="admin-btn--logout-small">
                Logout
              </button>
            </header>

            <nav className="unified-admin-nav">
              {modules.map((module) => (
                <button
                  key={module.id}
                  onClick={() => setActiveModule(module.id)}
                  className={`unified-admin-nav-btn ${activeModule === module.id ? 'unified-admin-nav-btn--active' : ''}`}
                >
                  {module.label}
                </button>
              ))}
            </nav>

            <section className="unified-admin-content">
              <ActiveComponent embedded onLogout={handleLogout} />
            </section>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}

export default AdminDashboard;

