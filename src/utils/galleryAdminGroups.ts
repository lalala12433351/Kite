/**
 * Group gallery images by album for admin library view.
 * Album list matches the public site: api/album-folders.json (folder albums).
 */

export const GALLERY_CATEGORIES = [
  'Events',
  'Campus',
  'Students',
  'Celebrations',
  'Activities',
  'Achievements',
  'Workshops',
  'Management',
  'Others',
];

const ALBUM_SLUG_CATEGORY = {
  campus: 'Campus',
  management: 'Management',
  onam: 'Celebrations',
  others: 'Others',
};

/** Gallery filter category aligned with an album (matches public album folders). */
export function getCategoryForAlbum(album) {
  if (!album) return null;
  const slug = String(album.slug || '').toLowerCase();
  if (ALBUM_SLUG_CATEGORY[slug]) return ALBUM_SLUG_CATEGORY[slug];
  const name = String(album.name || '').trim();
  if (name === 'Highlights') return 'Management';
  const byName = GALLERY_CATEGORIES.find((c) => c.toLowerCase() === name.toLowerCase());
  if (byName) return byName;
  return name || null;
}

/** Categories shown when editing a photo inside an album (album category first). */
export function getCategoriesForAlbumEditor(album) {
  const primary = getCategoryForAlbum(album);
  if (!primary) return [...GALLERY_CATEGORIES];
  const rest = GALLERY_CATEGORIES.filter((c) => c !== primary);
  return [primary, ...rest];
}

export function normalizeGalleryImage(img, getAssetUrl, galleryImagePath) {
  return {
    ...img,
    url: img.url || (img.filename ? getAssetUrl(`${galleryImagePath}/${img.filename}`) : null),
    categories: Array.isArray(img.categories)
      ? img.categories
      : img.category
        ? img.category === 'All'
          ? []
          : [img.category]
        : [],
  };
}

/**
 * Merge website folder albums (album-folders.json) with admin metadata (gallery-albums.json).
 */
export function mergeAlbumsFromWebsite(folderAlbums, metaAlbums, galleryImages) {
  const metaBySlug = new Map();
  (metaAlbums || []).forEach((a) => {
    if (a?.slug) metaBySlug.set(String(a.slug), a);
  });

  let nextId = 1;
  (metaAlbums || []).forEach((a) => {
    const n = Number(a?.id);
    if (!Number.isNaN(n) && n >= nextId) nextId = n + 1;
  });

  const slugsFromFolders = new Set((folderAlbums || []).map((a) => String(a.slug)));
  const merged = (folderAlbums || []).map((fa) => {
    const slug = String(fa.slug);
    const meta = metaBySlug.get(slug);
    const id = meta?.id ?? nextId++;
    if (!meta?.id) nextId = Math.max(nextId, Number(id) + 1);
    const folderDisplayName = fa.name === 'Management' ? 'Highlights' : fa.name;
    const metaName = meta?.name ? String(meta.name).trim() : '';
    const metaDesc = meta?.description != null ? String(meta.description).trim() : '';
    const folderDesc = fa?.description != null ? String(fa.description).trim() : '';
    return {
      id,
      slug,
      name: metaName || folderDisplayName || slug,
      description: metaDesc || folderDesc,
      coverImageId: meta?.coverImageId ?? null,
      imageIds: Array.isArray(meta?.imageIds) ? meta.imageIds.map(String) : [],
      folderImages: sortFolderImagesNewestFirst(
        Array.isArray(fa.images) ? fa.images : [],
        galleryImages
      ),
      createdAt: meta?.createdAt,
      updatedAt: meta?.updatedAt,
    };
  });

  // Albums only in gallery-albums.json (e.g. newly created, not yet on site JSON)
  (metaAlbums || []).forEach((meta) => {
    const slug = meta?.slug ? String(meta.slug) : '';
    if (!slug || slugsFromFolders.has(slug)) return;
    merged.push({
      id: meta.id ?? nextId++,
      slug,
      name: meta.name || slug,
      description: meta?.description != null ? String(meta.description).trim() : '',
      coverImageId: meta.coverImageId ?? null,
      imageIds: Array.isArray(meta.imageIds) ? meta.imageIds.map(String) : [],
      folderImages: [],
      createdAt: meta.createdAt,
      updatedAt: meta.updatedAt,
    });
  });

  return sortAlbumsNewestFirst(merged, galleryImages);
}

