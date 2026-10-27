'use client';

import { Link, useLocation } from '@/lib/router';
import { useState, useEffect } from 'react';

// Get base URL for assets
const getAssetUrl = (path) => `${'/'}${path}`;

function Header() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path) => {
    if (path === '/news') {
      return location.pathname === '/news' || location.pathname.startsWith('/news/') ? 'active' : '';
    }
    return location.pathname === path ? 'active' : '';
  };

  // Handle mobile menu toggle - add/remove class to body
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

  // Close menu when clicking on a link
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
          <img src={getAssetUrl("icons/logo-lt.svg")} alt="Kite Institute of Aviation & Hospitality"/>
        </Link>
        
        <div className="links">
          <Link to="/about" className={`item ${isActive('/about')}`} onClick={handleLinkClick}>
            <div className="text">
              <div className="front">About Kite</div>
            </div>
          </Link>
          
          <Link to="/courses" className={`item ${isActive('/courses')}`} onClick={handleLinkClick}>
            <div className="text">
              <div className="front">Courses</div>
            </div>
          </Link>
          
          <Link to="/placement" className={`item ${isActive('/placement')}`} onClick={handleLinkClick}>
            <div className="text">
              <div className="front">Placement</div>
            </div>
          </Link>
          
          <Link to="/news" className={`item ${isActive('/news')}`} onClick={handleLinkClick}>
            <div className="text">
              <div className="front">News & Updates</div>
            </div>
          </Link>
          
          <Link to="/gallery" className={`item ${isActive('/gallery')}`} onClick={handleLinkClick}>
            <div className="text">
              <div className="front">Media Gallery</div>
            </div>
          </Link>
          
          <Link to="/student-hub" className={`item ${isActive('/student-hub')}`} onClick={handleLinkClick}>
            <div className="text">
              <div className="front">Student Hub</div>
            </div>
          </Link>

          <Link to="/team" className={`item ${isActive('/team')}`} onClick={handleLinkClick}>
            <div className="text">
              <div className="front">Our Team</div>
            </div>
          </Link>

          <Link to="/careers" className={`item ${isActive('/careers')}`} onClick={handleLinkClick}>
            <div className="text">
              <div className="front">Careers</div>
            </div>
          </Link>
          
          <Link to="/contact" className={`item ${isActive('/contact')}`} onClick={handleLinkClick}>
            <div className="text">
              <div className="front">Contact</div>
            </div>
          </Link>
        </div>
      </div>
    </>
  );
}

export default Header;

