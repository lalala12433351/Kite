'use client';

import { useState, useEffect } from 'react';
import { useNavigate } from '@/lib/router';

// Get base URL for assets
const getAssetUrl = (path) => `${'/'}${path}`;

function VirtualClassroom() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [studentId, setStudentId] = useState('');

  // Check authentication on mount
  useEffect(() => {
    const isAuthenticated = localStorage.getItem('virtualClassroomAuth');
    const storedStudentId = localStorage.getItem('studentId');
    if (!isAuthenticated) {
      navigate('/virtual-classroom-login');
    } else {
      setStudentId(storedStudentId || 'Student');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('virtualClassroomAuth');
    localStorage.removeItem('studentId');
    navigate('/virtual-classroom-login');
  };

  // Sample recorded sessions - replace with actual data
  const sessions = [
    {
      id: 1,
      title: 'Introduction to Aviation Industry',
      description: 'Get an overview of the aviation sector, its history, and current trends shaping the industry.',
      duration: '45 minutes',
      category: 'Foundation',
      thumbnail: getAssetUrl('images/camp-bg.jpg'),
      videoUrl: '#',
      instructor: 'Capt. Rajesh Kumar',
      date: '2024-01-15'
    },
    {
      id: 2,
      title: 'Cabin Crew Duties & Responsibilities',
      description: 'Learn about the essential duties of cabin crew members and how to excel in customer service.',
      duration: '1 hour 15 minutes',
      category: 'Cabin Crew',
      thumbnail: getAssetUrl('images/camp-bg.jpg'),
      videoUrl: '#',
      instructor: 'Ms. Priya Sharma',
      date: '2024-01-18'
    },
    {
      id: 3,
      title: 'Airport Operations Basics',
      description: 'Understand the fundamentals of airport operations, from check-in to boarding gates.',
      duration: '50 minutes',
      category: 'Operations',
      thumbnail: getAssetUrl('images/camp-bg.jpg'),
      videoUrl: '#',
      instructor: 'Mr. Amit Verma',
      date: '2024-01-20'
    },
    {
      id: 4,
      title: 'Customer Service Excellence',
      description: 'Master the art of delivering exceptional customer service in aviation and hospitality.',
      duration: '1 hour',
      category: 'Hospitality',
      thumbnail: getAssetUrl('images/camp-bg.jpg'),
      videoUrl: '#',
      instructor: 'Ms. Sunita Reddy',
      date: '2024-01-22'
    },
    {
      id: 5,
      title: 'Safety & Emergency Procedures',
      description: 'Critical safety protocols and emergency procedures every aviation professional must know.',
      duration: '1 hour 30 minutes',
      category: 'Safety',
      thumbnail: getAssetUrl('images/camp-bg.jpg'),
      videoUrl: '#',
      instructor: 'Capt. Vikram Singh',
      date: '2024-01-25'
    },
    {
      id: 6,
      title: 'Aviation Terminology & Communication',
      description: 'Build your aviation vocabulary and improve your professional communication skills.',
      duration: '40 minutes',
      category: 'Foundation',
      thumbnail: getAssetUrl('images/camp-bg.jpg'),
      videoUrl: '#',
      instructor: 'Ms. Anjali Patel',
      date: '2024-01-28'
    },
    {
      id: 7,
      title: 'Hospitality Management Principles',
      description: 'Explore core principles of hospitality management and guest relations.',
      duration: '55 minutes',
      category: 'Hospitality',
      thumbnail: getAssetUrl('images/camp-bg.jpg'),
      videoUrl: '#',
      instructor: 'Ms. Kavita Mehta',
      date: '2024-02-01'
    },
    {
      id: 8,
      title: 'Interview Preparation Workshop',
      description: 'Prepare for airline and hospitality job interviews with expert tips and mock sessions.',
      duration: '1 hour 20 minutes',
      category: 'Career',
      thumbnail: getAssetUrl('images/camp-bg.jpg'),
      videoUrl: '#',
      instructor: 'Ms. Deepika Rao',
      date: '2024-02-05'
    }
  ];

  const categories = ['All', 'Foundation', 'Cabin Crew', 'Operations', 'Hospitality', 'Safety', 'Career'];
  const filteredSessions = selectedCategory === 'All' 
    ? sessions 
    : sessions.filter(session => session.category === selectedCategory);

  // Sample downloadable resources
  const downloadableResources = [
    { id: 1, name: 'Aviation Industry Guide.pdf', size: '2.5 MB', type: 'PDF' },
    { id: 2, name: 'Cabin Crew Handbook.pdf', size: '1.8 MB', type: 'PDF' },
    { id: 3, name: 'Safety Procedures Checklist.pdf', size: '950 KB', type: 'PDF' },
    { id: 4, name: 'Interview Tips & Templates.docx', size: '1.2 MB', type: 'DOC' },
  ];

  // Sample discussion comments
  const discussionComments = [
    { id: 1, author: 'Student A', comment: 'This session was very helpful! Thank you.', time: '2 hours ago' },
    { id: 2, author: 'Student B', comment: 'Could you explain more about emergency protocols?', time: '1 day ago' },
    { id: 3, author: 'Instructor', comment: 'Great question! I\'ll cover that in the next session.', time: '2 days ago' },
  ];

  return (
    <div className="content-box virtual-classroom-page">
      <div className="virtual-classroom-topbar">
        <div className="topbar-content">
          <div className="topbar-left">
            <span className="topbar-welcome">Welcome back,</span>
            <span className="topbar-student-id">{studentId}</span>
          </div>
          <div className="topbar-right">
            <button className="topbar-btn" onClick={() => alert('Profile settings coming soon!')}>
              Profile
            </button>
            <button className="topbar-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>
      <div className="content-block virtual-classroom-layout">
        <div className="virtual-classroom-main">
          <div className="virtual-classroom-intro">
            <h1>Virtual Classroom</h1>
          </div>

          <div className="filter-tabs">
            {categories.map(category => (
              <button
                key={category}
                className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="sessions-list">
            {filteredSessions.map(session => (
              <div key={session.id} className="session-card">
                <div className="session-thumbnail">
                  <img src={session.thumbnail} alt={session.title} />
                  <div className="play-overlay">
                    <span className="play-icon">▶</span>
                  </div>
                  <span className="duration-badge">{session.duration}</span>
                </div>
                <div className="session-info">
                  <h3 className="session-title">{session.title}</h3>
                  <p className="session-description">{session.description}</p>
                  <div className="session-meta">
                    <span className="session-category">{session.category}</span>
                    <span className="session-instructor">By {session.instructor}</span>
                  </div>
                  <div className="session-actions">
                    <button className="watch-btn" onClick={() => {
                      alert('Video player coming soon. This will play the recorded session.');
                    }}>
                      Watch Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredSessions.length === 0 && (
            <div className="no-sessions">
              <p>No sessions found in this category.</p>
            </div>
          )}

          <div className="training-tip">
            <p>
              <strong>Tip:</strong> Bookmark your favorite sessions for quick access and revisit anytime!
            </p>
          </div>
        </div>

        <div className="virtual-classroom-sidebar">
          <div className="sidebar-section">
            <h3 className="sidebar-title">Discussion Forum</h3>
            <div className="discussion-list">
              {discussionComments.map(comment => (
                <div key={comment.id} className="discussion-item">
                  <div className="discussion-author">
                    <strong>{comment.author}</strong>
                    <span className="discussion-time">{comment.time}</span>
                  </div>
                  <p className="discussion-text">{comment.comment}</p>
                </div>
              ))}
            </div>
            <button className="sidebar-btn">View All Comments</button>
            <div className="comment-form">
              <textarea 
                className="comment-input" 
                placeholder="Add your comment..."
                rows={3}
              ></textarea>
              <button className="comment-submit-btn">Post Comment</button>
            </div>
          </div>

          <div className="sidebar-section">
            <h3 className="sidebar-title">Downloadable Resources</h3>
            <div className="resources-list">
              {downloadableResources.map(resource => (
                <div key={resource.id} className="resource-item">
                  <div className="resource-icon">
                    {resource.type === 'PDF' ? '📄' : '📝'}
                  </div>
                  <div className="resource-info">
                    <div className="resource-name">{resource.name}</div>
                    <div className="resource-size">{resource.size}</div>
                  </div>
                  <button className="resource-download-btn">⬇</button>
                </div>
              ))}
            </div>
            <button className="sidebar-btn">View All Resources</button>
          </div>

          <div className="sidebar-section">
            <h3 className="sidebar-title">Quick Links</h3>
            <ul className="quick-links-list">
              <li><a href="#help">Help & Support</a></li>
              <li><a href="#faq">FAQs</a></li>
              <li><a href="#notes">My Notes</a></li>
              <li><a href="#bookmarks">Bookmarked Sessions</a></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VirtualClassroom;

