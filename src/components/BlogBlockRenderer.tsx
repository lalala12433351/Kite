'use client';

import type { BlogBlock } from '@/lib/blogShared';

function youtubeId(url: string) {
  const m = String(url || '').match(/(?:youtu\.be\/|v=|embed\/)([A-Za-z0-9_-]{6,})/);
  return m?.[1] || '';
}

export default function BlogBlockRenderer({ blocks }: { blocks: BlogBlock[] }) {
  return (
    <div className="blog-blocks">
      {(blocks || []).map((block) => {
        const align = block.align || 'left';
        if (block.type === 'h1') {
          return (
            <h1 key={block.id} className="blog-blocks__h1" style={{ textAlign: align }}>
              {block.content}
            </h1>
          );
        }
        if (block.type === 'h2') {
          return (
            <h2 key={block.id} className="blog-blocks__h2" style={{ textAlign: align }}>
              {block.content}
            </h2>
          );
        }
        if (block.type === 'h3') {
          return (
            <h3 key={block.id} className="blog-blocks__h3" style={{ textAlign: align }}>
              {block.content}
            </h3>
          );
        }
        if (block.type === 'list') {
          const items = String(block.content || '')
            .split('\n')
            .map((line) => line.replace(/^[-*•]\s*/, '').trim())
            .filter(Boolean);
          return (
            <ul key={block.id} className="blog-blocks__list">
              {items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          );
        }
        if (block.type === 'quote') {
          return (
            <blockquote key={block.id} className="blog-blocks__quote">
              {block.content}
            </blockquote>
          );
        }
        if (block.type === 'image' && block.mediaUrl) {
          return (
            <figure key={block.id} className="blog-blocks__figure" style={{ textAlign: align }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={block.mediaUrl} alt={block.content || ''} />
              {block.content ? <figcaption>{block.content}</figcaption> : null}
            </figure>
          );
        }
        if (block.type === 'youtube') {
          const id = youtubeId(block.content);
          if (!id) return null;
          return (
            <div key={block.id} className="blog-blocks__embed">
              <iframe
                title="YouTube video"
                src={`https://www.youtube.com/embed/${id}`}
                allowFullScreen
              />
            </div>
          );
        }
        return (
          <p key={block.id} className="blog-blocks__p" style={{ textAlign: align }}>
            {block.content}
          </p>
        );
      })}
    </div>
  );
}
