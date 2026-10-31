'use client';

import { Link, useLocation } from '@/lib/router';
import { useState, useEffect } from 'react';
import { useCmsContent, cmsAssetUrl } from '@/src/hooks/useCmsContent';
import chromeFallback from '../../data/chrome.json';

function Header() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { data: chrome } = useCmsContent('chrome', chromeFallback);
  const nav = chrome?.nav?.length ? chrome.nav : chromeFallback.nav;
  const logo = chrome?.logo || chromeFallback.logo;

  const isActive = (path) => {
    if (path === '/news') {
      return location.pathname === '/news' || location.pathname.startsWith('/news/') ? 'active' : '';
    }
    return location.pathname === path ? 'active' : '';
  };

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.classList.add('menu-opened');
    } else {
      document.body.classList.remove('menu-opened');
    }

    return () => {
      document.body.classList.remove('menu-opened');
    };
  }, [isMobileMenuOpen]);

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <button
        type="button"
        className="mobile-menu for-mobile"
        aria-expanded={isMobileMenuOpen}
        aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        <svg width="22" height="16" viewBox="0 0 22 16" aria-hidden="true">
          <path d="M0 1h22M0 8h22M0 15h22" stroke="currentColor" strokeWidth="2" />
        </svg>
      </button>

      <div className="nav-menu">
        <Link to="/" className="app-logo">
          <img src={cmsAssetUrl(logo.src)} alt={logo.alt || 'Kite Institute of Aviation & Hospitality'} />
        </Link>

        <div className="links">
          {nav.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={`item ${isActive(item.href)}`}
              onClick={handleLinkClick}
            >
              <div className="text">
                <div className="front">{item.label}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

export default Header;
