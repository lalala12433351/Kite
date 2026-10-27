'use client';

import { submitAdminLogin } from '@/src/utils/adminAuth';
import { useEffect, useState } from 'react';
import { normalizeNewsItems, formatNewsDate } from '../utils/newsUtils';
import RichTextEditor from '../components/RichTextEditor';
import { useAutoResizeTextarea } from '../hooks/useAutoResizeTextarea';

const getAssetUrl = (path) => `${'/'}${path}`;

const toDateTimeLocal = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 16);
};

function NewsAdmin({ embedded = false, onLogout }) {
  useEffect(() => {
    if (embedded) {
      setIsLoggedIn(true);
      return undefined;
    }
    document.body.style.backgroundColor = '#f5f5f5';
    document.body.style.minHeight = '100vh';
    if (localStorage.getItem('kiteNewsAdmin') === 'true') {
      setIsLoggedIn(true);
    }
    return () => {
      document.body.style.backgroundColor = '';
      document.body.style.minHeight = '';
    };
  }, [embedded]);

  // Styles moved to CSS classes

  const [isLoggedIn, setIsLoggedIn] = useState(embedded);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);

  const [posts, setPosts] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    tag: '',
    image: '',
    source: '',
    source_url: '',
    external_url: '',
    created_at: '',
    content: '',
  });

  const loadPosts = () => {
    fetch(getAssetUrl('database/news-posts.json'))
      .then((response) => response.json())
      .then((data) => setPosts(normalizeNewsItems(data)))
      .catch(() => setPosts(normalizeNewsItems(sampleNewsFallback)));
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleLogin = async (event) => {
    event.preventDefault();
    const normalizedUsername = username.trim();
    const normalizedPassword = password.trim();

    const session = await submitAdminLogin(normalizedUsername, normalizedPassword);
    if (session?.ok) {
      setIsLoggedIn(true);
      if (!embedded) {
        localStorage.setItem('kiteNewsAdmin', 'true');
        localStorage.setItem('kiteUnifiedAdmin', 'true');
        localStorage.setItem('kiteAdminUser', normalizedUsername || 'Admin');
      }
      window.dispatchEvent(new Event('adminAuthChanged'));
      setLoginError(false);
    } else {
      setLoginError(true);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleContentChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      content: value,
    }));
  };

  // Auto-resize textarea
  const subtitleTextareaRef = useAutoResizeTextarea(formData.subtitle);

  const resetForm = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      title: '',
      subtitle: '',
      tag: '',
      image: '',
      source: '',
      source_url: '',
      external_url: '',
      created_at: '',
      content: '',
    });
  };

  const handleSavePost = async (event) => {
    event.preventDefault();
    setMessage('');

    const createdAtIso = formData.created_at
      ? new Date(formData.created_at).toISOString()
      : new Date().toISOString();

    const postData = {
      title: formData.title.trim(),
      subtitle: formData.subtitle.trim(),
      tag: formData.tag.trim(),
      image: formData.image.trim(),
      source: formData.source.trim(),
      source_url: formData.source_url.trim(),
      external_url: formData.external_url.trim(),
      created_at: createdAtIso,
      content: formData.content,
    };

    if (!postData.title || !postData.content) {
      setMessage('Title and content are required.');
      setMessageType('error');
      return;
    }

    try {
      const formBody = new URLSearchParams();
      formBody.append('action', isEditing ? 'update' : 'add');
      formBody.append('postData', JSON.stringify(postData));
      if (isEditing) {
        formBody.append('postId', editingId);
      }

      const response = await fetch(`${'/'}news-admin.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formBody.toString(),
      });

      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        throw new Error('Invalid JSON response');
      }

      if (result.status === 'success') {
        setMessage(isEditing ? 'News post updated successfully!' : 'News post added successfully!');
        setMessageType('success');
        loadPosts();
        resetForm();
        setTimeout(() => setMessage(''), 3000);
      } else {
        throw new Error(result.message || 'Failed to save news post');
      }
    } catch (error) {
      if (error.message === 'Failed to fetch' || error.message === 'Invalid JSON response') {
        if (isEditing) {
          const updatedPosts = posts.map((p) =>
            p.id === editingId
              ? {
                  ...p,
                  ...postData,
                  formatted_date: formatNewsDate(postData.created_at),
                }
              : p
          );
          setPosts(updatedPosts);
          setMessage('⚠️ DEV MODE: Post updated locally (Backend not connected)');
        } else {
          const newPost = {
            id: posts.length > 0 ? Math.max(...posts.map((p) => Number(p.id) || 0)) + 1 : 1,
            ...postData,
            formatted_date: formatNewsDate(postData.created_at),
          };
          setPosts([newPost, ...posts]);
          setMessage('⚠️ DEV MODE: Post added locally (Backend not connected)');
        }
        setMessageType('success');
        resetForm();
        setTimeout(() => setMessage(''), 5000);
      } else {
        setMessage(`Error: ${error.message}`);
        setMessageType('error');
      }
    }
  };

  const handleEdit = (post) => {
    setIsEditing(true);
    setEditingId(post.id);
    setFormData({
      title: post.title || '',
      subtitle: post.subtitle || '',
      tag: post.tag || '',
      image: post.image || '',
      source: post.source || '',
      source_url: post.source_url || '',
      external_url: post.external_url || '',
      created_at: toDateTimeLocal(post.created_at),
      content: post.content || '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (postId) => {
    if (!confirm('Are you sure you want to delete this news post?')) return;

    try {
      const formBody = new URLSearchParams();
      formBody.append('action', 'delete');
      formBody.append('postId', postId);

      const response = await fetch(`${'/'}news-admin.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formBody.toString(),
      });

      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        throw new Error('Invalid JSON response');
      }

      if (result.status === 'success') {
        setMessage('News post deleted successfully!');
        setMessageType('success');
        loadPosts();
        setTimeout(() => setMessage(''), 3000);
      } else {
        throw new Error(result.message || 'Failed to delete news post');
      }
    } catch (error) {
      if (error.message === 'Failed to fetch' || error.message === 'Invalid JSON response') {
        const filteredPosts = posts.filter((p) => p.id !== postId);
        setPosts(filteredPosts);
        setMessage('⚠️ DEV MODE: Post deleted locally (Backend not connected)');
        setMessageType('success');
        setTimeout(() => setMessage(''), 5000);
      } else {
        setMessage(`Error: ${error.message}`);
        setMessageType('error');
      }
    }
  };

  if (!embedded && !isLoggedIn) {
    return (
      <div className="admin-login-page">
        <div className="admin-login-card">
          <h2>Kite News Admin</h2>
          <form onSubmit={handleLogin}>
            <label className="admin-label">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              className="admin-input"
              required
            />
            <label className="admin-label">Password</label>
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
        </div>
      </div>
    );
  }

  return (
    <div className={`admin-content ${embedded ? 'admin-content--embedded' : ''}`}>
      <div className="admin-container admin-container--flex">
        <div className="admin-form-section">
          <h2>{isEditing ? 'Edit News Post' : 'Add New News Post'}</h2>

          {message && (
            <div className={`admin-message ${messageType === 'success' ? 'admin-message--success' : 'admin-message--error'}`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSavePost}>
            <label className="admin-label">Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="admin-input"
              required
            />

            <label className="admin-label">Subtitle</label>
            <textarea
              ref={subtitleTextareaRef}
              name="subtitle"
              value={formData.subtitle}
              onChange={handleChange}
              rows={2}
              className="admin-textarea"
              placeholder="Optional subheading shown below the title"
            />

            <label className="admin-label">Tag / Category</label>
            <input
              type="text"
              name="tag"
              value={formData.tag}
              onChange={handleChange}
              className="admin-input"
              placeholder="Placement, Aviation, Events, ..."
            />

            <label className="admin-label">Hero Image (relative path or full URL)</label>
            <input
              type="text"
              name="image"
              value={formData.image}
              onChange={handleChange}
              className="admin-input"
              placeholder="images/news/hero.jpg"
            />

            <label className="admin-label">Source / Author</label>
            <input
              type="text"
              name="source"
              value={formData.source}
              onChange={handleChange}
              className="admin-input"
              placeholder="Kite Communications Team"
            />

            <label className="admin-label">Source URL</label>
            <input
              type="url"
              name="source_url"
              value={formData.source_url}
              onChange={handleChange}
              className="admin-input"
              placeholder="https://original-source.com/article"
            />

            <label className="admin-label">External Read Link</label>
            <input
              type="url"
              name="external_url"
              value={formData.external_url}
              onChange={handleChange}
              className="admin-input"
              placeholder="https://read-more.com/story"
            />

            <label className="admin-label">Published (date &amp; time)</label>
            <input
              type="datetime-local"
              name="created_at"
              value={formData.created_at}
              onChange={handleChange}
              className="admin-input"
            />

            <label className="admin-label">Content</label>
            <div className="admin-editor-container">
              <RichTextEditor
                value={formData.content}
                onChange={handleContentChange}
                placeholder="Use the toolbar to format text, insert links, and headings."
                style={{ height: '240px' }}
              />
            </div>

            <div className="admin-form-buttons">
              <button type="submit" className="admin-btn--save">
                {isEditing ? 'Update News Post' : 'Publish News Post'}
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
                    localStorage.removeItem('kiteNewsAdmin');
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
              <li>Use the editor toolbar to apply formatting, links, and colors.</li>
              <li>Leave the image field empty to use a default hero.</li>
              <li>Source helps readers understand who authored the story.</li>
              <li>Publish date defaults to now if left empty.</li>
            </ul>
          </div>
        </div>

        <div className="admin-posts-section">
          <h2>Published News ({posts.length})</h2>

          {posts.length === 0 ? (
            <p className="admin-posts-empty">No news posts yet. Add your first update!</p>
          ) : (
            <div className="admin-posts-list">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className={`admin-post-card ${editingId === post.id ? 'admin-post-card--editing' : ''}`}
                >
                  <h3>{post.title}</h3>
                  {post.subtitle && <p>{post.subtitle}</p>}

                  <div className="admin-post-meta">
                    <small>{post.formatted_date}</small>
                    {post.source && <small>• {post.source}</small>}
                    {post.tag && <small>• {post.tag}</small>}
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

const sampleNewsFallback = [
  {
    id: 1,
    title: 'Sample news headline',
    subtitle: 'A short description of the story',
    tag: 'General',
    content: '<p>This is a placeholder article used if the news JSON file cannot be loaded.</p>',
    image: '',
    source: 'Kite Communications Team',
    source_url: '',
    external_url: '',
    created_at: new Date().toISOString(),
    formatted_date: formatNewsDate(new Date().toISOString()),
  },
];

export default NewsAdmin;

