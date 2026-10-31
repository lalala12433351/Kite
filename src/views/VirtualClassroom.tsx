'use client';

import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from '@/lib/router';
import { useCmsContent, cmsAssetUrl } from '@/src/hooks/useCmsContent';
import virtualClassroomFallback from '../../data/virtual-classroom.json';

function VirtualClassroom() {
  const navigate = useNavigate();
  const { data: vcDoc } = useCmsContent('virtual-classroom', virtualClassroomFallback);
  const page = vcDoc?.page || virtualClassroomFallback.page;
  const sidebar = vcDoc?.sidebar || virtualClassroomFallback.sidebar;
  const sessions = useMemo(() => {
    const source = vcDoc?.sessions?.length ? vcDoc.sessions : virtualClassroomFallback.sessions;
    return source.map((session) => ({
      ...session,
      thumbnail: cmsAssetUrl(session.thumbnail),
    }));
  }, [vcDoc?.sessions]);
  const downloadableResources =
    vcDoc?.downloadableResources?.length
      ? vcDoc.downloadableResources
      : virtualClassroomFallback.downloadableResources;
  const discussionComments =
    vcDoc?.discussionComments?.length
      ? vcDoc.discussionComments
      : virtualClassroomFallback.discussionComments;
  const categories = page.categories || virtualClassroomFallback.page.categories;
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

  const filteredSessions = selectedCategory === 'All' 
    ? sessions 
    : sessions.filter(session => session.category === selectedCategory);

  return (
    <div className="content-box virtual-classroom-page">
      <div className="virtual-classroom-topbar">
        <div className="topbar-content">
          <div className="topbar-left">
            <span className="topbar-welcome">{page.welcomePrefix}</span>
            <span className="topbar-student-id">{studentId}</span>
          </div>
          <div className="topbar-right">
            <button className="topbar-btn" onClick={() => alert('Profile settings coming soon!')}>
              {page.profileButtonLabel}
            </button>
            <button className="topbar-btn" onClick={handleLogout}>
              {page.logoutButtonLabel}
            </button>
          </div>
        </div>
      </div>
      <div className="content-block virtual-classroom-layout">
        <div className="virtual-classroom-main">
          <div className="virtual-classroom-intro">
            <h1>{page.title}</h1>
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
                      alert(page.watchPlaceholderMessage);
                    }}>
                      {page.watchButtonLabel}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredSessions.length === 0 && (
            <div className="no-sessions">
              <p>{page.emptyCategoryMessage}</p>
            </div>
          )}

          <div className="training-tip">
            <p>
              <strong>Tip:</strong> {page.trainingTip}
            </p>
          </div>
        </div>

        <div className="virtual-classroom-sidebar">
          <div className="sidebar-section">
            <h3 className="sidebar-title">{sidebar.discussionTitle}</h3>
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
            <button className="sidebar-btn">{sidebar.viewCommentsLabel}</button>
            <div className="comment-form">
              <textarea 
                className="comment-input" 
                placeholder={sidebar.commentPlaceholder}
                rows={3}
              ></textarea>
              <button className="comment-submit-btn">{sidebar.postCommentLabel}</button>
            </div>
          </div>

          <div className="sidebar-section">
            <h3 className="sidebar-title">{sidebar.resourcesTitle}</h3>
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
            <button className="sidebar-btn">{sidebar.viewResourcesLabel}</button>
          </div>

          <div className="sidebar-section">
            <h3 className="sidebar-title">{sidebar.quickLinksTitle}</h3>
            <ul className="quick-links-list">
              {sidebar.quickLinks.map((link) => (
                <li key={link.href}><a href={link.href}>{link.label}</a></li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VirtualClassroom;

