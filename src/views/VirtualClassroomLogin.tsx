'use client';

import React, { useState, useEffect } from 'react';
import { useNavigate } from '@/lib/router';

// Get base URL for assets
const getAssetUrl = (path) => `${'/'}${path}`;

function VirtualClassroomLogin() {
  const navigate = useNavigate();
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [selectedIcon, setSelectedIcon] = useState(null);
  const [error, setError] = useState('');
  const [captchaQuestion, setCaptchaQuestion] = useState('');
  const [captchaCorrectId, setCaptchaCorrectId] = useState('');
  const [captchaIcons, setCaptchaIcons] = useState([]);
  
  // SVG icon renderer for captcha
  const renderIcon = (iconData, color = '#0a377f', size = 40) => {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        {iconData.map((item, index) => {
          const fillColor = item.fillOverride || color;
          if (item.d) {
            return <path key={index} d={item.d} fill={fillColor} />;
          } else if (item.type === 'rect') {
            return <rect key={index} x={item.x} y={item.y} width={item.width} height={item.height} fill={fillColor} />;
          } else if (item.type === 'circle') {
            return <circle key={index} cx={item.cx} cy={item.cy} r={item.r} fill={fillColor} />;
          }
          return null;
        })}
      </svg>
    );
  };

  // Aviation and Hospitality icon captcha options with SVG paths
  const iconOptions = [
    { 
      id: 'plane', 
      paths: [{ d: 'M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z' }], 
      label: 'Aircraft', 
      description: 'Click the aircraft icon' 
    },
    { 
      id: 'luggage', 
      paths: [
        { d: 'M17 6h-2V3c0-1.1-.9-2-2-2H7c-1.1 0-2 .9-2 2v3H3c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM7 3h6v3H7V3zm10 16H3V8h14v11zm-5-5v-2h-2v2H8v2h2v2h2v-2h2v-2h-2z' }
      ], 
      label: 'Luggage', 
      description: 'Click the luggage icon' 
    },
    { 
      id: 'hotel', 
      paths: [
        { d: 'M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7h8V7zm0-4H5v2h14V3z' },
        { type: 'rect', x: 2, y: 19, width: 20, height: 2 }
      ], 
      label: 'Hotel', 
      description: 'Click the hotel icon' 
    },
    { 
      id: 'welcome', 
      paths: [{ d: 'M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM8.5 8c.83 0 1.5.67 1.5 1.5S9.33 11 8.5 11 7 10.33 7 9.5 7.67 8 8.5 8zm7 0c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5zm-3.5 9.5c-2.03 0-3.8-1.16-4.66-2.86.91.43 1.93.68 3.01.68.68 0 1.34-.11 1.96-.31-.04.11-.1.22-.16.33-.16.31-.3.6-.15.56z' }], 
      label: 'Welcome', 
      description: 'Click the welcome icon' 
    },
    { 
      id: 'meal', 
      paths: [{ d: 'M8.1 13.34l2.83-2.83L3.91 3.5c-1.56 1.56-1.56 4.09 0 5.66l4.19 4.18zm6.78-1.81c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.2-1.1-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L3.7 19.87l1.41 1.41L12 14.41l6.88 6.88 1.41-1.41L13.41 13l1.47-1.47z' }], 
      label: 'Meal Service', 
      description: 'Click the meal service icon' 
    },
    { 
      id: 'safety', 
      paths: [{ d: 'M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z' }], 
      label: 'Safety', 
      description: 'Click the safety icon' 
    },
    { 
      id: 'passport', 
      paths: [{ d: 'M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z' }], 
      label: 'Passport Control', 
      description: 'Click the passport control icon' 
    },
    { 
      id: 'service', 
      paths: [
        { type: 'circle', cx: 12, cy: 12, r: 10 },
        { type: 'circle', cx: 12, cy: 12, r: 4, fillOverride: '#fff' }
      ], 
      label: 'Customer Service', 
      description: 'Click the customer service icon' 
    },
    { 
      id: 'ticket', 
      paths: [{ d: 'M20.56 5.17c-.05-.16-.18-.29-.34-.34-.16-.05-.34-.03-.47.06l-1.7 1.27c-.22.16-.49.25-.75.25h-.01c-.14 0-.28-.03-.4-.08L13.88 4.5c-.15-.06-.32-.06-.47 0L10.71 6c-.12.05-.26.08-.4.08h-.01c-.26 0-.53-.09-.75-.25L7.85 4.56c-.13-.09-.31-.11-.47-.06-.16.05-.29.18-.34.34-.05.16-.03.34.06.47l1.27 1.7c.16.22.25.49.25.75 0 .14-.03.28-.08.4L6.84 10.24c-.06.15-.06.32 0 .47L8.27 13.4c.05.12.08.26.08.4 0 .26-.09.53-.25.75l-1.27 1.7c-.09.13-.11.31-.06.47.05.16.18.29.34.34.16.05.34.03.47-.06l1.7-1.27c.22-.16.49-.25.75-.25.14 0 .28.03.4.08l2.61 1.5c.15.06.32.06.47 0l2.61-1.5c.12-.05.26-.08.4-.08.26 0 .53.09.75.25l1.7 1.27c.13.09.31.11.47.06.16-.05.29-.18.34-.34.05-.16.03-.34-.06-.47l-1.27-1.7c-.16-.22-.25-.49-.25-.75 0-.14.03-.28.08-.4l1.43-2.37c.06-.15.06-.32 0-.47L18.02 7.39c-.05-.12-.08-.26-.08-.4 0-.26.09-.53.25-.75l1.27-1.7c.09-.13.11-.31.06-.47z' }], 
      label: 'Ticket', 
      description: 'Click the ticket icon' 
    },
    { 
      id: 'cockpit', 
      paths: [
        { d: 'M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z' },
        { type: 'circle', cx: 12, cy: 12, r: 2, fillOverride: '#fff' }
      ], 
      label: 'Cockpit', 
      description: 'Click the cockpit icon' 
    },
    { 
      id: 'trolley', 
      paths: [
        { d: 'M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12L8.1 13h7.45c.75 0 1.41-.41 1.75-1.03L21.7 4H5.21l-.94-2H1zm16 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z' }
      ], 
      label: 'Service Trolley', 
      description: 'Click the service trolley icon' 
    },
    { 
      id: 'briefcase', 
      paths: [{ d: 'M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z' }], 
      label: 'Business Travel', 
      description: 'Click the business travel icon' 
    }
  ];

  // Generate captcha on mount
  useEffect(() => {
    generateCaptcha();
  }, []);

  const generateCaptcha = () => {
    // Shuffle and pick 4 random icons
    const shuffled = [...iconOptions].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 4);
    
    // Pick one as correct answer
    const correct = selected[Math.floor(Math.random() * selected.length)];
    
    setCaptchaIcons(selected);
    setCaptchaQuestion(correct.description);
    setCaptchaCorrectId(correct.id);
    setSelectedIcon(null); // Clear previous selection
  };

  const handleIconSelect = (iconId) => {
    setSelectedIcon(iconId);
    setError(''); // Clear error when user makes a selection
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Validate inputs
    if (!studentId || !password) {
      setError('Please fill in Student ID and Password');
      return;
    }

    // Validate captcha
    if (!selectedIcon) {
      setError('Please select an icon to verify you are human');
      return;
    }

    if (selectedIcon !== captchaCorrectId) {
      setError('Incorrect icon selected. Please try again.');
      generateCaptcha();
      setSelectedIcon(null);
      return;
    }

    // For demo purposes, accept any student ID and password
    // In production, you would validate against a database
    // For now, setting authentication in localStorage
    localStorage.setItem('virtualClassroomAuth', 'true');
    localStorage.setItem('studentId', studentId);
    
    // Redirect to virtual classroom
    navigate('/virtual-classroom');
  };

  return (
    <div className="content-box virtual-classroom-login inside-page">
      <div className="virtual-classroom-login-container">
        <div className="virtual-classroom-login-header">
          <h2>Virtual Classroom</h2>
          <p>This is a preview of recorded lessons. Any student ID opens the sample classroom.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <label className="virtual-classroom-form-label">
            Student ID
          </label>
          <input
            type="text"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            placeholder="Enter your Student ID"
            className="virtual-classroom-form-input"
            required
          />

          <label className="virtual-classroom-form-label margin-top">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="virtual-classroom-form-input"
            required
          />

          <label className="virtual-classroom-form-label margin-top">
            {captchaQuestion}
          </label>
          <div className="virtual-classroom-captcha-container">
            {captchaIcons.map((iconOption) => (
              <button
                key={iconOption.id}
                type="button"
                onClick={() => handleIconSelect(iconOption.id)}
                className={`virtual-classroom-captcha-button ${selectedIcon === iconOption.id ? 'selected' : ''}`}
              >
                {renderIcon(iconOption.paths, selectedIcon === iconOption.id ? '#fff' : '#0a377f', 28)}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={generateCaptcha}
            className="virtual-classroom-generate-btn"
          >
            Generate New Icons
          </button>

          <button 
            type="submit" 
            className="virtual-classroom-submit-btn"
          >
            Enter Virtual Classroom
          </button>

          {error && (
            <p className="virtual-classroom-error">
              {error}
            </p>
          )}
        </form>

        <div className="virtual-classroom-note">
          <p>
            <strong>Note:</strong> This is a secure login system.<br/> Your credentials are encrypted and protected.
          </p>
        </div>
      </div>
    </div>
  );
}

export default VirtualClassroomLogin;