function parseUploadTimeMs(value) {
  if (!value) return 0;
  const t = new Date(value).getTime();
  return Number.isNaN(t) ? 0 : t;
}

/** Newest uploads first (registry uploadDate, then folder mtimeMs). */
export function getFolderImageSortTime(folderImg, galleryImages) {
  if (folderImg?.mtimeMs != null) {
    const m = Number(folderImg.mtimeMs);
    if (!Number.isNaN(m) && m > 0) return m;
  }
  const filename = folderImg?.filename;
  if (!filename) return 0;
  const reg = (galleryImages || []).find((i) => i.filename === filename);
  return parseUploadTimeMs(reg?.uploadDate);
}

export function sortFolderImagesNewestFirst(folderImages, galleryImages) {
  return [...(folderImages || [])].sort(
    (a, b) => getFolderImageSortTime(b, galleryImages) - getFolderImageSortTime(a, galleryImages)
  );
}

/** Album recency: latest photo upload, then updatedAt/createdAt, then id. */
export function getAlbumSortTime(album, galleryImages) {
  let t = Math.max(
    parseUploadTimeMs(album?.updatedAt),
    parseUploadTimeMs(album?.createdAt)
  );
  const imgs = album?.folderImages || album?.images || [];
  for (const img of imgs) {
    t = Math.max(t, getFolderImageSortTime(img, galleryImages));
  }
  if (!t && album?.id != null) {
    const n = Number(album.id);
    if (!Number.isNaN(n) && n > 0) t = n;
  }
  return t;
}

export function sortAlbumsNewestFirst(albums, galleryImages) {
  return [...(albums || [])].sort((a, b) => {
    const diff = getAlbumSortTime(b, galleryImages) - getAlbumSortTime(a, galleryImages);
    if (diff !== 0) return diff;
    return (Number(b.id) || 0) - (Number(a.id) || 0);
  });
}

/** URL for a file stored under database/albums/{slug}/ */
export function albumFileUrl(albumSlug, filename, getAssetUrl) {
  if (!albumSlug || !filename) return null;
  return getAssetUrl(`database/albums/${albumSlug}/${filename}`);
}

function resolveFolderImageUrl(folderImg, albumSlug, getAssetUrl) {
  if (!folderImg) return null;
  if (folderImg.url) {
    return folderImg.url.startsWith('http') ? folderImg.url : getAssetUrl(folderImg.url);
  }
  if (folderImg.filename) {
    return albumFileUrl(albumSlug, folderImg.filename, getAssetUrl);
  }
  return null;
}

/**
 * One admin library item — same file/URL as the public gallery (album-folders.json).
 */
export function folderImageToAdminItem(folderImg, albumSlug, getAssetUrl, index = 0) {
  const filename = folderImg?.filename || `image-${index}`;
  return {
    id: `folder:${albumSlug}:${filename}`,
    filename,
    url: resolveFolderImageUrl(folderImg, albumSlug, getAssetUrl),
    albumSlug,
    isFolderImage: true,
    title: filename,
    categories: [],
  };
}

/**
 * Build album groups from website folder manifest only (matches Gallery.jsx).
 * Does not dedupe by global gallery-images.json ids (photo1.jpg exists per album).
 */
export function buildAlbumImageGroups(galleryImages, albums, getAssetUrl) {
  const sortedAlbums = sortAlbumsNewestFirst(albums, galleryImages);
  const groups = sortedAlbums.map((album) => {
    const sorted = sortFolderImagesNewestFirst(album.folderImages, galleryImages);
    return {
      album,
      images: sorted.map((fi, i) => folderImageToAdminItem(fi, album.slug, getAssetUrl, i)),
    };
  });

  return { groups, unassigned: [] };
}

export function getImageCategoriesLabel(image, album) {
  const albumCategory = getCategoryForAlbum(album);
  if (image?.isFolderImage && albumCategory) {
    return albumCategory;
  }
  const cats = Array.isArray(image.categories)
    ? image.categories
    : image.category && image.category !== 'All'
      ? [image.category]
      : [];
  if (cats.length) return cats.join(', ');
  if (albumCategory) return albumCategory;
  return image?.isFolderImage ? 'Album photo' : 'No categories';
}
