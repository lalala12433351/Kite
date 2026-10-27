'use client';

import { useState, useEffect, useRef } from 'react';
const airlinePreFlightAudio = '/audio/airline-pre-flight.mp3';

// Sample flight announcement data - replace with actual audio URLs
const flightAnnouncements = [
  {
    id: 1,
    title: 'Welcome Onboard',
    description: 'Standard welcome announcement for passengers',
    duration: '0:45',
    audioUrl: airlinePreFlightAudio,
    category: 'Standard',
    script: 'Good morning/afternoon/evening ladies and gentlemen. On behalf of the entire crew, I would like to welcome you aboard Flight [Number] to [Destination]. Please pay attention as we go through important safety information.'
  },
  {
    id: 2,
    title: 'Safety Instructions - English',
    description: 'Safety briefing for English-speaking passengers',
    duration: '2:15',
    audioUrl: airlinePreFlightAudio,
    category: 'Safety',
    script: 'Please direct your attention to the flight attendants as we demonstrate the safety features of this aircraft. Your seat cushion can be used as a flotation device. Please ensure your seat belt is securely fastened. There are several emergency exits located throughout the cabin, including two in the front, two over the wings, and two at the rear of the aircraft. Please take a moment to locate your nearest exit.'
  },
  {
    id: 3,
    title: 'Safety Instructions - Hindi',
    description: 'Safety briefing for Hindi-speaking passengers',
    duration: '2:20',
    audioUrl: airlinePreFlightAudio,
    category: 'Safety',
    script: 'कृपया अपना ध्यान फ्लाइट अटेंडेंट्स की ओर दें क्योंकि हम इस विमान की सुरक्षा विशेषताओं का प्रदर्शन करेंगे। आपकी सीट कुशन को फ्लोटेशन डिवाइस के रूप में इस्तेमाल किया जा सकता है। कृपया सुनिश्चित करें कि आपका सीट बेल्ट सुरक्षित रूप से बंधा हुआ है।'
  },
  {
    id: 4,
    title: 'Takeoff Preparation',
    description: 'Announcement before takeoff',
    duration: '0:50',
    audioUrl: airlinePreFlightAudio,
    category: 'Standard',
    script: 'Ladies and gentlemen, we are now ready for departure. Please ensure that your seatbacks and tray tables are in their full upright position, your seat belt is securely fastened, and all carry-on luggage is safely stowed in the overhead bins or under the seat in front of you. Thank you for your cooperation.'
  },
  {
    id: 5,
    title: 'Flight Delay - Weather',
    description: 'Weather-related flight delay announcement',
    duration: '1:10',
    audioUrl: airlinePreFlightAudio,
    category: 'Special',
    script: 'Ladies and gentlemen, this is your captain speaking. Due to adverse weather conditions at our destination, we will be experiencing a slight delay in our departure. We expect to be airborne in approximately 30 minutes. We appreciate your patience and understanding. For your convenience, you may disembark the aircraft if you wish.'
  },
  {
    id: 6,
    title: 'Meal Service - Vegetarian',
    description: 'Announcement for vegetarian meal service',
    duration: '0:55',
    audioUrl: airlinePreFlightAudio,
    category: 'Service',
    script: 'Ladies and gentlemen, we will now commence our meal service. For passengers who requested vegetarian meals, we are pleased to offer you a specially prepared vegetarian option today. Please raise your call button if you have ordered a vegetarian meal, and one of our flight attendants will be happy to serve you. Enjoy your meal.'
  },
  {
    id: 7,
    title: 'Meal Service - Non-Vegetarian',
    description: 'Announcement for non-vegetarian meal service',
    duration: '0:55',
    audioUrl: airlinePreFlightAudio,
    category: 'Service',
    script: 'Ladies and gentlemen, we will now begin our meal service. For passengers who have ordered non-vegetarian meals, our cabin crew will begin serving from the front of the aircraft. We have prepared a delicious meal option for you today. If you need anything additional, please do not hesitate to contact one of our flight attendants.'
  },
  {
    id: 8,
    title: 'Turbulence Warning',
    description: 'Turbulence safety announcement',
    duration: '1:05',
    audioUrl: airlinePreFlightAudio,
    category: 'Safety',
    script: 'Ladies and gentlemen, this is your captain. We are now entering an area of turbulence. Please return to your seats immediately and fasten your seat belts. Please refrain from moving about the cabin until the seat belt sign has been turned off. We will keep you informed. Thank you for your cooperation.'
  },
  {
    id: 9,
    title: 'Duty-Free Shopping',
    description: 'Duty-free shopping announcement',
    duration: '0:40',
    audioUrl: airlinePreFlightAudio,
    category: 'Service',
    script: 'Ladies and gentlemen, we are now offering our duty-free service. Our cabin crew will be passing through the cabin with our exclusive collection of duty-free items including perfumes, cosmetics, chocolates, and souvenirs. If you would like to make a purchase, please raise your call button. Prices are displayed in both local currency and US dollars.'
  },
  {
    id: 10,
    title: 'Preparing for Landing',
    description: 'Pre-landing cabin preparation announcement',
    duration: '1:15',
    audioUrl: airlinePreFlightAudio,
    category: 'Standard',
    script: 'Ladies and gentlemen, we will be landing in approximately 20 minutes. The local time at [Destination] is [Time]. The weather is [Weather]. Please return to your seats, make sure your seatbelt is fastened, and ensure that your seatback and tray table are in their upright position. All electronic devices must be switched off and stowed securely at this time.'
  },
  {
    id: 11,
    title: 'Final Approach',
    description: 'Final approach and landing announcement',
    duration: '0:50',
    audioUrl: airlinePreFlightAudio,
    category: 'Standard',
    script: 'Ladies and gentlemen, we are now making our final approach to [Destination] International Airport. Please ensure that your seat belt is securely fastened. All flight attendants, please be seated for landing. We anticipate landing in approximately five minutes. Thank you for flying with us today.'
  },
  {
    id: 12,
    title: 'Disembarkation',
    description: 'Welcome and disembarkation announcement',
    duration: '0:45',
    audioUrl: airlinePreFlightAudio,
    category: 'Standard',
    script: 'Ladies and gentlemen, welcome to [Destination]. Local time is [Time] and the outside temperature is [Temperature] degrees Celsius. Please remain seated with your seat belt fastened until the aircraft has come to a complete stop. We hope you had a pleasant flight with us today, and we look forward to serving you again.'
  }
];

