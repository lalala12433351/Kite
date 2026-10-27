'use client';

import { Link, useNavigate } from '@/lib/router';
import { fetchAdminSession, submitAdminLogout } from '@/src/utils/adminAuth';
import { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import VirtualAssistant from './VirtualAssistant';
import EnquiryForm from './EnquiryForm';
import MagazineHolder from './MagazineHolder';
import ChatButton from './ChatButton';
import MagazineButton from './MagazineButton';
import PrivacyPopup from './PrivacyPopup';
import CallbackPopup from './CallbackPopup';

const getAssetUrl = (path) => `${'/'}${path}`;

function Layout({ children }) {
  const [showEnquiryForm, setShowEnquiryForm] = useState(false);
  const [preSelectedCourse, setPreSelectedCourse] = useState('');
  const [enquiryFormTitle, setEnquiryFormTitle] = useState('Enquiry Form');
  const [enquiryFormVariant, setEnquiryFormVariant] = useState('enquiry');
  const [showChatbot, setShowChatbot] = useState(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('chat-opened') === 'true';
  });
  const [showMagazine, setShowMagazine] = useState(false);
  const [showCampusTour, setShowCampusTour] = useState(false);
  const [showPrivacyPopup, setShowPrivacyPopup] = useState(false);
  const [adminInfo, setAdminInfo] = useState({ loggedIn: false, name: 'Admin' });
  const navigate = useNavigate();

  const updateAdminInfo = () => {
    fetchAdminSession().then((session) => {
      setAdminInfo({
        loggedIn: Boolean(session?.loggedIn),
        name: session?.name || 'Admin',
      });
    });
  };

  useEffect(() => {
    updateAdminInfo();

    // Listen for enquiry form open event (detail: { course?, title? })
    const handleOpenEnquiryForm = (event) => {
      const course = event.detail?.course || '';
      const title = event.detail?.title || 'Enquiry Form';
      const variant =
        event.detail?.variant ||
        (title === 'Request a Callback' || title === 'Contact Us Message' ? 'contact' : 'enquiry');
      setPreSelectedCourse(course);
      setEnquiryFormTitle(title);
      setEnquiryFormVariant(variant);
      setShowEnquiryForm(true);
    };

    // Listen for chatbot open event
    const handleOpenChatbot = () => {
      setShowChatbot(true);
      localStorage.setItem("chat-opened", "true");
    };

    // Listen for campus tour open event
    const handleOpenCampusTour = () => {
      setShowCampusTour(true);
    };

    const handleOpenPrivacyPopup = () => {
      setShowPrivacyPopup(true);
    };

    window.addEventListener('openEnquiryForm', handleOpenEnquiryForm);
    window.addEventListener('openChatbot', handleOpenChatbot);
    window.addEventListener('openCampusTour', handleOpenCampusTour);
    window.addEventListener('openPrivacyPopup', handleOpenPrivacyPopup);
    window.addEventListener('adminAuthChanged', updateAdminInfo);
    window.addEventListener('storage', updateAdminInfo);

    // Tooltip mouse follow functionality
    const movedTooltips = new Map(); // Track moved tooltips and their original parents
    
    const handleMouseMove = (e) => {
      const tooltips = document.querySelectorAll<HTMLElement>('.tooltip-txt');
      tooltips.forEach((tooltip) => {
        // Check if tooltip is visible (has display: block)
        const computedStyle = window.getComputedStyle(tooltip);
        const isVisible = computedStyle.display !== 'none';
        
        if (isVisible) {
          // Move tooltip to body if it has a transformed parent
          if (tooltip.parentElement && tooltip.parentElement !== document.body) {
            const parent = tooltip.parentElement;
            const parentStyle = window.getComputedStyle(parent);
            
            // Check if parent has transform or related properties
            if (parentStyle.transform !== 'none' || 
                parentStyle.willChange.includes('transform') ||
                parentStyle.filter !== 'none' ||
                parentStyle.perspective !== 'none') {
              
              // Store original parent for later restoration
              if (!movedTooltips.has(tooltip)) {
                movedTooltips.set(tooltip, { parent, nextSibling: tooltip.nextSibling });
              }
              
              // Move to body
              document.body.appendChild(tooltip);
            }
          }
          
          // Reset all properties that could create a containing block or affect positioning
          tooltip.style.setProperty('transform', 'none', 'important');
          tooltip.style.setProperty('will-change', 'auto', 'important');
          tooltip.style.setProperty('filter', 'none', 'important');
          tooltip.style.setProperty('perspective', 'none', 'important');
          tooltip.style.setProperty('contain', 'none', 'important');
          tooltip.style.setProperty('backdrop-filter', 'none', 'important');
          
          // Ensure tooltip is positioned relative to viewport
          tooltip.style.setProperty('position', 'fixed', 'important');
          tooltip.style.setProperty('margin', '0', 'important');
          tooltip.style.setProperty('right', 'auto', 'important');
          tooltip.style.setProperty('bottom', 'auto', 'important');

          const gap = 10;
          let left = e.clientX + gap;
          let top = e.clientY + gap;

          // Set position once so we can measure tooltip size
          tooltip.style.setProperty('left', `${left}px`, 'important');
          tooltip.style.setProperty('top', `${top}px`, 'important');
          const rect = tooltip.getBoundingClientRect();
          const vw = window.innerWidth;
          const vh = window.innerHeight;

          // Clamp so tooltip stays inside viewport (no cropping or going out)
          const clampedLeft = Math.max(gap, Math.min(left, vw - rect.width - gap));
          const clampedTop = Math.max(gap, Math.min(top, vh - rect.height - gap));
          tooltip.style.setProperty('left', `${clampedLeft}px`, 'important');
          tooltip.style.setProperty('top', `${clampedTop}px`, 'important');
        } else {
          // Restore tooltip to original parent when hidden
          if (movedTooltips.has(tooltip)) {
            const { parent, nextSibling } = movedTooltips.get(tooltip);
            if (nextSibling && nextSibling.parentNode === parent) {
              parent.insertBefore(tooltip, nextSibling);
            } else {
              parent.appendChild(tooltip);
            }
            movedTooltips.delete(tooltip);
          }
        }
      });
    };

    let mouseFrame = 0;
    const onMouseMove = (e) => {
      if (mouseFrame) return;
      mouseFrame = window.requestAnimationFrame(() => {
        mouseFrame = 0;
        handleMouseMove(e);
      });
    };
    document.addEventListener('mousemove', onMouseMove);

    return () => {
      window.removeEventListener('openEnquiryForm', handleOpenEnquiryForm);
      window.removeEventListener('openChatbot', handleOpenChatbot);
      window.removeEventListener('openCampusTour', handleOpenCampusTour);
      window.removeEventListener('openPrivacyPopup', handleOpenPrivacyPopup);
      window.removeEventListener('adminAuthChanged', updateAdminInfo);
      window.removeEventListener('storage', updateAdminInfo);
      document.removeEventListener('mousemove', onMouseMove);
      if (mouseFrame) window.cancelAnimationFrame(mouseFrame);
      
      // Restore all moved tooltips
      movedTooltips.forEach((data, tooltip) => {
        const { parent, nextSibling } = data;
        try {
          if (nextSibling && nextSibling.parentNode === parent) {
            parent.insertBefore(tooltip, nextSibling);
          } else {
            parent.appendChild(tooltip);
          }
        } catch (e) {
          // Ignore errors if elements were removed
        }
      });
      movedTooltips.clear();
    };
  }, []);

  useEffect(() => {
    if (showCampusTour) {
      document.body.classList.add('campus-tour-opened');
    } else {
      document.body.classList.remove('campus-tour-opened');
    }

    return () => {
      document.body.classList.remove('campus-tour-opened');
    };
  }, [showCampusTour]);

  const handleEnquiryToggle = () => {
    setShowEnquiryForm(!showEnquiryForm);
    if (showEnquiryForm) {
      setPreSelectedCourse('');
      setEnquiryFormTitle('Enquiry Form');
      setEnquiryFormVariant('enquiry');
    }
  };

  const handleChatToggle = () => {
    setShowChatbot(!showChatbot);
    if (!showChatbot) {
      localStorage.setItem("chat-opened", "true");
    } else {
      localStorage.removeItem("chat-opened");
    }
  };

  const handleMagazineToggle = () => {
    setShowMagazine(!showMagazine);
  };

  const handleAdminLogout = async () => {
    await submitAdminLogout();
    localStorage.removeItem('kiteUnifiedAdmin');
    localStorage.removeItem('kiteAdminUser');
    localStorage.removeItem('kiteCareersAdmin');
    localStorage.removeItem('kiteAviationAdmin');
    localStorage.removeItem('kiteNewsAdmin');
    localStorage.removeItem('kiteGalleryAdmin');
    window.dispatchEvent(new Event('adminAuthChanged'));
    navigate('/admin');
  };

  return (
    <div className="app">
      <Header />
      
      <main>
        {children}
      </main>
      
      <Footer />

      {showCampusTour && (
        <div className="campus-tour">
          <button type="button" className="close-tour" onClick={() => setShowCampusTour(false)}>close</button>
          <iframe src={getAssetUrl('campus-tour.html')} frameBorder="0" title="Campus Tour" />
        </div>
      )}
      
      <EnquiryForm 
        isOpen={showEnquiryForm} 
        onClose={handleEnquiryToggle}
        preSelectedCourse={preSelectedCourse}
        formTitle={enquiryFormTitle}
        variant={enquiryFormVariant}
      />
      
      <VirtualAssistant 
        isOpen={showChatbot}
        onClose={handleChatToggle}
      />
      
      <MagazineHolder 
        isOpen={showMagazine}
        onClose={handleMagazineToggle}
      />

      <PrivacyPopup
        isOpen={showPrivacyPopup}
        onClose={() => setShowPrivacyPopup(false)}
      />

      <CallbackPopup suppressed={showEnquiryForm || showPrivacyPopup} />
      
      <ChatButton onClick={handleChatToggle} />
      <MagazineButton onClick={handleMagazineToggle} />
      {adminInfo.loggedIn && (
        <div className="admin-floating-panel">
          <div className="admin-floating-header">
            <span className="admin-floating-dot" />
            <span>Admin</span>
          </div>
          <div className="admin-floating-body">
            <span className="admin-floating-name">Logged in as <strong>{adminInfo.name}</strong></span>
            <div className="admin-floating-actions">
              <Link to="/admin" className="admin-floating-link">Open Dashboard</Link>
              <button type="button" onClick={handleAdminLogout} className="admin-floating-logout">Logout</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Layout;

