'use client';

import { useEffect, useState, useRef } from 'react';
import { Link } from '@/lib/router';
import { loadAlbumsFromAlbumFolder, getAssetUrl } from '../utils/galleryData';
import { DEFAULT_GALLERY_DESCRIPTION } from '../utils/gallerySettings';
import UsefulLinksSection from '../components/UsefulLinksSection';

const placementVideos = [
  { id: 'placement-1', thumbnail: getAssetUrl('icons/nilani.jpg'), videoSrc: getAssetUrl('gallery/placement-video2.webm'), title: 'Nilani', company: 'IndiGo', airlineLogo: 'indigo' },
  { id: 'placement-2', thumbnail: getAssetUrl('icons/pumin.jpg'), videoSrc: getAssetUrl('gallery/placement-video1.webm'), title: 'Pumin', company: 'Air India', airlineLogo: 'airindia' }
];

function Gallery() {
  const [folderAlbumData, setFolderAlbumData] = useState(null);
  const [selectedAlbumSlug, setSelectedAlbumSlug] = useState(null);
  const [gallerySearch, setGallerySearch] = useState('');
  const [playingPlacementVideo, setPlayingPlacementVideo] = useState(null);
  const centerPlacementVideoRef = useRef(null);
  const currentPlacementVideo = playingPlacementVideo ? placementVideos.find((v) => v.id === playingPlacementVideo) : null;

  useEffect(() => {
    if (!playingPlacementVideo || !centerPlacementVideoRef.current || !currentPlacementVideo) return;
    centerPlacementVideoRef.current.src = currentPlacementVideo.videoSrc;
    centerPlacementVideoRef.current.play().catch(() => {});
    return () => {
      if (centerPlacementVideoRef.current) {
        centerPlacementVideoRef.current.pause();
        centerPlacementVideoRef.current.currentTime = 0;
      }
    };
  }, [playingPlacementVideo, currentPlacementVideo?.videoSrc]);

  const handleClosePlacementVideo = (e) => {
    e?.stopPropagation();
    if (centerPlacementVideoRef.current) {
      centerPlacementVideoRef.current.pause();
      centerPlacementVideoRef.current.currentTime = 0;
    }
    setPlayingPlacementVideo(null);
  };

  const loadFolderAlbums = () => {
    loadAlbumsFromAlbumFolder()
      .then((data) => {
        setFolderAlbumData({ albums: Array.isArray(data?.albums) ? data.albums : [] });
      })
      .catch(() => setFolderAlbumData({ albums: [] }));
  };

  useEffect(() => {
    loadFolderAlbums();
  }, []);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = getAssetUrl('js/fancybox.umd.js');
    script.async = false;
    script.onload = () => {
      if (window.Fancybox) {
        window.Fancybox.bind('[data-fancybox="gallery"]', {
          infinite: true,
          keyboard: true,
          arrows: true,
          infobar: true,
          toolbar: true,
          buttons: ['zoom', 'slideShow', 'thumbs', 'close']
        });
      }
    };
    document.body.appendChild(script);
    const items = document.querySelectorAll('.gallery-images-holder a');
    const lazyLoadObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const img = entry.target.querySelector('img');
        if (entry.isIntersecting && img?.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
        }
      });
    }, { rootMargin: '50px', threshold: 0.01 });
    items.forEach((item) => lazyLoadObserver.observe(item));
    return () => {
      lazyLoadObserver.disconnect();
      if (window.Fancybox) window.Fancybox.destroy();
      if (script.parentNode) document.body.removeChild(script);
    };
  }, [folderAlbumData, selectedAlbumSlug]);

  const getImageUrl = (image) => {
    if (image.url) {
      return image.url.startsWith('http') ? image.url : getAssetUrl(image.url);
    }
    return '';
  };

  const getAlbumThumbnailUrl = (album) => {
    const first = album?.images?.[0];
    if (!first?.url) return null;
    return getImageUrl(first);
  };

  const getAllAlbumsThumbnailUrl = (albums) => {
    for (const album of albums || []) {
      const url = getAlbumThumbnailUrl(album);
      if (url) return url;
    }
    return null;
  };

  const renderAlbumFolderIcon = (thumbUrl) => (
    <span className="gallery-album-folder-icon" aria-hidden>
      {thumbUrl ? (
        <img src={thumbUrl} alt="" className="gallery-album-folder-thumb" loading="lazy" decoding="async" />
      ) : (
        <span className="gallery-album-folder-icon-fallback">📁</span>
      )}
    </span>
  );

  const displayAlbums = folderAlbumData?.albums ?? [];
  const selectedAlbum = selectedAlbumSlug ? displayAlbums.find((a) => (a.slug || '') === selectedAlbumSlug) : null;
  const displayDescription = selectedAlbum
    ? String(selectedAlbum.description || '').trim()
    : DEFAULT_GALLERY_DESCRIPTION;

  let baseImages = [];
  if (selectedAlbumSlug && selectedAlbum) {
    baseImages = (selectedAlbum.images || []).map((img, i) => ({
      id: `folder-${selectedAlbum.slug}-${img.filename}-${i}`,
      url: img.url,
      filename: img.filename,
      title: img.filename
    }));
  } else {
    baseImages = (displayAlbums || []).flatMap((alb) =>
      (alb.images || []).map((img, i) => ({
        id: `folder-${alb.slug}-${img.filename}-${i}`,
        url: img.url,
        filename: img.filename,
        title: img.filename
      }))
    );
  }

  const searchLower = (gallerySearch || '').trim().toLowerCase();
  const filteredGalleryImages = searchLower
    ? baseImages.filter((img) => {
        const title = (img.title || '').toLowerCase();
        const caption = (img.caption || '').toLowerCase();
        const filename = (img.filename || '').toLowerCase();
        return title.includes(searchLower) || caption.includes(searchLower) || filename.includes(searchLower);
      })
    : baseImages;

  return (
    <div className="content gallery" id="gallery">
      {playingPlacementVideo && currentPlacementVideo && (
        <>
          <div className="video-testimonial-backdrop" onClick={handleClosePlacementVideo} aria-hidden />
          <div className="video-player-holder">
            <button type="button" className="video-player-close" onClick={handleClosePlacementVideo} aria-label="Close">✕</button>
            <video
              ref={centerPlacementVideoRef}
              src={currentPlacementVideo.videoSrc}
              controls
              onEnded={() => setPlayingPlacementVideo(null)}
            />
          </div>
        </>
      )}
      <h1>Media Gallery</h1>
      <div className="content-block gallery-content-block">
        {displayAlbums.length > 0 && (
          <nav className="gallery-albums-sidebar" aria-label="Albums">
            <ul className="gallery-album-folder-list">
              <li>
                <button
                  type="button"
                  className={`gallery-album-folder-item ${!selectedAlbumSlug ? 'active' : ''}`}
                  onClick={() => setSelectedAlbumSlug(null)}
                >
                  {renderAlbumFolderIcon(getAllAlbumsThumbnailUrl(displayAlbums))}
                  <span className="gallery-album-folder-name">All</span>
                  <span className="gallery-album-folder-chevron" aria-hidden>&#8250;</span>
                </button>
              </li>
              {displayAlbums.map((album) => (
                <li key={album.slug || album.id}>
                  <button
                    type="button"
                    className={`gallery-album-folder-item ${selectedAlbumSlug === (album.slug || '') ? 'active' : ''}`}
                    onClick={() => setSelectedAlbumSlug(album.slug || '')}
                  >
                    {renderAlbumFolderIcon(getAlbumThumbnailUrl(album))}
                    <span className="gallery-album-folder-name">{album.name}</span>
                    <span className="gallery-album-folder-chevron" aria-hidden>&#8250;</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        )}

        <div className="lt gallery">
          <span className="news-page__eyebrow">Photos Gallery</span>
          <div className="gallery-header-row">
            <h2 className="news-explore__title">{selectedAlbum ? selectedAlbum.name : 'Discover Life at Kite Institute'}</h2>
            <div className="gallery-search-wrap">
              <input
                type="search"
                className="gallery-search-input"
                placeholder="Search gallery…"
                value={gallerySearch}
                onChange={(e) => setGallerySearch(e.target.value)}
                aria-label="Search gallery images"
              />
            </div>
          </div>
          {displayDescription ? <div className="description">{displayDescription}</div> : null}

          <div className="gallery-images-holder">
            {filteredGalleryImages.length > 0 ? (
              filteredGalleryImages.map((image, index) => {
                const imageUrl = getImageUrl(image);
                return (
                  <a
                    key={image.id ?? index}
                    data-fancybox="gallery"
                    href={imageUrl}
                  >
                    <img
                      data-src={imageUrl}
                      src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 200'%3E%3C/svg%3E"
                      alt={image.title || 'Kite Institute of Aviation & Hospitality'}
                    />
                  </a>
                );
              })
            ) : searchLower ? (
              <p className="gallery-empty">No images match your search. Try different keywords.</p>
            ) : selectedAlbumSlug ? (
              <p className="gallery-empty">No images in this album yet.</p>
            ) : displayAlbums.length === 0 ? (
              <p className="gallery-empty">No albums yet. Add folders with images to database/albums to see them here.</p>
            ) : (
              <p className="gallery-empty">No images in the gallery yet.</p>
            )}
          </div>
        </div>

        <div className="rt gallery-rt">
          <div className="text-box gallery-sidebar-section placement-videos-sidebar">
            <h3>Recent Placements</h3>
            <div className="placement-videos-list">
              {placementVideos.map((video) => (
                <div
                  key={video.id}
                  className="testi-card placement-video-card-sidebar"
                  onClick={() => setPlayingPlacementVideo(video.id)}
                >
                  <div className="testi-card-thumb">
                    <img src={video.thumbnail} alt={video.title} />
                    <div className="testi-card-content">
                      <span>Placement</span>
                      <h3>{video.title}</h3>
                    </div>
                  </div>
                  <div className="placement-video-details">
                    <span className="placement-video-company">{video.company}</span>
                    {video.airlineLogo && (
                      <div className={`placement-video-logo ${video.airlineLogo}`} title={video.company} aria-hidden />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="text-box iata-certified-card gallery-iata-card">
            <div className="iata-certified-card-inner">
              <div className="iata-certified-logo" aria-hidden />
              <div className="iata-certified-text">
                <h4>IATA Certified Partner</h4>
                <p>Kite Institute is an IATA certified training partner, delivering globally recognized aviation and hospitality programs.</p>
              </div>
            </div>
            <div className="verify-certificate-card-inner">
              <div className="verify-certificate-logo" aria-hidden />
              <div className="iata-certified-text">
                <h4>Verify Student Certificate</h4>
                <p>Verify Kite Institute student course certificates instantly through our secure online portal.</p>
                <Link to="/students/verify" className="verify-certificate-link">
                  Verify Certificate
                </Link>
              </div>
            </div>
          </div>
          <UsefulLinksSection />
          <h3>Meet Our Team</h3>
          <div className="text">
            At Kite Institute of Aviation & Hospitality, our success is driven by experienced professionals, industry experts, and visionary leaders committed to shaping the future of aspiring professionals.{' '}
            <Link to="/team" className="showloader">Meet our team</Link>
          </div>
          <h3>Our Vision</h3>
          <div className="text">
            <strong>Pioneering the Future of Aviation <br />
            Training Excellence in India</strong><br /><br />
            At Kite Institute of Aviation & Hospitality, we are committed to providing top-notch education and hands-on training that align with global industry standards. Our curriculum blends theoretical knowledge with real-world application, ensuring students are equipped with the skills and expertise required to excel in the aviation and hospitality sectors.
          </div>
          <h3>Our Mission</h3>
          <div className="text">
            At Kite Institute of Aviation & Hospitality, our mission is to empower aspiring professionals with world-class education, hands-on training, and industry exposure, preparing them for successful careers in aviation and hospitality.
          </div>
        </div>
      </div>
    </div>
  );
}

export default Gallery;
