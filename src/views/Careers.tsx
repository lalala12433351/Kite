'use client';

import { useState, useEffect } from 'react';
import { Link } from '@/lib/router';
import JobApplicationForm from '../components/JobApplicationForm';

// Get base URL for assets
const getAssetUrl = (path) => `${'/'}${path}`;

function Careers() {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [activeTag, setActiveTag] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortType, setSortType] = useState('newest');
  const [selectedPost, setSelectedPost] = useState(null);
  const [showJobApplicationForm, setShowJobApplicationForm] = useState(false);
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const postsPerPage = 10;

  // Load posts from JSON
  useEffect(() => {
    let isMounted = true;

    async function loadPosts() {
      setLoading(true);
      try {
        const response = await fetch(getAssetUrl('database/careers-posts.json'));
        if (!response.ok) {
          throw new Error(`Failed with status ${response.status}`);
        }
        const data = await response.json();
        if (isMounted) {
          setPosts(data);
          setFilteredPosts(data);
        }
      } catch (error) {
        console.error('Error loading careers posts:', error);
        if (isMounted) {
          setPosts([]);
          setFilteredPosts([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadPosts();

    return () => {
      isMounted = false;
    };
  }, []);

  // Filter and sort posts
  useEffect(() => {
    let result = [...posts];

    // Filter by tag
    if (activeTag) {
      result = result.filter(p => p.tags.includes(activeTag));
    }

    // Filter by search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => {
        const searchText = `${p.title} ${p.excerpt} ${p.author} ${p.tags.join(' ')}`.toLowerCase();
        return searchText.includes(q);
      });
    }

    // Sort
    if (sortType === 'newest') {
      result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } else if (sortType === 'oldest') {
      result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } else if (sortType === 'alpha') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }

    setFilteredPosts(result);
    setPage(1); // Reset to first page on filter change
  }, [posts, activeTag, searchQuery, sortType]);

  // Get all unique tags with counts
  const getAllTags = () => {
    const tagCounts = {};
    posts.forEach(post => {
      post.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    return Object.keys(tagCounts).sort().map(tag => ({
      name: tag,
      count: tagCounts[tag]
    }));
  };

  // Get popular posts (by views)
  const getPopularPosts = () => {
    return [...posts].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 3);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Open post modal
  const openPost = (post) => {
    // Increment views
    const updatedPosts = posts.map(p =>
      p.id === post.id ? { ...p, views: (p.views || 0) + 1 } : p
    );
    setPosts(updatedPosts);
    setSelectedPost({ ...post, views: (post.views || 0) + 1 });
    
    // Check if user has already applied for this position
    const appliedJobs = JSON.parse(localStorage.getItem('appliedJobs') || '[]');
    setApplicationSubmitted(appliedJobs.includes(post.id));
    
    document.body.classList.add('popup-opened');
  };

  // Close post modal
  const closePost = () => {
    setSelectedPost(null);
    setApplicationSubmitted(false);
    document.body.classList.remove('popup-opened');
  };

  // Reset filters
  const resetFilters = () => {
    setActiveTag(null);
    setSearchQuery('');
    setSortType('newest');
    setPage(1);
  };

  // Paginated posts
  const paginatedPosts = filteredPosts.slice(0, page * postsPerPage);
  const hasMore = filteredPosts.length > page * postsPerPage;

  return (
    <>
      <div className="content-box articles-page careers">
        <div className="content-block">
          <div className="lt">
            <h1>Careers</h1>
            <div className="container">
              
              <div className="search">
                <input
                  id="search"
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <select
                  id="sort"
                  value={sortType}
                  onChange={(e) => setSortType(e.target.value)}
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="alpha">Title A-Z</option>
                </select>
              </div>

              <div className="grid">
                <div>
                  <div className="posts" id="posts">
                    {loading ? (
                      Array.from({ length: 3 }).map((_, index) => (
                        <article key={`career-skeleton-${index}`} className="card card--skeleton" aria-hidden="true">
                          <div className="thumb skeleton-block" />
                          <div>
                            <div className="skeleton-line skeleton-line--medium" />
                            <div className="skeleton-line skeleton-line--short" />
                            <div className="skeleton-line skeleton-line--long" />
                            <div className="skeleton-pill-row">
                              <span className="skeleton-pill" />
                              <span className="skeleton-pill skeleton-pill--short" />
                              <span className="skeleton-pill" />
                            </div>
                          </div>
                        </article>
                      ))
                    ) : paginatedPosts.length === 0 ? (
                      <div className="widget">No posts found.</div>
                    ) : (
                      paginatedPosts.map(post => (
                        <article key={post.id} className="card">
                          <div
                            className="thumb"
                            style={{ 
                              backgroundImage: post.thumb ? `url(${post.thumb})` : `url(${getAssetUrl('icons/career-img.jpg')})` 
                            }}
                          ></div>
                          <div>
                            <div className="title">
                              <a
                                href="#"
                                className="readmore"
                                onClick={(e) => {
                                  e.preventDefault();
                                  openPost(post);
                                }}
                                style={{ cursor: 'pointer' }}
                              >
                                {post.title}
                              </a>
                            </div>
                            <div className="meta">
                              {formatDate(post.date)} • {post.author}
                            </div>
                            <div className="excerpt">{post.excerpt}</div>
                            <a
                              href="#"
                              className="readmore"
                              onClick={(e) => {
                                e.preventDefault();
                                openPost(post);
                              }}
                              style={{ cursor: 'pointer' }}
                            >
                              Read more
                            </a>
                            <div style={{ marginTop: '0px', fontSize: '13px', color: post.tags.length ? '#6b7280' : 'transparent' }}>
                              {post.tags.map((tag, i) => (
                                <span key={i} style={{ marginRight: '6px' }}>
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          </div>
                        </article>
                      ))
                    )}
                  </div>

                  {!loading && (
                    <div className="actions">
                      <button className="secondary" id="resetFilters" onClick={resetFilters}>
                        Clear Filter
                      </button>
                      {hasMore && (
                        <button id="loadMore" onClick={() => setPage(page + 1)}>
                          Load more
                        </button>
                      )}
                    </div>
                  )}

                  <div className="aviation-career">
                    <h3>Careers in Aviation</h3>
                    <span>
                      Explore the latest job openings in leading airlines and take the next step in
                      your aviation career. This page is updated regularly with new opportunities.
                    </span>
                    <Link className="btn btn-primary showloader" to="/aviation-careers">
                      Click Here
                    </Link>
                  </div>

                  <h4>Stay in Touch</h4>
                  If you're interested in future career opportunities with us, we'd love to hear from you.
                  <br />
                  You can share your resume and a short note about your experience at:
                  <br />
                  <a href="mailto:careers@kiteaviation.in" target="_blank" rel="noopener noreferrer">
                    careers@kiteaviation.in
                  </a>
                  <br />
                  <br />
                  We'll keep your profile in our talent pool and contact you when a suitable opportunity
                  becomes available.
                  <br />
                </div>
              </div>
            </div>
          </div>

          <div className="rt">
            <aside className="sidebar">
              <div className="widget">
                <h1>Hello,</h1>
                <span className="text">
                  At Kite Institute of Aviation & Hospitality, we are committed to shaping future
                  professionals in the fields of aviation, hospitality, and customer service. While we
                  don't have any open positions at the moment, we are always eager to connect with
                  passionate, skilled, and driven individuals who are interested in being part of our
                  growing team.
                </span>
                
                <h4>Tags</h4>
                <div className="tag-list widget" id="tagList">
                  <strong>Filter</strong>
                  <div style={{ marginTop: '8px' }}>
                    {loading ? (
                      <div className="skeleton-pill-group">
                        <span className="skeleton-pill" />
                        <span className="skeleton-pill skeleton-pill--short" />
                        <span className="skeleton-pill" />
                      </div>
                    ) : (
                      getAllTags().map((tag, i) => (
                        <button
                          key={i}
                          className={`tag ${activeTag === tag.name ? 'active' : ''}`}
                          onClick={() => setActiveTag(activeTag === tag.name ? null : tag.name)}
                        >
                          {tag.name} ({tag.count})
                        </button>
                      ))
                    )}
                  </div>
                </div>
                
                <h4>Popular</h4>
                <div className="popular-list" id="popular">
                  {loading ? (
                    Array.from({ length: 3 }).map((_, index) => (
                      <div key={`popular-skeleton-${index}`} className="post-short-card post-short-card--skeleton" aria-hidden="true">
                        <div className="skeleton-block skeleton-block--thumbnail" />
                        <div>
                          <div className="skeleton-line skeleton-line--short" />
                          <div className="skeleton-line skeleton-line--thin" />
                        </div>
                      </div>
                    ))
                  ) : (
                    getPopularPosts().map((post, i) => (
                      <div 
                        key={i} 
                        className="post-short-card"
                        onClick={() => openPost(post)}
                        style={{ cursor: 'pointer' }}
                      >
                        <img
                          src={post.thumb || getAssetUrl('icons/career-img.jpg')}
                          width="60"
                          height="40"
                          style={{ objectFit: 'cover', borderRadius: '6px' }}
                          alt={post.title}
                        />
                        <div>
                          <div className="short-title">{post.title}</div>
                          <div className="muted-date">{formatDate(post.date)}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>

      {/* Modal */}
      {selectedPost && (
        <div className="articles-page modal-backdrop" id="modalBackdrop" onClick={closePost} style={{ display: 'flex' }}>
          <div 
            className="modal" 
            role="dialog" 
            aria-modal="true" 
            onClick={(e) => e.stopPropagation()}
            style={{
              transform: showJobApplicationForm ? 'translateX(-90%)' : 'translateX(0)',
              transition: 'transform 0.3s ease'
            }}
          >
            <button id="closeModal" style={{ float: 'right' }} onClick={closePost}>
              Close
            </button>
            
            <div className="scroller-tbl">
              <div id="modalContent">
                <h2>{selectedPost.title}</h2>
                <div className="meta">
                  {formatDate(selectedPost.date)} • {selectedPost.author} • {selectedPost.views} views
                </div>
                {selectedPost.thumb && (
                  <img
                    src={selectedPost.thumb}
                    style={{ width: '100%', margin: '12px 0', borderRadius: '8px' }}
                    alt={selectedPost.title}
                  />
                )}
                <p dangerouslySetInnerHTML={{ __html: selectedPost.content }}></p>
                {selectedPost.link && (
                  <button
                    onClick={() => setShowJobApplicationForm(true)}
                    className="btnLink apply-now-btn"
                    style={{ 
                      border: 'none', 
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      fontSize: 'inherit'
                    }}
                  >
                    More Details
                  </button>
                )}
              </div>
              <div className="contact-card" style={applicationSubmitted ? { backgroundColor: '#d4edda', borderColor: '#c3e6cb' } : {}}>
                {!applicationSubmitted ? (
                  <>
                    <h4>Apply Now</h4>
                    <p style={{ marginBottom: '15px' }}>
                      Ready to join our team? Click the button below to submit your application.
                    </p>
                    <button 
                      className="btn btn-primary"
                      onClick={() => setShowJobApplicationForm(true)}
                      style={{ width: '100%', marginBottom: '10px' }}
                    >
                      Apply for this Position
                    </button>
                    <small style={{ display: 'block', textAlign: 'center', opacity: 0.7 }}>
                      Or email your resume to:{' '}
                      <a href="mailto:careers@kiteaviation.in" target="_blank" rel="noopener noreferrer">
                        careers@kiteaviation.in
                      </a>
                    </small>
                  </>
                ) : (
                  <>
                    <h4 style={{ color: '#155724' }}>Already Applied!</h4>
                    <p style={{ marginBottom: '0', color: '#155724' }}>
                      You have applied for this position, we will get back to you soon.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Job Application Form */}
      <JobApplicationForm 
        isOpen={showJobApplicationForm}
        onClose={() => setShowJobApplicationForm(false)}
        onSuccess={() => {
          setApplicationSubmitted(true);
          // Store in localStorage
          if (selectedPost) {
            const appliedJobs = JSON.parse(localStorage.getItem('appliedJobs') || '[]');
            if (!appliedJobs.includes(selectedPost.id)) {
              appliedJobs.push(selectedPost.id);
              localStorage.setItem('appliedJobs', JSON.stringify(appliedJobs));
            }
          }
        }}
        jobTitle={selectedPost?.title || ''}
      />
    </>
  );
}

export default Careers;
