'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useCmsContent } from '@/src/hooks/useCmsContent';
import flightAnnouncementsFallback from '../../data/flight-announcements.json';

function FlightAnnouncements() {
  const { data: cms } = useCmsContent('flight-announcements', flightAnnouncementsFallback);
  const pageTitle = cms?.title || flightAnnouncementsFallback.title;
  const intro = cms?.intro || flightAnnouncementsFallback.intro;
  const defaultAudioUrl = cms?.defaultAudioUrl || flightAnnouncementsFallback.defaultAudioUrl;
  const categories = cms?.categories?.length ? cms.categories : flightAnnouncementsFallback.categories;
  const trainingTip = cms?.trainingTip || flightAnnouncementsFallback.trainingTip;
  const flightAnnouncements = useMemo(() => {
    const list = cms?.announcements?.length ? cms.announcements : flightAnnouncementsFallback.announcements;
    return list.map((item) => ({
      ...item,
      audioUrl: item.audioUrl || defaultAudioUrl,
    }));
  }, [cms?.announcements, defaultAudioUrl]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [playingId, setPlayingId] = useState(null);
  const audioRef = useRef(null); // Use single shared audio element
  const [expandedScript, setExpandedScript] = useState(null);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isNearFooter, setIsNearFooter] = useState(false);

  useEffect(() => {
    audioRef.current = new Audio(defaultAudioUrl);
    audioRef.current.preload = 'auto';
    
    audioRef.current.addEventListener('loadedmetadata', () => {
      console.log('📊 Audio loadedmetadata - duration:', audioRef.current.duration);
      setAudioDuration(audioRef.current.duration);
    });
    audioRef.current.addEventListener('timeupdate', () => {
      setCurrentTime(audioRef.current.currentTime);
      setAudioProgress((audioRef.current.currentTime / audioRef.current.duration) * 100 || 0);
    });
    audioRef.current.addEventListener('ended', () => {
      console.log('⏹️ Audio ended');
      setPlayingId(null);
      setAudioProgress(0);
      setCurrentTime(0);
    });
    audioRef.current.addEventListener('error', (e) => {
      console.error('❌ Audio error:', e);
      alert('Failed to load audio. Please check your internet connection or contact support.');
      setPlayingId(null);
      setAudioProgress(0);
      setCurrentTime(0);
    });
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [defaultAudioUrl]);
  useEffect(() => {
    return () => {
      // Cleanup: stop audio when leaving the page
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  // Use IntersectionObserver to detect when training-tip is visible
  useEffect(() => {
    const trainingTip = document.querySelector('.training-tip');
    if (!trainingTip) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsNearFooter(entry.isIntersecting);
        });
      },
      { 
        root: null,
        rootMargin: '-100px 0px 0px 0px', // Trigger when training-tip is 100px from bottom
        threshold: 0 
      }
    );

    observer.observe(trainingTip);
    return () => observer.disconnect();
  }, []);

  const filteredAnnouncements = selectedCategory === 'All' 
    ? flightAnnouncements 
    : flightAnnouncements.filter(ann => ann.category === selectedCategory);

  const handlePlay = (id) => {
    const announcement = flightAnnouncements.find(a => a.id === id);
    
    console.log('🎵 Playing audio:', { id, playingId });

    if (playingId === id) {
      // If clicking the same one, stop it
      console.log('⏸️ Stopping audio for id:', id);
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setPlayingId(null);
    } else {
      // Play new one
      console.log('▶️ Attempting to play audio for id:', id);
      
      // Try to play directly
      audioRef.current.play().then(() => {
        console.log('✅ Audio playing successfully for id:', id);
        setPlayingId(id);
      }).catch(error => {
        console.error('❌ Error playing audio:', error);
        console.error('❌ Error name:', error.name);
        console.error('❌ Error message:', error.message);
        alert(`Failed to play audio: ${error.message}. Please try again.`);
        setPlayingId(null);
      });
    }
  };

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setPlayingId(null);
      setAudioProgress(0);
      setCurrentTime(0);
    }
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Shared player component JSX
  const PlayerContent = () => (
    <>
      <div className="audio-title">
        <span>{flightAnnouncements.find(a => a.id === playingId)?.title}</span>
      </div>
      <div className="audio-progress-container">
        <span className="audio-time">{formatTime(currentTime)}</span>
        <div className="audio-progress-bar">
          <div className="audio-progress-fill" style={{ width: `${audioProgress}%` }}></div>
        </div>
        <span className="audio-time">{formatTime(audioDuration)}</span>
      </div>
      <button className="stop-audio-btn" onClick={handleStop}>
        Stop Audio
      </button>
    </>
  );

  return (
    <div className="content-box inside-page">
      <div className="content-block">
        <div className="lt">
          <h1>{pageTitle}</h1>
          <p className="flight-announcements-intro">{intro}</p>

          {/* Category Filter */}
          <div className="filter-tabs">
            {categories.map(category => (
              <button
                key={category}
                data-category={category}
                className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Announcements List */}
          <div className="announcements-list">
            {filteredAnnouncements.map(announcement => (
              <div key={announcement.id} className="announcement-card">
                <button
                  onClick={() => handlePlay(announcement.id)}
                  className={`play-btn ${playingId === announcement.id ? 'playing' : ''}`}
                >
                  {playingId === announcement.id ? '⏸' : '▶'}
                </button>

                <div className="announcement-info">
                  <div className="announcement-header">
                    <div className="announcement-header-left">
                      <h3 className="announcement-title">{announcement.title}</h3>
                      <p className="announcement-description">{announcement.description}</p>
                      <div className="announcement-meta">
                        <span className="announcement-category" data-category={announcement.category}>{announcement.category}</span>
                        <span className="announcement-duration">Duration: {announcement.duration}</span>
                      </div>
                    </div>
                    {announcement.script && (
                      <button
                        onClick={() => setExpandedScript(expandedScript === announcement.id ? null : announcement.id)}
                        className={`script-toggle-btn ${expandedScript === announcement.id ? 'active' : ''}`}
                      >
                        {expandedScript === announcement.id ? 'Hide Script' : 'Show Script'}
                      </button>
                    )}
                  </div>
                  {expandedScript === announcement.id && announcement.script && (
                    <div className="script-box">
                      <p className="script-text">"{announcement.script}"</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Audio Controls - Fixed at bottom when not near footer */}
          {playingId !== null && !isNearFooter && (
            <div className="audio-player-fixed">
              <PlayerContent />
            </div>
          )}

          {/* Info Message */}
          <div className="training-tip">
            <p>
              <strong>💡 Training Tip:</strong> {trainingTip}
            </p>
          </div>

          {/* Audio Controls when near footer - rendered in content flow to scroll */}
          {playingId !== null && isNearFooter && (
            <div className="audio-player-inline">
              <PlayerContent />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FlightAnnouncements;
