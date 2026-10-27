'use client';

import { useEffect, useMemo, useState } from 'react';

const toolbarOptions = [
  [{ header: [1, 2, 3, 4, false] }],
  ['bold', 'italic', 'underline', 'strike', 'blockquote'],
  [{ color: [] }, { background: [] }],
  [{ list: 'ordered' }, { list: 'bullet' }],
  [{ align: [] }],
  ['link', 'clean'],
];

function RichTextEditor({ value, onChange, placeholder = '', className = '', style }) {
  const [QuillComponent, setQuillComponent] = useState(null);

  useEffect(() => {
    let mounted = true;
    if (typeof window === 'undefined') return () => {};

    Promise.all([
      import('react-quill-new'),
      // Load Quill styles only in the browser (avoids SSR issues)
      import('react-quill-new/dist/quill.snow.css'),
    ])
      .then(([mod]) => {
        if (!mounted) return;
        setQuillComponent(() => mod.default);
      })
      .catch(() => {
        // If Quill fails to load, keep the textarea fallback.
      });

    return () => {
      mounted = false;
    };
  }, []);

  const modules = useMemo(
    () => ({
      toolbar: toolbarOptions,
    }),
    []
  );

  const formats = useMemo(
    () => [
      'header',
      'bold',
      'italic',
      'underline',
      'strike',
      'blockquote',
      'color',
      'background',
      'list',
      'bullet',
      'align',
      'link',
    ],
    []
  );

  if (!QuillComponent) {
    return (
      <textarea
        value={value || ''}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className={className}
        style={style}
      />
    );
  }

  return (
    <QuillComponent
      theme="snow"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      modules={modules}
      formats={formats}
      className={className}
      style={style}
    />
  );
}

export default RichTextEditor;

