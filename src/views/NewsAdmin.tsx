'use client';

import BlogsAdmin from './BlogsAdmin';

function NewsAdmin({
  embedded = false,
  onLogout,
  onToast,
}: {
  embedded?: boolean;
  onLogout?: () => void;
  onToast?: (type: 'success' | 'error', text: string) => void;
}) {
  void embedded;
  void onLogout;
  return <BlogsAdmin kind="news" onToast={onToast} />;
}

export default NewsAdmin;
