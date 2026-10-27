'use client';

import { submitAdminLogin } from '@/src/utils/adminAuth';
import { useState, useEffect } from 'react';
import RichTextEditor from '../components/RichTextEditor';
import { useAutoResizeTextarea } from '../hooks/useAutoResizeTextarea';

// Get base URL for assets
const getAssetUrl = (path) => `${'/'}${path}`;

function CareersAdmin({ embedded = false, onLogout }) {
  // Set body background on mount
  useEffect(() => {
    if (embedded) {
      setIsLoggedIn(true);
      return undefined;
    }
    document.body.style.backgroundColor = '#f5f5f5';
    document.body.style.minHeight = '100vh';
    if (localStorage.getItem('kiteCareersAdmin') === 'true') {
      setIsLoggedIn(true);
    }
    return () => {
      document.body.style.backgroundColor = '';
      document.body.style.minHeight = '';
    };
  }, [embedded]);
  const [isLoggedIn, setIsLoggedIn] = useState(embedded);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [posts, setPosts] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    author: '',
    thumb: '',
    tags: '',
    link: ''
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

  // Load existing posts
  useEffect(() => {
    fetch(getAssetUrl('database/careers-posts.json'))
      .then(response => response.json())
      .then(data => setPosts(data))
      .catch(() => setPosts([]));
  }, []);

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault();
    const normalizedUsername = username.trim();
    const normalizedPassword = password.trim();

    const session = await submitAdminLogin(normalizedUsername, normalizedPassword);
    if (session?.ok) {
      setIsLoggedIn(true);
      if (!embedded) {
        localStorage.setItem('kiteCareersAdmin', 'true');
        localStorage.setItem('kiteUnifiedAdmin', 'true');
        localStorage.setItem('kiteAdminUser', normalizedUsername || 'Admin');
      }
      window.dispatchEvent(new Event('adminAuthChanged'));
      setLoginError(false);
    } else {
      setLoginError(true);
    }
  };

  // Handle form input changes
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleContentChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      content: value,
    }));
  };

  // Auto-resize textarea
  const excerptTextareaRef = useAutoResizeTextarea(formData.excerpt);

  // Load posts on login
  const loadPosts = () => {
    fetch(getAssetUrl('database/careers-posts.json'))
      .then(response => response.json())
      .then(data => setPosts(data))
      .catch(() => setPosts([]));
  };

  // Handle save/update post
  const handleSavePost = async (e) => {
    e.preventDefault();
    setMessage('');

    const postData = {
      title: formData.title,
      excerpt: formData.excerpt,
      content: formData.content,
      author: formData.author,
      thumb: formData.thumb,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      link: formData.link
    };

    try {
      const formBody = new URLSearchParams();
      formBody.append('action', isEditing ? 'update' : 'add');
      formBody.append('postData', JSON.stringify(postData));
      if (isEditing) {
        formBody.append('postId', editingId);
      }

      const response = await fetch(`${'/'}careers-admin.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formBody.toString()
      });

      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        throw new Error('Invalid JSON response');
      }

      if (result.status === 'success') {
        setMessage(isEditing ? 'Post updated successfully!' : 'Post added successfully!');
        setMessageType('success');
        loadPosts();
        resetForm();
        setTimeout(() => setMessage(''), 3000);
      } else {
        throw new Error(result.message || 'Failed to save post');
      }
    } catch (error) {
      // Fallback for development: Update local state
      if (error.message === 'Failed to fetch' || error.message === 'Invalid JSON response') {
        if (isEditing) {
          // Update existing post
          const updatedPosts = posts.map(p => 
            p.id === editingId 
              ? { ...p, ...postData, tags: postData.tags }
              : p
          );
          setPosts(updatedPosts);
          setMessage('⚠️ DEV MODE: Post updated locally (Backend not connected)');
        } else {
          // Add new post
          const newPost = {
            id: posts.length > 0 ? Math.max(...posts.map(p => p.id)) + 1 : 1,
            date: new Date().toISOString().split('T')[0],
            views: 0,
            ...postData
          };
          setPosts([...posts, newPost]);
          setMessage('⚠️ DEV MODE: Post added locally (Backend not connected)');
        }
        setMessageType('success');
        resetForm();
        setTimeout(() => setMessage(''), 5000);
      } else {
        setMessage('Error: ' + error.message);
        setMessageType('error');
      }
    }
  };

  // Handle edit
  const handleEdit = (post) => {
    setIsEditing(true);
    setEditingId(post.id);
    setFormData({
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      author: post.author,
      thumb: post.thumb,
      tags: post.tags.join(', '),
      link: post.link || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle delete
  const handleDelete = async (postId) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const formBody = new URLSearchParams();
      formBody.append('action', 'delete');
      formBody.append('postId', postId);

      const response = await fetch(`${'/'}careers-admin.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formBody.toString()
      });

      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        throw new Error('Invalid JSON response');
      }

      if (result.status === 'success') {
        setMessage('Post deleted successfully!');
        setMessageType('success');
        loadPosts();
        setTimeout(() => setMessage(''), 3000);
      } else {
        throw new Error(result.message || 'Failed to delete post');
      }
    } catch (error) {
      // Fallback for development: Delete from local state
      if (error.message === 'Failed to fetch' || error.message === 'Invalid JSON response') {
        const filteredPosts = posts.filter(p => p.id !== postId);
        setPosts(filteredPosts);
        setMessage('⚠️ DEV MODE: Post deleted locally (Backend not connected)');
        setMessageType('success');
        setTimeout(() => setMessage(''), 5000);
      } else {
        setMessage('Error: ' + error.message);
        setMessageType('error');
      }
    }
  };

  // Reset form
  const resetForm = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      title: '',
      excerpt: '',
      content: '',
      author: '',
      thumb: '',
      tags: '',
      link: ''
    });
  };

  if (!embedded && !isLoggedIn) {
    return (
      <div className="admin-login-page">
        <div className="admin-login-card">
          <h2>Kite Careers Admin</h2>
          <form onSubmit={handleLogin}>
            <label className="admin-label admin-label--float">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              className="admin-input"
              required
            />
            <label className="admin-label admin-label--float">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="admin-input"
              required
            />
            <button type="submit" className="admin-btn admin-btn--primary">
              Login
            </button>
            {loginError && <p className="admin-login-error">Invalid credentials</p>}
          </form>
          <a href="/site-v3/aviation-careers-admin" className="admin-link">
            Upload Post in Aviation Careers
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={`admin-content ${embedded ? 'admin-content--embedded' : ''}`}>
      <div className="admin-container admin-container--flex">
        <div className="admin-form-section">
          <h2>{isEditing ? 'Edit Career Post' : 'Add New Career Post'}</h2>
          
          {message && (
            <div className={`admin-message ${messageType === 'success' ? 'admin-message--success' : 'admin-message--error'}`}>
              {message}
            </div>
          )}
        
        <form onSubmit={handleSavePost}>
          <label className="admin-label admin-label--float">Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="admin-input"
            required
          />

          <label className="admin-label admin-label--float">Excerpt (Short Description)</label>
          <textarea
            ref={excerptTextareaRef}
            name="excerpt"
            value={formData.excerpt}
            onChange={handleChange}
            rows={2}
            className="admin-textarea"
            required
          />

          <label className="admin-label admin-label--float">Content</label>
          <div className="admin-editor-container">
            <RichTextEditor
              value={formData.content}
              onChange={handleContentChange}
              placeholder="Use the toolbar to format the full job description."
              style={{ height: '220px' }}
            />
          </div>

          <label className="admin-label admin-label--float">Author</label>
          <input
            type="text"
            name="author"
            value={formData.author}
            onChange={handleChange}
            className="admin-input"
            placeholder="e.g., Kite HR"
            required
          />

          <label className="admin-label admin-label--float">Thumbnail URL</label>
          <input
            type="text"
            name="thumb"
            value={formData.thumb}
            onChange={handleChange}
            className="admin-input"
            placeholder="https://example.com/image.jpg or leave empty for default"
          />

          <label className="admin-label admin-label--float">Tags (comma separated)</label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            className="admin-input"
            placeholder="marketing, fulltime, bangalore"
            required
          />

          <label className="admin-label admin-label--float">External Link (optional)</label>
          <input
            type="text"
            name="link"
            value={formData.link}
            onChange={handleChange}
            className="admin-input"
            placeholder="https://apply-here.com (optional)"
          />

          <div className="admin-form-buttons">
            <button type="submit" className="admin-btn--save">
              {isEditing ? 'Update Post' : 'Save Post'}
            </button>
            {isEditing && (
              <button type="button" onClick={resetForm} className="admin-btn--cancel">
                Cancel
              </button>
            )}
            {!embedded && (
              <button 
                type="button"
                onClick={() => {
                  setIsLoggedIn(false);
                  localStorage.removeItem('kiteCareersAdmin');
                  localStorage.removeItem('kiteUnifiedAdmin');
                  localStorage.removeItem('kiteAdminUser');
                  window.dispatchEvent(new Event('adminAuthChanged'));
                }}
                className="admin-btn--logout"
              >
                Logout
              </button>
            )}
            {embedded && (
              <button 
                type="button"
                onClick={() => {
                  onLogout?.();
                  window.dispatchEvent(new Event('adminAuthChanged'));
                }}
                className="admin-btn--logout"
              >
                Logout
              </button>
            )}
          </div>
        </form>

        <div className="admin-tips">
          <h4>Tips:</h4>
          <ul>
            <li>Use the editor toolbar to format content</li>
            <li>Thumbnail URL can be from Unsplash or your own hosting</li>
            <li>Tags help users filter posts (comma separated)</li>
            <li>Leave External Link empty if not applicable</li>
            <li>Posts are saved directly to the JSON file</li>
          </ul>
        </div>
        </div>

        <div className="admin-posts-section">
          <h2>All Posts ({posts.length})</h2>
          
          {posts.length === 0 ? (
            <p className="admin-posts-empty">No posts yet. Add your first post!</p>
          ) : (
            <div className="admin-posts-list">
              {posts.map((post) => (
                <div 
                  key={post.id} 
                  className={`admin-post-card ${editingId === post.id ? 'admin-post-card--editing' : ''}`}
                >
                  <h3 className="large">{post.title}</h3>
                  <p className="subtitle">{post.excerpt}</p>
                  
                  <div className="admin-post-meta">
                    <small>By {post.author}</small>
                    <small>• {post.date}</small>
                    <small>• {post.views || 0} views</small>
                  </div>

                  <div className="admin-tags">
                    {post.tags && post.tags.map((tag, i) => (
                      <span key={i} className="admin-tag">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="admin-post-actions">
                    <button onClick={() => handleEdit(post)} className="admin-btn--edit">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(post.id)} className="admin-btn--delete">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CareersAdmin;

