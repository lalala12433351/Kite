export const formatNewsDate = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return isoString;
  }
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const coerceIsoString = (value) => {
  if (!value) {
    return new Date().toISOString();
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString();
  }
  return date.toISOString();
};

export const normalizeNewsItems = (items = []) => {
  const array = Array.isArray(items) ? items : [];

  const normalized = array.map((item, index) => {
    const createdAtIso = coerceIsoString(item.created_at || item.date);

    return {
      id: item.id ?? String(index + 1),
      title: item.title ?? 'Untitled Story',
      subtitle: item.subtitle ?? '',
      tag: item.tag ?? '',
      content: item.content ?? '',
      image: item.image ?? '',
      source: item.source ?? '',
      source_url: item.source_url ?? '',
      external_url: item.external_url ?? '',
      created_at: createdAtIso,
      formatted_date: item.formatted_date ?? formatNewsDate(createdAtIso),
      excerpt: item.excerpt ?? '',
    };
  });

  normalized.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  return normalized;
};

export const normalizeSingleNews = (item) => normalizeNewsItems([item])[0];