function FlightAnnouncements() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [playingId, setPlayingId] = useState(null);
  const audioRef = useRef(null); // Use single shared audio element
  const [expandedScript, setExpandedScript] = useState(null);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isNearFooter, setIsNearFooter] = useState(false);

  const categories = ['All', 'Standard', 'Safety', 'Service', 'Special'];

  // Debug: Log audio URL on component mount and initialize audio
  useEffect(() => {
    console.log('🔊 FlightAnnouncements mounted. audioUrl:', airlinePreFlightAudio);
    console.log('🔊 Type of audioUrl:', typeof airlinePreFlightAudio);
    console.log('🔊 All announcement URLs:', flightAnnouncements.map(a => ({ id: a.id, url: a.audioUrl })));
    
    // Initialize single shared audio element
    audioRef.current = new Audio(airlinePreFlightAudio);
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
  }, []);

  // Stop audio when component unmounts (navigate away)
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
          <h1>Flight Announcements Training</h1>
          <p className="flight-announcements-intro">
            Listen to professional flight announcements and practice your cabin crew communication skills. 
            These audio recordings cover standard, safety, and service announcements used in commercial aviation.
          </p>

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
              <strong>💡 Training Tip:</strong> Practice these announcements regularly to improve your pronunciation, 
              tone, and professional delivery. Record yourself and compare with these reference recordings.
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
