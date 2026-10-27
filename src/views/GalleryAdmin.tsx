'use client';

import { submitAdminLogin } from '@/src/utils/adminAuth';
import { useState, useEffect } from 'react';
import { loadGalleryImagesFromJson, loadAlbumsForAdmin, getAssetUrl, GALLERY_JSON_PATH, GALLERY_IMAGE_PATH } from '../utils/galleryData';
import { getGalleryAdminApiUrl, parseGalleryAdminResponse } from '../utils/galleryAdminApi';
import {
  getCategoryForAlbum,
  getCategoriesForAlbumEditor,
  GALLERY_CATEGORIES,
} from '../utils/galleryAdminGroups';

function GalleryAdmin({
  embedded = false,
  onLogout,
  uploadOnly = false,
  uploadModalOpen = false,
  onUploadModalClose,
  onUploaded,
}) {
  // Set body background on mount
  useEffect(() => {
    if (embedded) {
      setIsLoggedIn(true);
      return undefined;
    }
    document.body.style.backgroundColor = '#f5f5f5';
    document.body.style.minHeight = '100vh';
    if (localStorage.getItem('kiteGalleryAdmin') === 'true') {
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
  const [images, setImages] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [recentlyUpdatedIds, setRecentlyUpdatedIds] = useState(new Set());
  const [formData, setFormData] = useState({
    categories: [],
    title: '',
    albumSlug: '',
  });
  const [albumOptions, setAlbumOptions] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ done: 0, total: 0 });
  const [internalUploadOpen, setInternalUploadOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const isUploadOpen = uploadModalOpen || internalUploadOpen;

  useEffect(() => {
    if (!isUploadOpen) return;
    loadAlbumsForAdmin()
      .then(({ folderAlbums }) => {
        setAlbumOptions(Array.isArray(folderAlbums) ? folderAlbums : []);
      })
      .catch(() => setAlbumOptions([]));
  }, [isUploadOpen]);

  // Load existing images and initialize JSON if empty
  useEffect(() => {
    // First check if JSON is empty and initialize if needed
    fetch(getAssetUrl(GALLERY_JSON_PATH) + `?t=${Date.now()}`, {
      cache: 'no-cache',
      headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
    })
      .then(response => response.json())
      .then(data => {
        // If JSON is empty or only has empty array, initialize it
        if (!Array.isArray(data) || data.length === 0) {
          console.log('Gallery JSON is empty, initializing with existing images...');
          return fetch('/api/gallery-admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'action=init'
          })
            .then(response => response.json())
            .then(result => {
              if (result.status === 'success') {
                console.log('✅ Initialized gallery-images.json with', result.count, 'images');
                // Reload images after initialization
                setTimeout(() => {
                  loadImages();
                }, 500);
              }
            })
            .catch(error => {
              console.error('Error initializing gallery images:', error);
              // Still load images (will use fallback)
              loadImages();
            });
        } else {
          // JSON has data, just load normally
          loadImages();
        }
      })
      .catch(error => {
        console.error('Error checking gallery JSON:', error);
        // Try to initialize anyway
        fetch('/api/gallery-admin', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: 'action=init'
        })
          .then(response => response.json())
          .then(result => {
            if (result.status === 'success') {
              console.log('✅ Initialized gallery-images.json with', result.count, 'images');
              setTimeout(() => loadImages(), 500);
            }
          })
          .catch(err => {
            console.error('Error initializing:', err);
            loadImages(); // Load with fallback
          });
      });
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
        localStorage.setItem('kiteGalleryAdmin', 'true');
        localStorage.setItem('kiteUnifiedAdmin', 'true');
        localStorage.setItem('kiteAdminUser', normalizedUsername || 'Admin');
      }
      window.dispatchEvent(new Event('adminAuthChanged'));
      setLoginError(false);
    } else {
      setLoginError(true);
    }
  };

  // Load images from JSON file (shared with Gallery page)
  const loadImages = () => {
    return loadGalleryImagesFromJson()
      .then((allImages) => {
        setImages(allImages);
        if (allImages.length > 0) {
          const newCount = allImages.filter((i) => !i.isOldImage).length;
          const oldCount = allImages.filter((i) => i.isOldImage).length;
          console.log('✅ Loaded images from gallery-images.json:', {
            total: allImages.length,
            new: newCount,
            old: oldCount,
            jsonPath: getAssetUrl(GALLERY_JSON_PATH),
            sampleImage: allImages[0] ? {
              id: allImages[0].id,
              filename: allImages[0].filename,
              categories: allImages[0].categories
            } : null
          });
        }
      })
      .catch((error) => {
        console.error('❌ Error loading gallery-images.json:', error);
        setImages([]);
        console.log('⚠️ Gallery JSON not available. Run PHP server for admin or initialize from admin.');
      });
  };

  const revokeFilePreviews = (files) => {
    (files || []).forEach((item) => {
      if (item?.previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(item.previewUrl);
      }
    });
  };

  const handleFileChange = (e) => {
    const picked = Array.from(e.target.files || []).filter((f): f is File => f instanceof File && f.type.startsWith('image/'));
    if (!picked.length) return;
    setMessage('');
    const newItems = picked.map((file) => ({
      id: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2)}`,
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    setSelectedFiles((prev) => [...prev, ...newItems]);
    e.target.value = '';
  };

  const removeSelectedFile = (id) => {
    setSelectedFiles((prev) => {
      const item = prev.find((f) => f.id === id);
      if (item?.previewUrl?.startsWith('blob:')) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((f) => f.id !== id);
    });
  };

  const uploadOneFile = async (file, title) => {
    const formDataUpload = new FormData();
    const fileName = file.name || `gallery-${Date.now()}.jpg`;
    formDataUpload.append('image', file, fileName);
    formDataUpload.append('categories', JSON.stringify(formData.categories));
    formDataUpload.append('title', title || formData.title || file.name || 'Gallery Image');
    formDataUpload.append('action', 'upload');
    if (formData.albumSlug) {
      formDataUpload.append('albumSlug', formData.albumSlug);
    }
    const response = await fetch(getGalleryAdminApiUrl(), {
      method: 'POST',
      body: formDataUpload,
    });
    const text = await response.text();
    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }
    const result = parseGalleryAdminResponse({ ok: response.ok, text });
    if (result.status !== 'success') {
      throw new Error(result.message || 'Failed to upload image');
    }
    return result;
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFiles.length) {
      setMessage('Please select one or more images to upload.');
      setMessageType('error');
      return;
    }
    if (!formData.albumSlug && albumOptions.length > 0) {
      setMessage('Please select an album for these photos.');
      setMessageType('error');
      return;
    }
    if (!formData.categories?.length) {
      setMessage('Please select at least one category.');
      setMessageType('error');
      return;
    }

    setUploading(true);
    setUploadProgress({ done: 0, total: selectedFiles.length });
    setMessage('');
    let successCount = 0;
    const failures = [];

    try {
      for (let i = 0; i < selectedFiles.length; i += 1) {
        const { file } = selectedFiles[i];
        setUploadProgress({ done: i, total: selectedFiles.length });
        setMessage(`Uploading ${i + 1} of ${selectedFiles.length}…`);
        setMessageType('');
        try {
          await uploadOneFile(file, selectedFiles.length === 1 ? formData.title : file.name);
          successCount += 1;
        } catch (err) {
          failures.push(`${file.name}: ${err.message || 'upload failed'}`);
        }
      }
      setUploadProgress({ done: selectedFiles.length, total: selectedFiles.length });

      if (successCount > 0) {
        await loadImages();
        localStorage.setItem('gallery-updated', Date.now().toString());
        window.dispatchEvent(new Event('gallery-updated'));
        window.dispatchEvent(new Event('gallery-admin-refresh'));
      }

      if (failures.length === 0) {
        setMessage(
          successCount === 1
            ? 'Image uploaded successfully!'
            : `${successCount} images uploaded successfully!`
        );
        setMessageType('success');
        setTimeout(() => {
          resetForm();
          onUploaded?.();
          onUploadModalClose?.();
        }, 800);
      } else if (successCount > 0) {
        setMessage(`${successCount} uploaded. ${failures.length} failed: ${failures[0]}`);
        setMessageType('error');
        revokeFilePreviews(selectedFiles);
        setSelectedFiles([]);
      } else {
        throw new Error(failures[0] || 'Could not upload images');
      }
    } catch (error) {
      setMessage('Error: ' + (error.message || 'Could not upload images'));
      setMessageType('error');
    } finally {
      setUploading(false);
      setUploadProgress({ done: 0, total: 0 });
    }
  };

  const closeUploadModal = () => {
    if (uploading) return;
    resetForm();
    setInternalUploadOpen(false);
    onUploadModalClose?.();
  };

  // Handle edit - open modal
  const handleEdit = (image) => {
    setIsEditing(true);
    setEditingId(image.id);
    // Convert category to array if it's a string (backwards compatibility)
    const imageCategories = Array.isArray(image.categories) 
      ? image.categories 
      : (image.category ? (image.category === 'All' ? [] : [image.category]) : []);
    setFormData({
      categories: imageCategories,
      title: image.title || '',
      albumSlug: image.albumSlug || '',
    });
    setShowEditModal(true);
  };

  // Handle update
  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage('');
    setMessageType('');

    // Validate categories
    if (!formData.categories || formData.categories.length === 0) {
      setMessage('❌ Please select at least one category');
      setMessageType('error');
      return;
    }

    const editingImage = images.find(img => img.id === editingId);
    
    console.log('Updating image:', {
      id: editingId,
      title: formData.title,
      categories: formData.categories,
      isOldImage: editingImage?.isOldImage,
      filename: editingImage?.filename
    });
    
    if (!editingImage) {
      setMessage('❌ Error: Image not found');
      setMessageType('error');
      return;
    }

    // Check if it's an old image by checking if ID starts with 'old-' or if isOldImage flag exists
    const isOldImage = editingImage.isOldImage || (typeof editingId === 'string' && editingId.startsWith('old-'));

    try {
      // For old images, we need to create/update metadata entry in JSON
      // For new images, use regular update
      const formBody = new URLSearchParams();
      if (isOldImage) {
        // For old images, use update_old action which will create/update metadata entry
        formBody.append('action', 'update_old');
        formBody.append('filename', editingImage.filename);
      } else {
        formBody.append('action', 'update');
        // Ensure imageId is a number for new images
        formBody.append('imageId', parseInt(editingId) || editingId);
      }
      formBody.append('categories', JSON.stringify(formData.categories || []));
      formBody.append('title', formData.title || '');

      const formDataString = formBody.toString();
      console.log('Sending update request:', {
        url: '/api/gallery-admin',
        body: formDataString,
        action: isOldImage ? 'update_old' : 'update',
        imageId: editingId
      });

      const response = await fetch('/api/gallery-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formDataString
      });

      // Check if response is ok first
      if (!response.ok) {
        const text = await response.text();
        console.error('Server error response:', text);
        throw new Error(`Server error: ${response.status} - ${text}`);
      }

      let result;
      let responseText = '';
      try {
        responseText = await response.text();
        console.log('Update response:', responseText);
        result = JSON.parse(responseText);
        console.log('Parsed result:', result);
      } catch (parseError) {
        console.error('Response parse error:', parseError, 'Response text:', responseText);
        throw new Error('Invalid JSON response: ' + parseError.message + (responseText ? ' | Response: ' + responseText : ''));
      }

      if (result.status === 'success') {
        console.log('✅ Update successful:', result);
        setMessage('✅ Image updated successfully!');
        setMessageType('success');
        
        // Add to recently updated set
        if (editingId) {
          setRecentlyUpdatedIds(prev => new Set([...prev, editingId]));
          // Remove badge after 5 seconds
          setTimeout(() => {
            setRecentlyUpdatedIds(prev => {
              const next = new Set(prev);
              next.delete(editingId);
              return next;
            });
          }, 5000);
        }
        
        // Trigger storage event for real-time updates in gallery page immediately
        localStorage.setItem('gallery-updated', Date.now().toString());
        // Also dispatch custom event for same-tab updates
        window.dispatchEvent(new Event('gallery-updated'));
        
        // Reload images immediately with cache-busting (reduced delay for real-time update)
        setTimeout(() => {
          loadImages();
          localStorage.removeItem('gallery-updated');
        }, 300);
        
        // Close modal and reset after showing success message
        setTimeout(() => {
          setShowEditModal(false);
          resetForm();
          setMessage('');
        }, 1500);
      } else {
        throw new Error(result.message || 'Failed to update image');
      }
    } catch (error) {
      console.error('Update error:', error);
      setMessage('❌ Error: ' + error.message);
      setMessageType('error');
      
      if (error.message === 'Failed to fetch' || error.message.includes('Invalid JSON')) {
        // Dev mode: update local state
        const updatedImages = images.map(img => 
          img.id === editingId 
            ? { ...img, categories: formData.categories || [], title: formData.title }
            : img
        );
        setImages(updatedImages);
        setMessage('⚠️ DEV MODE: Image updated locally (Backend not connected)');
        setMessageType('success');
        setTimeout(() => {
          setShowEditModal(false);
          resetForm();
          setMessage('');
        }, 2000);
      }
      
      // Clear error message after 5 seconds
      setTimeout(() => {
        setMessage('');
      }, 5000);
    }
  };

  // Handle category toggle for individual image
  const handleCategoryToggle = async (imageId, category) => {
    const image = images.find(img => img.id === imageId);
    if (!image) return;

    // Get current categories (handle both array and string for backwards compatibility)
    const currentCategories = Array.isArray(image.categories) 
      ? image.categories 
      : (image.category ? (image.category === 'All' ? [] : [image.category]) : []);
    
    // Toggle category
    const newCategories = currentCategories.includes(category)
      ? currentCategories.filter(cat => cat !== category)
      : [...currentCategories, category];

    const isOldImage = image.isOldImage;

    try {
      const formBody = new URLSearchParams();
      if (isOldImage) {
        formBody.append('action', 'update_old');
        formBody.append('filename', image.filename);
      } else {
        formBody.append('action', 'update');
        formBody.append('imageId', imageId);
      }
      formBody.append('categories', JSON.stringify(newCategories));
      formBody.append('title', image.title || '');

      const response = await fetch('/api/gallery-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formBody.toString()
      });

      // Read response text once
      const text = await response.text();
      
      // Check if response is ok
      if (!response.ok) {
        throw new Error(`Server error: ${response.status} - ${text}`);
      }

      let result;
      try {
        result = JSON.parse(text);
      } catch (parseError) {
        console.error('Parse error:', parseError, 'Response text:', text);
        throw new Error('Invalid JSON response');
      }

      if (result.status === 'success') {
        console.log('✅ Categories updated successfully');
        
        // Add to recently updated set
        setRecentlyUpdatedIds(prev => new Set([...prev, imageId]));
        // Remove badge after 5 seconds
        setTimeout(() => {
          setRecentlyUpdatedIds(prev => {
            const next = new Set(prev);
            next.delete(imageId);
            return next;
          });
        }, 5000);
        
        // Trigger storage event for real-time updates in gallery page immediately
        localStorage.setItem('gallery-updated', Date.now().toString());
        // Also dispatch custom event for same-tab updates
        window.dispatchEvent(new Event('gallery-updated'));
        // Reload images immediately with cache-busting
        setTimeout(() => {
          loadImages();
          localStorage.removeItem('gallery-updated');
        }, 300);
      } else {
        throw new Error(result.message || 'Failed to update categories');
      }
    } catch (error) {
      console.error('Category toggle error:', error);
      if (error.message === 'Failed to fetch' || error.message === 'Invalid JSON response' || error.message.includes('Server error')) {
        // Dev mode: update local state
        const updatedImages = images.map(img => 
          img.id === imageId 
            ? { ...img, categories: newCategories }
            : img
        );
        setImages(updatedImages);
      } else {
        // Show error message for other errors
        alert('Error updating category: ' + error.message);
      }
    }
  };

  // Handle delete
  const handleDelete = async (imageId) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      const formBody = new URLSearchParams();
      formBody.append('action', 'delete');
      formBody.append('imageId', String(imageId));

      const response = await fetch('/api/gallery-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formBody.toString()
      });

      // Read response text once
      const text = await response.text();
      
      // Check if response is ok
      if (!response.ok) {
        throw new Error(`Server error: ${response.status} - ${text}`);
      }

      let result;
      try {
        result = JSON.parse(text);
      } catch (parseError) {
        console.error('Parse error:', parseError, 'Response text:', text);
        throw new Error('Invalid JSON response');
      }

      if (result.status === 'success') {
        setMessage('Image deleted successfully!');
        setMessageType('success');
        loadImages();
        localStorage.setItem('gallery-updated', Date.now().toString());
        localStorage.removeItem('gallery-updated');
        setTimeout(() => setMessage(''), 3000);
      } else {
        throw new Error(result.message || 'Failed to delete image');
      }
    } catch (error) {
      console.error('Delete error:', error);
      const errMsg = error.message || '';
      if (errMsg === 'Failed to fetch' || errMsg === 'Invalid JSON response' || errMsg.includes('Server error')) {
        const filteredImages = images.filter(img => String(img.id) !== String(imageId));
        setImages(filteredImages);
        setMessage('⚠️ Backend not reached. Image removed from list only. Run with PHP or npm run dev so delete is saved.');
        setMessageType('success');
        setTimeout(() => setMessage(''), 5000);
      } else {
        setMessage('Delete failed: ' + errMsg);
        setMessageType('error');
      }
    }
  };

  // Reset form
  const resetForm = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      categories: [],
      title: '',
      albumSlug: '',
    });
    setSelectedFiles((prev) => {
      revokeFilePreviews(prev);
      return [];
    });
    setUploading(false);
    setUploadProgress({ done: 0, total: 0 });
    const fileInput = document.querySelector<HTMLInputElement>('.gallery-upload-modal input[type="file"]');
    if (fileInput) fileInput.value = '';
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFormCategoryToggle = (category) => {
    setFormData((prev) => {
      const currentCategories = prev.categories || [];
      const newCategories = currentCategories.includes(category)
        ? currentCategories.filter((cat) => cat !== category)
        : [...currentCategories, category];
      return { ...prev, categories: newCategories };
    });
  };

  const handleAlbumSlugChange = (slug) => {
    const album = albumOptions.find((a) => a.slug === slug);
    const albumCategory = getCategoryForAlbum(album);
    setFormData((prev) => ({
      ...prev,
      albumSlug: slug,
      categories: albumCategory ? [albumCategory] : prev.categories,
    }));
  };

  const selectedUploadAlbum = albumOptions.find((a) => a.slug === formData.albumSlug);
  const uploadCategoryChoices = selectedUploadAlbum
    ? getCategoriesForAlbumEditor(selectedUploadAlbum)
    : GALLERY_CATEGORIES;

  const renderUploadModal = () => (
    <div
      className="gallery-edit-modal gallery-upload-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="gallery-upload-title"
      onClick={(e) => e.target === e.currentTarget && closeUploadModal()}
    >
      <div className="gallery-edit-modal-content gallery-upload-modal-content">
        <div className="gallery-edit-modal-header">
          <h3 id="gallery-upload-title">Upload photos</h3>
          <button
            type="button"
            onClick={closeUploadModal}
            className="gallery-edit-modal-close"
            aria-label="Close"
            disabled={uploading}
          >
            ×
          </button>
        </div>
        <div className="gallery-edit-modal-body">
          <form onSubmit={handleUploadSubmit} className="gallery-edit-form gallery-upload-form">
            <div className="gallery-edit-form-group">
              <label className="admin-label">Select images</label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                multiple
                onChange={handleFileChange}
                className="admin-input admin-input--file"
                disabled={uploading}
              />
              <p className="gallery-upload-file-hint">You can choose multiple photos at once (JPG, PNG, GIF, WebP).</p>
            </div>
            {selectedFiles.length > 0 && (
              <div className="gallery-upload-preview-grid-wrap">
                <p className="gallery-upload-preview-count">
                  {selectedFiles.length} image{selectedFiles.length !== 1 ? 's' : ''} selected
                </p>
                <ul className="gallery-upload-preview-grid">
                  {selectedFiles.map((item) => (
                    <li key={item.id} className="gallery-upload-preview-item">
                      <img src={item.previewUrl} alt="" />
                      <button
                        type="button"
                        className="gallery-upload-preview-remove"
                        onClick={() => removeSelectedFile(item.id)}
                        disabled={uploading}
                        aria-label={`Remove ${item.file.name}`}
                      >
                        ×
                      </button>
                      <span className="gallery-upload-preview-name" title={item.file.name}>
                        {item.file.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="gallery-edit-form-group">
              <label className="admin-label">
                Album <span className="gallery-upload-required">*</span>
              </label>
              {albumOptions.length === 0 ? (
                <p className="gallery-upload-album-empty">Loading albums…</p>
              ) : (
                <select
                  className="admin-input"
                  value={formData.albumSlug}
                  onChange={(e) => handleAlbumSlugChange(e.target.value)}
                  disabled={uploading}
                  required
                >
                  <option value="">— Select album —</option>
                  {albumOptions.map((alb) => (
                    <option key={alb.slug} value={alb.slug}>
                      {alb.name}
                      {alb.slug ? ` (${alb.slug})` : ''}
                    </option>
                  ))}
                </select>
              )}
              {selectedUploadAlbum && getCategoryForAlbum(selectedUploadAlbum) && (
                <p className="gallery-album-modal-category-hint gallery-album-modal-category-hint--compact">
                  Category for this album: <strong>{getCategoryForAlbum(selectedUploadAlbum)}</strong>
                </p>
              )}
            </div>
            <div className="gallery-edit-form-group">
              <label className="admin-label">Title (optional)</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="admin-input"
                placeholder="Image title or description"
                disabled={uploading}
              />
            </div>
            <div className="gallery-edit-form-group">
              <label className="admin-label">
                Categories <span className="gallery-upload-required">*</span>
              </label>
              <div className="admin-gallery-category-checkboxes">
                {uploadCategoryChoices.map((cat) => (
                  <label key={cat} className="admin-gallery-category-checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.categories.includes(cat)}
                      onChange={() => handleFormCategoryToggle(cat)}
                      disabled={uploading}
                    />
                    <span>{cat}</span>
                  </label>
                ))}
              </div>
            </div>
            {message && (
              <div
                className={`gallery-edit-message ${messageType === 'success' ? 'gallery-edit-message--success' : 'gallery-edit-message--error'}`}
              >
                {message}
              </div>
            )}
            <div className="gallery-edit-modal-buttons">
              <button type="button" onClick={closeUploadModal} className="admin-btn--cancel" disabled={uploading}>
                Cancel
              </button>
              <button
                type="submit"
                className="admin-btn--save"
                disabled={
                  uploading ||
                  !selectedFiles.length ||
                  !formData.categories.length ||
                  (albumOptions.length > 0 && !formData.albumSlug)
                }
              >
                {uploading
                  ? uploadProgress.total > 0
                    ? `Uploading ${Math.min(uploadProgress.done + 1, uploadProgress.total)}/${uploadProgress.total}…`
                    : 'Uploading…'
                  : selectedFiles.length > 1
                    ? `Upload ${selectedFiles.length} photos`
                    : 'Upload'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  if (!embedded && !isLoggedIn) {
    return (
      <div className="admin-login-page">
        <div className="admin-login-card">
          <h2>Gallery Admin</h2>
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
        </div>
      </div>
    );
  }

  if (embedded && isUploadOpen) {
    return renderUploadModal();
  }

  if (embedded) {
    return null;
  }

  return (
    <div className="admin-content">
      {isUploadOpen && renderUploadModal()}

      {/* Edit Modal */}
      {showEditModal && isEditing && (() => {
        const editingImage = images.find(img => img.id === editingId);
        if (!editingImage) return null;
        
        return (
          <div className="gallery-edit-modal">
            <div className="gallery-edit-modal-content">
              <div className="gallery-edit-modal-header">
                <h3>Edit Image</h3>
                <button type="button" onClick={resetForm} className="gallery-edit-modal-close">×</button>
              </div>
              
              <div className="gallery-edit-modal-body">
                <div className="gallery-edit-image-preview">
                  <img 
                    src={editingImage.url || getAssetUrl(`${GALLERY_IMAGE_PATH}/${editingImage.filename}`)} 
                    alt={editingImage.title || 'Gallery Image'}
                  />
                </div>
                
                <form onSubmit={handleUpdate} className="gallery-edit-form">
                  <div className="gallery-edit-form-group">
                    <label className="admin-label">Title (Optional)</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="admin-input"
                      placeholder="Image title or description"
                    />
                  </div>

                  <div className="gallery-edit-form-group">
                    <label className="admin-label">
                      Categories <span style={{ color: '#e74c3c' }}>*</span>
                      {formData.categories.length === 0 && (
                        <span style={{ color: '#e74c3c', fontSize: '12px', marginLeft: '10px' }}>
                          (Select at least one)
                        </span>
                      )}
                    </label>
                    <div className="admin-gallery-category-checkboxes">
                      {uploadCategoryChoices.map(cat => (
                        <label key={cat} className="admin-gallery-category-checkbox-label">
                          <input
                            type="checkbox"
                            checked={formData.categories.includes(cat)}
                            onChange={() => {
                              const newCategories = formData.categories.includes(cat)
                                ? formData.categories.filter(c => c !== cat)
                                : [...formData.categories, cat];
                              setFormData({ ...formData, categories: newCategories });
                            }}
                          />
                          <span>{cat}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="gallery-edit-modal-buttons">
                    <button type="button" onClick={resetForm} className="admin-btn--cancel">
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="admin-btn--save"
                      disabled={formData.categories.length === 0}
                      style={{ 
                        opacity: formData.categories.length === 0 ? 0.5 : 1, 
                        cursor: formData.categories.length === 0 ? 'not-allowed' : 'pointer' 
                      }}
                    >
                      Save Changes
                    </button>
                  </div>
                  
                  {/* Success/Error Message */}
                  {message && (
                    <div className={`gallery-edit-message ${messageType === 'success' ? 'gallery-edit-message--success' : 'gallery-edit-message--error'}`}>
                      {message}
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        );
      })()}

      <div className="admin-container admin-container--flex">
        <div className="gallery-admin-upload-toolbar">
          <button
            type="button"
            className="gallery-admin-btn gallery-admin-btn--primary"
            onClick={() => setInternalUploadOpen(true)}
          >
            Upload photo
          </button>
        </div>

        <div className="admin-posts-section">
          <h2>All Images ({images.length})</h2>
          
          {images.length === 0 ? (
            <p className="admin-posts-empty">No images yet. Upload your first image!</p>
          ) : (
            <div className="admin-gallery-grid">
              {images.map((image) => (
                <div 
                  key={image.id} 
                  className={`admin-gallery-card ${editingId === image.id ? 'admin-gallery-card--editing' : ''}`}
                >
                  <div className="admin-gallery-image">
                    <img 
                      src={image.url || getAssetUrl(`${GALLERY_IMAGE_PATH}/${image.filename}`)} 
                      alt={image.title || 'Gallery Image'}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = getAssetUrl('images/placeholder.jpg');
                      }}
                    />
                  </div>
                  <div className="admin-gallery-info">
                    <h4 title={image.title || 'Untitled'}>
                      <span>{image.title || 'Untitled'}</span>
                      {recentlyUpdatedIds.has(image.id) && (
                        <span className="admin-gallery-updated-badge">Recently Updated</span>
                      )}
                    </h4>
                    <div className="admin-gallery-meta">
                      {image.uploadDate && (
                        <small>{new Date(image.uploadDate).toLocaleDateString()}</small>
                      )}
                    </div>
                    <div className="admin-gallery-category-display">
                      {(() => {
                        const imageCategories = Array.isArray(image.categories) 
                          ? image.categories 
                          : (image.category ? (image.category === 'All' ? [] : [image.category]) : []);
                        return imageCategories.length > 0 ? (
                          <div className="admin-gallery-categories-list">
                            {imageCategories.map(cat => (
                              <span key={cat} className="admin-gallery-category-badge">{cat}</span>
                            ))}
                          </div>
                        ) : (
                          <span className="admin-gallery-no-category">No categories</span>
                        );
                      })()}
                    </div>
                    <div className="admin-post-actions">
                      <button onClick={() => handleEdit(image)} className="admin-btn--edit admin-btn--small">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(image.id)} className="admin-btn--delete admin-btn--small" title="Remove from gallery">
                        Delete
                      </button>
                    </div>
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

export default GalleryAdmin;

