import fs from 'fs';
import path from 'path';
import DOMPurify from 'isomorphic-dompurify';

export const dataDir = path.join(process.cwd(), 'data');

const FILES = {
  news: 'news-posts.json',
  careers: 'careers-posts.json',
  'aviation-careers': 'aviation-careers-posts.json',
  'gallery-albums': 'gallery-albums.json',
  'gallery-images': 'gallery-images.json',
  'gallery-settings': 'gallery-settings.json',
};

export function sanitizeHtml(html) {
  return DOMPurify.sanitize(String(html || ''), { USE_PROFILES: { html: true } });
}

function emptyValue(kind) {
  if (kind === 'gallery-settings') {
    return {
      description:
        'Every picture tells a story — of passion, progress, and possibilities. Browse through our gallery to relive the inspiring moments, cultural celebrations, and proud achievements that make Kite Institute a truly dynamic place to learn and grow.',
    };
  }
  return [];
}

export function contentFile(kind) {
  const name = FILES[kind];
  if (!name) return null;
  return path.join(dataDir, name);
}

export function readContent(kind) {
  const file = contentFile(kind);
  if (!file) return null;
  if (!fs.existsSync(file)) return emptyValue(kind);
  const data = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (kind === 'news' && Array.isArray(data)) {
    return data.map((post) => ({ ...post, content: sanitizeHtml(post.content) }));
  }
  if ((kind === 'careers' || kind === 'aviation-careers') && Array.isArray(data)) {
    return data.map((post) => ({ ...post, content: sanitizeHtml(post.content) }));
  }
  return data;
}

export function writeContent(kind, data) {
  const file = contentFile(kind);
  if (!file) throw new Error('Unknown content type');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const payload = Array.isArray(data)
    ? data.map((post) => (post && typeof post.content === 'string' ? { ...post, content: sanitizeHtml(post.content) } : post))
    : data;
  fs.writeFileSync(file, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  return payload;
}

function formatDisplayDate(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return String(iso || '');
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }).replace(/ /g, ' ');
}

export async function handlePostAction(kind, request) {
  const form = await request.formData();
  const action = String(form.get('action') || '');
  const posts = readContent(kind);
  if (!Array.isArray(posts)) throw new Error('Content file is not a list');

  if (action === 'add' || action === 'update') {
    const postData = JSON.parse(String(form.get('postData') || '{}'));
    if (!postData || typeof postData !== 'object') throw new Error('Invalid post data');
    if (postData.content) postData.content = sanitizeHtml(postData.content);

    if (action === 'add') {
      const maxId = posts.reduce((max, post) => Math.max(max, Number(post.id) || 0), 0);
      const createdAt = postData.created_at || postData.date || new Date().toISOString();
      const next = {
        ...postData,
        id: maxId + 1,
        created_at: kind === 'news' ? new Date(createdAt).toISOString() : postData.created_at,
        formatted_date: kind === 'news' ? (postData.formatted_date || formatDisplayDate(createdAt)) : postData.formatted_date,
      };
      if (!String(next.title || '').trim() || !String(next.content || '').trim()) {
        throw new Error('Title and content are required');
      }
      posts.push(next);
      writeContent(kind, posts);
      return { status: 'success', message: 'Saved', post: next };
    }

    const postId = Number(form.get('postId') || 0);
    const index = posts.findIndex((post) => Number(post.id) === postId);
    if (!postId || index < 0) throw new Error('Post not found');
    const createdAt = postData.created_at || posts[index].created_at;
    posts[index] = {
      ...posts[index],
      ...postData,
      id: posts[index].id,
      formatted_date: kind === 'news' ? (postData.formatted_date || formatDisplayDate(createdAt)) : posts[index].formatted_date,
    };
    writeContent(kind, posts);
    return { status: 'success', message: 'Updated' };
  }

  if (action === 'delete') {
    const postId = Number(form.get('postId') || 0);
    if (!postId) throw new Error('Invalid post ID');
    writeContent(kind, posts.filter((post) => Number(post.id) !== postId));
    return { status: 'success', message: 'Deleted' };
  }

  throw new Error('Invalid action');
}
