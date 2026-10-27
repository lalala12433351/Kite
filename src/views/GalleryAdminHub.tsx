'use client';

import { useState } from 'react';
import GalleryAdmin from './GalleryAdmin';
import GalleryAlbumAdmin from './GalleryAlbumAdmin';

function GalleryAdminHub({ embedded = false, onLogout }) {
  const [uploadOpen, setUploadOpen] = useState(false);

  const handleUploaded = () => {
    setUploadOpen(false);
    window.dispatchEvent(new Event('gallery-admin-refresh'));
  };

  return (
    <div className="gallery-admin-hub">
      <header className="gallery-admin-hub-header">
        <div className="gallery-admin-hub-intro">
          <h2 className="gallery-admin-hub-title">Gallery</h2>
          <p className="gallery-admin-hub-subtitle">
            Manage albums and photos on the public gallery. Edit each album to set its own description.
          </p>
        </div>
        <button
          type="button"
          className="gallery-admin-btn gallery-admin-btn--primary gallery-admin-hub-upload-btn"
          onClick={() => setUploadOpen(true)}
        >
          Upload photos
        </button>
      </header>

      <div className="gallery-admin-hub-panel" role="region" aria-label="Gallery library">
        <GalleryAlbumAdmin embedded={embedded} onOpenUpload={() => setUploadOpen(true)} />
      </div>

      {uploadOpen && (
        <GalleryAdmin
          embedded
          uploadModalOpen
          onUploadModalClose={() => setUploadOpen(false)}
          onUploaded={handleUploaded}
          onLogout={onLogout}
        />
      )}
    </div>
  );
}

export default GalleryAdminHub;
