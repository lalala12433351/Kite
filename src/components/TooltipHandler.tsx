'use client';

import { useEffect } from 'react';

function TooltipHandler() {
  useEffect(() => {
    const handleMouseMove = (e) => {
      const tooltips = document.querySelectorAll<HTMLElement>('.tooltip-txt');
      tooltips.forEach((tooltip) => {
        tooltip.style.left = `${e.pageX - 5}px`;
        tooltip.style.top = `${e.pageY + 25}px`;
      });
    };

    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return null; // This component doesn't render anything
}

export default TooltipHandler;

