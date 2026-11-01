'use client';

import { useState, useEffect, useRef } from 'react';

const getAssetUrl = (path) => `${'/'}${path}`;

function VideoGallery() {
  const videos = [
    {
      id: 1,
      thumbnail: getAssetUrl('icons/video-thumb1.jpg'),
      videoSrc: getAssetUrl('gallery/walkthrough.mp4'),
      subtitle: 'Kite Aviation',
      title: 'Campus'
    },
    {
      id: 2,
      thumbnail: getAssetUrl('icons/video-thumb2.jpg'),
      videoSrc: getAssetUrl('gallery/Koshy-Reel.mp4'),
      subtitle: 'Kite Aviation',
      title: 'Training'
    },
    {
      id: 3,
      thumbnail: getAssetUrl('icons/video-thumb3.jpg'),
      videoSrc: getAssetUrl('gallery/speedramp.mp4'),
      subtitle: 'Kite Aviation',
      title: 'Promo Reel'
    },
    {
      id: 4,
      thumbnail: getAssetUrl('icons/video-thumb4.jpg'),
      videoSrc: getAssetUrl('gallery/testimonial1.mp4'),
      subtitle: 'Testimonial - Air India',
      title: 'Anju'
    },
    {
      id: 5,
      thumbnail: getAssetUrl('icons/video-thumb5.jpg'),
      videoSrc: getAssetUrl('gallery/Independenceday-video.mp4'),
      subtitle: 'Independence Day',
      title: 'Celebration'
    },
    {
      id: 6,
      thumbnail: getAssetUrl('icons/video-thumb6.jpg'),
      videoSrc: getAssetUrl('gallery/kite-promo1.mp4'),
      subtitle: 'Welcome to',
      title: 'Kite'
    }
  ];

  const [playingVideo, setPlayingVideo] = useState(null);
  const centerVideoRef = useRef(null);
  const currentVideo = playingVideo ? videos.find((v) => v.id === playingVideo) : null;

  useEffect(() => {
    if (!playingVideo || !centerVideoRef.current || !currentVideo) return;
    centerVideoRef.current.src = currentVideo.videoSrc;
    centerVideoRef.current.play().catch((err) => console.error('Play failed:', err));
    return () => {
      if (centerVideoRef.current) {
        centerVideoRef.current.pause();
        centerVideoRef.current.currentTime = 0;
      }
    };
  }, [playingVideo, currentVideo?.videoSrc]);

  const handleCloseVideo = (e) => {
    e?.stopPropagation();
    if (centerVideoRef.current) {
      centerVideoRef.current.pause();
      centerVideoRef.current.currentTime = 0;
    }
    setPlayingVideo(null);
  };

  return (
    <div className="content-box video-gallery">
      {playingVideo && currentVideo && (
        <>
          <div className="video-testimonial-backdrop" onClick={handleCloseVideo} aria-hidden />
          <div className="video-player-holder">
            <button type="button" className="video-player-close" onClick={handleCloseVideo} aria-label="Close">✕</button>
            <video ref={centerVideoRef} src={currentVideo.videoSrc} controls onEnded={() => setPlayingVideo(null)} />
          </div>
        </>
      )}
      <h1>Media Showcase</h1>
      <div className="video-testimonial">
        <div className="carousel">
          {videos.map((video) => (
            <div key={video.id} className="testi-card" onClick={() => setPlayingVideo(video.id)}>
              <img src={video.thumbnail} alt={video.title} />
              <div className="testi-card-content">
                <span dangerouslySetInnerHTML={{ __html: video.subtitle }} />
                <h3>{video.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default VideoGallery;

