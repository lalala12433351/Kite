'use client';

import { useEffect, useLayoutEffect } from 'react';
import { useLocation } from '@/lib/router';

function ScrollToTop() {
  const { pathname, hash } = useLocation();

  // Use useLayoutEffect to scroll before browser paints
  useLayoutEffect(() => {
    // If there's a hash, let the browser handle it naturally
    if (hash) {
      return;
    }
    
    // Scroll all possible scroll containers
    const scrollToTop = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      
      // Check if .app element exists and scroll it too
      const appElement = document.querySelector('.app');
      if (appElement) {
        appElement.scrollTop = 0;
      }
      
      // Check for any other scrollable containers
      const scrollableContainers = document.querySelectorAll('[style*="overflow"], .content, .content-box');
      scrollableContainers.forEach(container => {
        if (container.scrollTop !== undefined) {
          container.scrollTop = 0;
        }
      });
    };
    
    // Immediate scroll
    scrollToTop();
  }, [pathname, hash]);

  // Also use useEffect as backup with delays
  useEffect(() => {
    // If there's a hash, let the browser handle it naturally
    if (hash) {
      return;
    }
    
    const scrollToTop = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      
      const appElement = document.querySelector('.app');
      if (appElement) {
        appElement.scrollTop = 0;
      }
    };
    
    // Multiple attempts to ensure it works
    scrollToTop();
    const timer1 = setTimeout(scrollToTop, 0);
    const timer2 = setTimeout(scrollToTop, 10);
    const timer3 = setTimeout(scrollToTop, 50);
    const timer4 = setTimeout(scrollToTop, 100);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [pathname, hash]);

  return null;
}

export default ScrollToTop;

