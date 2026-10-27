'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  albumFileUrl,
  buildAlbumImageGroups,
  mergeAlbumsFromWebsite,
  normalizeGalleryImage,
  getImageCategoriesLabel,
  getCategoryForAlbum,
  getCategoriesForAlbumEditor,
  GALLERY_CATEGORIES,
} from '../utils/galleryAdminGroups';
import {
  loadAlbumsForAdmin,
  loadGalleryImagesFromJson,
  getAssetUrl,
  GALLERY_IMAGE_PATH,
} from '../utils/galleryData';
import { getGalleryAdminApiUrl, parseGalleryAdminResponse } from '../utils/galleryAdminApi';

const API_URL = getGalleryAdminApiUrl();

function GalleryAlbumAdmin({ embedded = false, onOpenUpload }) {
  const [images, setImages] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [editingAlbum, setEditingAlbum] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formName, setFormName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCoverId, setFormCoverId] = useState('');
  const [formImageIds, setFormImageIds] = useState([]);
  const [editingImage, setEditingImage] = useState(null);
  const [editingImageAlbum, setEditingImageAlbum] = useState(null);
  const [imageForm, setImageForm] = useState({ title: '', categories: [] });
  const [albumModalSaving, setAlbumModalSaving] = useState(false);

  const postForm = (body) => {
    const params = new URLSearchParams();
    Object.entries(body).forEach(([k, v]) => {
      if (v !== undefined && v !== null) params.append(k, typeof v === 'object' ? JSON.stringify(v) : String(v));
    });
    return fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    }).then((r) => r.text().then((t) => ({ ok: r.ok, text: t })));
  };

  const importFoldersIfNeeded = async () => {
    try {
      const res = await postForm({ action: 'import_albums_from_folders' });
      return parseGalleryAdminResponse(res);
    } catch {
      return null;
    }
  };

  const loadImages = () =>
    loadGalleryImagesFromJson().then((list) => {
      setImages(list.map((img) => normalizeGalleryImage(img, getAssetUrl, GALLERY_IMAGE_PATH)));
    });

  const loadAlbums = async ({ syncFromServer = false } = {}) => {
    const { folderAlbums, metaAlbums, galleryImages } = await loadAlbumsForAdmin();

    if (syncFromServer && folderAlbums.length > 0) {
      try {
        const imported = await importFoldersIfNeeded();
        if (imported?.status === 'success' && Array.isArray(imported.albums)) {
          const merged = mergeAlbumsFromWebsite(folderAlbums, imported.albums, galleryImages);
          setAlbums(merged);
          await loadImages();
          return merged;
        }
      } catch {
        /* use merged view without server sync */
      }
    }

    const merged = mergeAlbumsFromWebsite(folderAlbums, metaAlbums, galleryImages);
    setAlbums(merged);
    return merged;
  };

  const refreshAll = async ({ syncAlbums = false } = {}) => {
    await loadImages();
    await loadAlbums({ syncFromServer: syncAlbums });
  };

  useEffect(() => {
    refreshAll({ syncAlbums: false });
    const interval = setInterval(() => loadAlbums({ syncFromServer: false }), 10000);
    const onRefresh = () => refreshAll({ syncAlbums: false });
    window.addEventListener('gallery-admin-refresh', onRefresh);
    return () => {
      clearInterval(interval);
      window.removeEventListener('gallery-admin-refresh', onRefresh);
    };
  }, []);

  const groups = useMemo(
    () => buildAlbumImageGroups(images, albums, getAssetUrl).groups,
    [images, albums]
  );

  const totalInAlbums = useMemo(
    () => groups.reduce((sum, g) => sum + g.images.length, 0),
    [groups]
  );

  const removeImageFromAlbumState = (albumSlug, image) => {
    const imageId = image?.id != null ? String(image.id) : '';
    const filename = image?.filename || '';

    setAlbums((prev) =>
      prev.map((album) => {
        if (album.slug !== albumSlug) return album;
        const nextIds = (album.imageIds || []).filter((id) => {
          if (imageId && !imageId.startsWith('folder:') && String(id) === imageId) return false;
          if (!filename) return true;
          const match = images.find((im) => String(im.id) === String(id));
          return !match?.filename || match.filename !== filename;
        });
        const nextFolder = (album.folderImages || []).filter((fi) => !filename || fi.filename !== filename);
        let coverImageId = album.coverImageId;
        if (coverImageId && imageId && !imageId.startsWith('folder:') && String(coverImageId) === imageId) {
          coverImageId = nextIds[0] || null;
        }
        return { ...album, imageIds: nextIds, folderImages: nextFolder, coverImageId };
      })
    );

    if (editingAlbum?.slug === albumSlug) {
      setFormImageIds((prev) =>
        prev.filter((id) => {
          if (imageId && !imageId.startsWith('folder:') && id === imageId) return false;
          if (!filename) return true;
          const match = images.find((im) => String(im.id) === id);
          return !match?.filename || match.filename !== filename;
        })
      );
    }
  };

  const getCoverUrl = (album) => {
    const firstFolder = (album.folderImages || [])[0];
    if (!firstFolder) return null;
    if (firstFolder.url) {
      return firstFolder.url.startsWith('http') ? firstFolder.url : getAssetUrl(firstFolder.url);
    }
    return albumFileUrl(album.slug, firstFolder.filename, getAssetUrl);
  };

  const notifyGalleryUpdated = () => {
    localStorage.setItem('gallery-updated', Date.now().toString());
    window.dispatchEvent(new Event('gallery-updated'));
    setTimeout(() => localStorage.removeItem('gallery-updated'), 100);
  };

  const handleCreateAlbum = async (e) => {
    e.preventDefault();
    const name = formName.trim();
    if (!name) {
      setMessage('Album name is required.');
      setMessageType('error');
      return;
    }
    let slug = formSlug.trim();
    if (!slug) slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    setAlbumModalSaving(true);
    setMessage('');
    try {
      const res = await postForm({
        action: 'create_album',
        name,
        slug,
        description: formDescription.trim(),
      });
      const data = parseGalleryAdminResponse(res);
      if (data.status === 'success') {
        setMessage('Album created.');
        setMessageType('success');
        closeAlbumModal();
        await refreshAll({ syncAlbums: false });
        notifyGalleryUpdated();
        setTimeout(() => setMessage(''), 3000);
      } else {
        throw new Error(data.message || 'Failed to create album');
      }
    } catch (err) {
      setMessage('Error: ' + (err.message || 'Could not create album'));
      setMessageType('error');
    } finally {
      setAlbumModalSaving(false);
    }
  };

  const handleUpdateAlbum = async (e) => {
    e.preventDefault();
    if (!editingAlbum) return;
    const name = formName.trim();
    if (!name) {
      setMessage('Album name is required.');
      setMessageType('error');
      return;
    }
    setAlbumModalSaving(true);
    setMessage('');
    try {
      const res = await postForm({
        action: 'update_album',
        albumId: String(editingAlbum.id),
        name,
        slug: formSlug.trim() || editingAlbum.slug,
        description: formDescription.trim(),
        coverImageId: formCoverId || null,
        imageIds: JSON.stringify(formImageIds.length ? formImageIds : editingAlbum.imageIds || []),
      });
      const data = parseGalleryAdminResponse(res);
      if (data.status === 'success') {
        setMessage('Album updated.');
        setMessageType('success');
        closeAlbumModal();
        await refreshAll({ syncAlbums: false });
        notifyGalleryUpdated();
        setTimeout(() => setMessage(''), 3000);
      } else {
        throw new Error(data.message || 'Failed to update album');
      }
    } catch (err) {
      setMessage('Error: ' + (err.message || 'Could not update album'));
      setMessageType('error');
    } finally {
      setAlbumModalSaving(false);
    }
  };

  const handleDeleteAlbum = async (album) => {
    if (!confirm(`Delete album "${album.name}"? Photos stay in the gallery but are removed from this album.`)) return;
    setMessage('');
    try {
      const res = await postForm({ action: 'delete_album', albumId: album.id });
      const data = parseGalleryAdminResponse(res);
      if (data.status === 'success') {
        setMessage('Album deleted.');
        setMessageType('success');
        if (editingAlbum?.id === album.id) closeAlbumModal();
        await refreshAll({ syncAlbums: false });
        notifyGalleryUpdated();
        setTimeout(() => setMessage(''), 3000);
      } else {
        throw new Error(data.message || 'Failed to delete album');
      }
    } catch (err) {
      setMessage('Error: ' + (err.message || 'Could not delete album'));
      setMessageType('error');
    }
  };

  const closeAlbumModal = () => {
    if (albumModalSaving) return;
    setShowCreateForm(false);
    setEditingAlbum(null);
    setFormName('');
    setFormSlug('');
    setFormDescription('');
    setFormCoverId('');
    setFormImageIds([]);
  };

  const startEditAlbum = (album) => {
    setShowCreateForm(false);
    setEditingAlbum(album);
    setFormName(album.name || '');
    setFormSlug(album.slug || '');
    setFormDescription(album.description || '');
    setFormCoverId(album.coverImageId || '');
    setFormImageIds(Array.isArray(album.imageIds) ? album.imageIds.map(String) : []);
  };

  const openCreateAlbum = () => {
    setEditingAlbum(null);
    setShowCreateForm(true);
    setFormName('');
    setFormSlug('');
    setFormDescription('');
    setFormCoverId('');
    setFormImageIds([]);
  };

  const startEditImage = (image, album) => {
    const albumCategory = getCategoryForAlbum(album);
    const existing = Array.isArray(image.categories)
      ? image.categories
      : image.category && image.category !== 'All'
        ? [image.category]
        : [];
    const categories =
      existing.length > 0 ? existing : albumCategory ? [albumCategory] : [];
    setEditingImage(image);
    setEditingImageAlbum(album || null);
    setImageForm({ title: image.title || '', categories });
  };

  const closeEditImage = () => {
    setEditingImage(null);
    setEditingImageAlbum(null);
    setImageForm({ title: '', categories: [] });
  };

  const toggleImageCategory = (category) => {
    setImageForm((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  };

  const handleUpdateImage = async (e) => {
    e.preventDefault();
    if (!editingImage) return;
    if (!imageForm.categories.length) {
      setMessage('Select at least one category for this image.');
      setMessageType('error');
      return;
    }
    const isOldImage =
      editingImage.isOldImage ||
      editingImage.isFolderImage ||
      (typeof editingImage.id === 'string' &&
        (String(editingImage.id).startsWith('old-') || String(editingImage.id).startsWith('folder:')));
    try {
      const body: Record<string, string> = {
        categories: JSON.stringify(imageForm.categories),
        title: imageForm.title || '',
      };
      if (isOldImage || editingImage.isFolderImage) {
        body.action = 'update_old';
        body.filename = editingImage.filename;
      } else {
        body.action = 'update';
        body.imageId = editingImage.id;
      }
      const res = await postForm(body);
      const data = parseGalleryAdminResponse(res);
      if (data.status === 'success') {
        setMessage('Image updated.');
        setMessageType('success');
        closeEditImage();
        await refreshAll({ syncAlbums: false });
        notifyGalleryUpdated();
        setTimeout(() => setMessage(''), 3000);
      } else {
        throw new Error(data.message || 'Failed to update image');
      }
    } catch (err) {
      setMessage('Error: ' + (err.message || 'Could not update image'));
      setMessageType('error');
    }
  };

  const handleDeleteImage = async (image, albumSlug) => {
    const label = image.title || image.filename || 'this image';
    const slug = albumSlug || image.albumSlug;
    const fromAlbum = Boolean(slug);
    const msg = fromAlbum
      ? `Remove "${label}" from this album?`
      : `Delete "${label}" from the entire gallery?`;
    if (!confirm(msg)) return;
    try {
      const isFolderId = String(image.id || '').startsWith('folder:');
      const res = fromAlbum
        ? await postForm({
            action: 'delete_album_file',
            albumSlug: slug,
            filename: image.filename || '',
            imageId: !isFolderId && image.id != null ? String(image.id) : '',
          })
        : await postForm({ action: 'delete', imageId: String(image.id) });
      if (!res.ok) {
        throw new Error('Request failed');
      }
      const data = parseGalleryAdminResponse(res);
      if (data.status === 'success') {
        setMessage(fromAlbum ? 'Photo removed from album.' : 'Image deleted.');
        setMessageType('success');
        if (editingImage?.id === image.id) closeEditImage();
        if (fromAlbum) {
          removeImageFromAlbumState(slug, image);
        } else {
          const removedId = String(image.id);
          setImages((prev) => prev.filter((img) => String(img.id) !== removedId));
          setAlbums((prev) =>
            prev.map((album) => {
              const nextIds = (album.imageIds || []).filter((id) => String(id) !== removedId);
              return {
                ...album,
                imageIds: nextIds,
                folderImages: (album.folderImages || []).filter((fi) => fi.filename !== image.filename),
                coverImageId:
                  album.coverImageId && String(album.coverImageId) === removedId ? nextIds[0] || null : album.coverImageId,
              };
            })
          );
        }
        notifyGalleryUpdated();
        setTimeout(() => setMessage(''), 3000);
      } else {
        throw new Error(data.message || 'Failed to delete image');
      }
    } catch (err) {
      setMessage('Error: ' + (err.message || 'Could not delete image'));
      setMessageType('error');
    }
  };

  const renderAlbumModal = () => {
    const isCreate = showCreateForm && !editingAlbum;
    const isEdit = Boolean(editingAlbum);
    if (!isCreate && !isEdit) return null;

    const album = editingAlbum;
    const albumCategory = getCategoryForAlbum(
      isCreate ? { name: formName, slug: formSlug } : album
    );
    const folderCount = album?.folderImages?.length ?? 0;
    const coverOptions = (album?.folderImages || []).map((fi) => {
      const match = images.find((img) => img.filename === fi.filename);
      return {
        value: match?.id != null ? String(match.id) : '',
        label: fi.filename,
      };
    });

    return (
      <div
        className="gallery-edit-modal gallery-album-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="gallery-album-modal-title"
        onClick={(e) => e.target === e.currentTarget && closeAlbumModal()}
      >
        <div className="gallery-edit-modal-content gallery-album-modal-content">
          <div className="gallery-edit-modal-header">
            <h3 id="gallery-album-modal-title">{isCreate ? 'New album' : `Edit album: ${album.name}`}</h3>
            <button
              type="button"
              onClick={closeAlbumModal}
              className="gallery-edit-modal-close"
              aria-label="Close"
              disabled={albumModalSaving}
            >
              ×
            </button>
          </div>
          <div className="gallery-edit-modal-body">
            <form
              onSubmit={isCreate ? handleCreateAlbum : handleUpdateAlbum}
              className="gallery-edit-form gallery-album-modal-form"
            >
              {albumCategory && (
                <p className="gallery-album-modal-category-hint">
                  Gallery category for this album: <strong>{albumCategory}</strong>
                </p>
              )}
              <div className="gallery-edit-form-group">
                <label className="admin-label">Name</label>
                <input
                  type="text"
                  className="admin-input"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Album name"
                  required={isCreate}
                  disabled={albumModalSaving}
                />
              </div>
              <div className="gallery-edit-form-group">
                <label className="admin-label">Slug {isCreate ? '(optional)' : ''}</label>
                <input
                  type="text"
                  className="admin-input"
                  value={formSlug}
                  onChange={(e) => setFormSlug(e.target.value)}
                  placeholder="url-friendly slug"
                  disabled={albumModalSaving}
                />
              </div>
              <div className="gallery-edit-form-group">
                <label className="admin-label">Description</label>
                <p className="gallery-album-modal-category-hint">
                  Shown on the public gallery when visitors open this album.
                </p>
                <textarea
                  className="admin-input gallery-album-modal-description"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  rows={4}
                  placeholder="Describe this album for visitors…"
                  disabled={albumModalSaving}
                  aria-label="Album description"
                />
              </div>
              {isEdit && folderCount > 0 && (
                <>
                  <p className="gallery-album-modal-photo-count">
                    {folderCount} photo{folderCount !== 1 ? 's' : ''} on the website in this album.
                  </p>
                  {coverOptions.length > 0 && (
                    <div className="gallery-edit-form-group">
                      <label className="admin-label">Cover image (optional)</label>
                      <select
                        className="admin-input"
                        value={formCoverId}
                        onChange={(e) => setFormCoverId(e.target.value)}
                        disabled={albumModalSaving}
                      >
                        <option value="">— First photo in album —</option>
                        {coverOptions.map((opt) => (
                          <option key={opt.label} value={opt.value} disabled={!opt.value}>
                            {opt.label}
                            {!opt.value ? ' (folder only)' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </>
              )}
              <div className="gallery-edit-modal-buttons">
                <button type="button" onClick={closeAlbumModal} className="admin-btn--cancel" disabled={albumModalSaving}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn--save" disabled={albumModalSaving}>
                  {albumModalSaving ? 'Saving…' : isCreate ? 'Create album' : 'Save album'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  const renderImageCard = (image, album) => {
    const slug = album?.slug || '';
    return (
      <article key={image.id} className="gallery-library-image-card">
        <div className="gallery-library-image-card-thumb">
          <img
            src={
              albumFileUrl(slug, image.filename, getAssetUrl) ||
              image.url ||
              getAssetUrl(`${GALLERY_IMAGE_PATH}/${image.filename}`)
            }
            alt={image.title || image.filename || 'Gallery image'}
            loading="lazy"
          />
          <div className="gallery-library-image-card-overlay">
            <button type="button" className="gallery-admin-btn gallery-admin-btn--light" onClick={() => startEditImage(image, album)}>
              Edit
            </button>
            <button type="button" className="gallery-admin-btn gallery-admin-btn--danger" onClick={() => handleDeleteImage(image, slug)}>
              Delete
            </button>
          </div>
        </div>
        <div className="gallery-library-image-card-caption">
          <span className="gallery-library-image-card-title" title={image.title || image.filename}>
            {image.title || image.filename || 'Untitled'}
          </span>
          <span className="gallery-library-image-card-meta">{getImageCategoriesLabel(image, album)}</span>
        </div>
      </article>
    );
  };

  const renderAlbumSection = (album, albumImages) => {
    const cover = getCoverUrl(album);
    const count = albumImages.length;

    return (
      <details key={album.id} className="gallery-library-group" open>
        <summary className="gallery-library-group-header">
          <div className="gallery-library-group-heading">
            {cover ? (
              <span className="gallery-library-group-cover">
                <img src={cover} alt="" />
              </span>
            ) : (
              <span className="gallery-library-group-cover gallery-library-group-cover--empty" aria-hidden>
                📁
              </span>
            )}
            <div>
              <h3 className="gallery-library-group-title">{album.name}</h3>
              <p className="gallery-library-group-count">
                {count} photo{count !== 1 ? 's' : ''}
                {album.slug ? ` · ${album.slug}` : ''}
              </p>
            </div>
          </div>
          <div
            className="gallery-library-group-actions"
            onClick={(e) => e.preventDefault()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <button type="button" className="gallery-admin-btn gallery-admin-btn--outline" onClick={() => startEditAlbum(album)}>
              Edit
            </button>
            <button type="button" className="gallery-admin-btn gallery-admin-btn--danger-outline" onClick={() => handleDeleteAlbum(album)}>
              Delete
            </button>
          </div>
        </summary>
        <div className="gallery-library-group-body">
          {count > 0 ? (
            <div className="gallery-library-images-grid">
              {albumImages.map((img) => renderImageCard(img, album))}
            </div>
          ) : (
            <p className="gallery-library-group-empty">No photos yet. Use Edit to assign images to this album.</p>
          )}
        </div>
      </details>
    );
  };

  return (
    <div className={`gallery-album-admin gallery-library-admin ${embedded ? 'gallery-album-admin--embedded' : ''}`}>
      <div className="gallery-admin-stats">
        <div className="gallery-admin-stat">
          <span className="gallery-admin-stat-value">{images.length}</span>
          <span className="gallery-admin-stat-label">Total images</span>
        </div>
        <div className="gallery-admin-stat">
          <span className="gallery-admin-stat-value">{albums.length}</span>
          <span className="gallery-admin-stat-label">Albums</span>
        </div>
        <div className="gallery-admin-stat">
          <span className="gallery-admin-stat-value">{totalInAlbums}</span>
          <span className="gallery-admin-stat-label">In albums</span>
        </div>
      </div>

      {message && (
        <div
          className={`gallery-admin-toast gallery-admin-toast--${messageType === 'success' ? 'success' : 'error'}`}
          role="status"
        >
          {message}
        </div>
      )}

      <div className="gallery-admin-toolbar">
        {onOpenUpload && (
          <button type="button" className="gallery-admin-btn gallery-admin-btn--primary" onClick={onOpenUpload}>
            Upload photos
          </button>
        )}
        <button
          type="button"
          className="gallery-admin-btn gallery-admin-btn--secondary"
          onClick={openCreateAlbum}
        >
          + New album
        </button>
        <button
          type="button"
          className="gallery-admin-btn gallery-admin-btn--secondary"
          onClick={async () => {
            setMessage('Syncing albums from website list…');
            setMessageType('');
            const data = await importFoldersIfNeeded();
            if (data?.status === 'success') {
              setMessage(data.message || 'Albums synced from website.');
              setMessageType('success');
              await refreshAll({ syncAlbums: true });
            } else {
              setMessage('Could not sync albums from website.');
              setMessageType('error');
            }
            setTimeout(() => setMessage(''), 4000);
          }}
        >
          Sync from website
        </button>
        <button type="button" className="gallery-admin-btn gallery-admin-btn--ghost" onClick={() => refreshAll({ syncAlbums: false })}>
          Refresh
        </button>
      </div>

      {renderAlbumModal()}

      <div className="gallery-library-groups">
        {groups.map(({ album, images: albumImages }) => renderAlbumSection(album, albumImages))}
      </div>

      {groups.length === 0 && (
        <div className="gallery-admin-empty">
          <span className="gallery-admin-empty-icon" aria-hidden>
            🖼
          </span>
          <h3>No albums yet</h3>
          <p>Sync from your live gallery or create a new album to get started.</p>
          <button
            type="button"
            className="gallery-admin-btn gallery-admin-btn--primary"
            onClick={async () => {
              setMessage('Syncing…');
              const data = await importFoldersIfNeeded();
              if (data?.status === 'success') {
                await refreshAll({ syncAlbums: true });
                setMessage('Albums loaded.');
                setMessageType('success');
              }
              setTimeout(() => setMessage(''), 3000);
            }}
          >
            Sync from website
          </button>
        </div>
      )}

      {editingImage && (
        <div className="gallery-edit-modal" role="dialog" aria-modal="true" aria-labelledby="gallery-edit-image-title">
          <div className="gallery-edit-modal-content">
            <div className="gallery-edit-modal-header">
              <h3 id="gallery-edit-image-title">Edit image</h3>
              <button type="button" onClick={closeEditImage} className="gallery-edit-modal-close" aria-label="Close">
                ×
              </button>
            </div>
            <div className="gallery-edit-modal-body">
              <div className="gallery-edit-image-preview">
                <img
                  src={
                    albumFileUrl(editingImage.albumSlug, editingImage.filename, getAssetUrl) ||
                    editingImage.url ||
                    getAssetUrl(`${GALLERY_IMAGE_PATH}/${editingImage.filename}`)
                  }
                  alt={editingImage.title || 'Gallery image'}
                />
              </div>
              <form onSubmit={handleUpdateImage} className="gallery-edit-form">
                <div className="gallery-edit-form-group">
                  <label className="admin-label">Title (optional)</label>
                  <input
                    type="text"
                    className="admin-input"
                    value={imageForm.title}
                    onChange={(e) => setImageForm((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Image title"
                  />
                </div>
                <div className="gallery-edit-form-group">
                  <label className="admin-label">
                    Categories *
                    {editingImageAlbum && getCategoryForAlbum(editingImageAlbum) && (
                      <span className="gallery-album-modal-category-hint gallery-album-modal-category-hint--inline">
                        {' '}
                        (album: {getCategoryForAlbum(editingImageAlbum)})
                      </span>
                    )}
                  </label>
                  <div className="admin-gallery-category-checkboxes">
                    {(editingImageAlbum
                      ? getCategoriesForAlbumEditor(editingImageAlbum)
                      : GALLERY_CATEGORIES
                    ).map((cat) => (
                      <label key={cat} className="admin-gallery-category-checkbox-label">
                        <input
                          type="checkbox"
                          checked={imageForm.categories.includes(cat)}
                          onChange={() => toggleImageCategory(cat)}
                        />
                        <span>{cat}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="gallery-edit-modal-buttons">
                  <button type="button" onClick={closeEditImage} className="admin-btn--cancel">
                    Cancel
                  </button>
                  <button type="submit" className="admin-btn--save" disabled={!imageForm.categories.length}>
                    Save changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GalleryAlbumAdmin;
