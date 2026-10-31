'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useCmsContent, cmsAssetUrl } from '@/src/hooks/useCmsContent';
import homeFallback from '../../data/home.json';

function VideoGallery() {
  const { data: home } = useCmsContent('home', homeFallback);
  const videos = useMemo(() => {
    const source = home?.videos?.length ? home.videos : homeFallback.videos || [];
    return source.map((video) => ({
      id: video.id,
      thumbnail: cmsAssetUrl(video.thumb || video.thumbnail),
      videoSrc: cmsAssetUrl(video.src || video.videoSrc),
      subtitle: video.subtitle,
      title: video.title,
    }));
  }, [home]);

  const [playingVideo, setPlayingVideo] = useState(null);
  const centerVideoRef = useRef(null);
  const currentVideo = playingVideo ? videos.find((v) => v.id === playingVideo) : null;
  const heading = home?.videoGalleryHeading || homeFallback.videoGalleryHeading || 'Media Showcase';

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
      <h1>{heading}</h1>
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
