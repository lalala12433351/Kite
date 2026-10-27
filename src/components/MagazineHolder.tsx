'use client';

import { useEffect } from 'react';

function MagazineHolder({ isOpen, onClose }) {
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('magazine-opened', 'popup-opened');
    } else {
      document.body.classList.remove('magazine-opened', 'popup-opened');
    }
    
    return () => {
      document.body.classList.remove('magazine-opened', 'popup-opened');
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="magazine-holder">
      <a className="close-form" onClick={onClose}>+</a>
      <iframe src="https://kiteaviation.in/brochure/" title="Digital Magazine"></iframe>
    </div>
  );
}

export default MagazineHolder;

