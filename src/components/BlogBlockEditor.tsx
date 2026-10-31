'use client';

import { ChangeEvent, useMemo, useState, type FormEvent } from 'react';
import {
  BLOG_BLOCK_CATALOG,
  createEmptyBlock,
  type BlogBlock,
  type BlogBlockType,
} from '@/lib/blogShared';

function youtubeId(url: string) {
  const m = String(url || '').match(/(?:youtu\.be\/|v=|embed\/)([A-Za-z0-9_-]{6,})/);
  return m?.[1] || '';
}

function autoGrow(el: HTMLTextAreaElement | null) {
  if (!el) return;
  el.style.height = 'auto';
  el.style.height = `${Math.max(el.scrollHeight, 28)}px`;
}

const TRANSFORM_TYPES: { type: BlogBlockType; label: string }[] = [
  { type: 'paragraph', label: 'Paragraph' },
  { type: 'h1', label: 'H1' },
  { type: 'h2', label: 'H2' },
  { type: 'h3', label: 'H3' },
  { type: 'h4', label: 'H4' },
  { type: 'list', label: 'List' },
  { type: 'quote', label: 'Quote' },
  { type: 'image', label: 'Image' },
  { type: 'video', label: 'Video' },
  { type: 'youtube', label: 'YouTube' },
  { type: 'separator', label: 'Separator' },
  { type: 'html', label: 'HTML' },
];

type Props = {
  blocks: BlogBlock[];
  activeBlockId: string | null;
  uploading?: boolean;
  onChangeBlocks: (blocks: BlogBlock[]) => void;
  onActiveBlockId: (id: string | null) => void;
  onUploadMedia: (file: File, blockId: string, kind: 'image' | 'video') => Promise<void>;
};

function BlogBlockEditor({
  blocks,
  activeBlockId,
  uploading,
  onChangeBlocks,
  onActiveBlockId,
  onUploadMedia,
}: Props) {
  const [inserterFor, setInserterFor] = useState<string | 'top' | 'end' | null>(null);
  const [inserterQuery, setInserterQuery] = useState('');

  const filteredCatalog = useMemo(() => {
    const q = inserterQuery.trim().toLowerCase();
    if (!q) return BLOG_BLOCK_CATALOG;
    return BLOG_BLOCK_CATALOG.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.type.includes(q),
    );
  }, [inserterQuery]);

  const updateBlock = (blockId: string, patch: Partial<BlogBlock>) => {
    onChangeBlocks(blocks.map((b) => (b.id === blockId ? { ...b, ...patch } : b)));
  };

  const insertBlock = (type: BlogBlockType, afterId?: string | 'top' | 'end' | null) => {
    // Empty paragraph + slash/inserter → transform in place (WordPress-style).
    if (afterId && afterId !== 'end' && afterId !== 'top') {
      const idx = blocks.findIndex((b) => b.id === afterId);
      const target = idx >= 0 ? blocks[idx] : null;
      if (target && target.type === 'paragraph' && !String(target.content || '').trim()) {
        const next = [...blocks];
        next[idx] = { ...createEmptyBlock(type), id: target.id };
        onChangeBlocks(next);
        onActiveBlockId(target.id);
        setInserterFor(null);
        setInserterQuery('');
        return;
      }
    }

    const block = createEmptyBlock(type);
    const next = [...blocks];
    if (afterId === 'top') {
      const activeIdx = activeBlockId ? next.findIndex((b) => b.id === activeBlockId) : -1;
      if (activeIdx >= 0) next.splice(activeIdx + 1, 0, block);
      else next.push(block);
    } else if (afterId === 'end' || !afterId) {
      next.push(block);
    } else {
      const idx = next.findIndex((b) => b.id === afterId);
      if (idx >= 0) next.splice(idx + 1, 0, block);
      else next.push(block);
    }
    onChangeBlocks(next);
    onActiveBlockId(block.id);
    setInserterFor(null);
    setInserterQuery('');
  };

  const transformBlock = (blockId: string, type: BlogBlockType) => {
    const current = blocks.find((b) => b.id === blockId);
    if (!current) return;
    updateBlock(blockId, {
      type,
      content:
        type === 'list' && !current.content.includes('\n')
          ? `- ${current.content || 'Item'}`
          : type === 'separator'
            ? ''
            : type === 'youtube' && !/youtu/i.test(current.content)
              ? 'https://www.youtube.com/watch?v='
              : current.content,
      mediaUrl: type === 'image' || type === 'video' ? current.mediaUrl : current.mediaUrl,
    });
  };

  const moveBlock = (blockId: string, dir: -1 | 1) => {
    const next = [...blocks];
    const idx = next.findIndex((b) => b.id === blockId);
    const target = idx + dir;
    if (idx < 0 || target < 0 || target >= next.length) return;
    const tmp = next[idx];
    next[idx] = next[target];
    next[target] = tmp;
    onChangeBlocks(next);
  };

  const removeBlock = (blockId: string) => {
    if (blocks.length <= 1) return;
    onChangeBlocks(blocks.filter((b) => b.id !== blockId));
    if (activeBlockId === blockId) onActiveBlockId(null);
  };

  const onFile = async (e: ChangeEvent<HTMLInputElement>, blockId: string, kind: 'image' | 'video') => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    await onUploadMedia(file, blockId, kind);
  };

  const openInserter = (afterId: string | 'top' | 'end') => {
    setInserterFor((cur) => (cur === afterId ? null : afterId));
    setInserterQuery('');
  };

  const renderInserterPanel = (anchor: string | 'top' | 'end') => {
    const groups: Array<['text' | 'media' | 'embed' | 'design', string]> = [
      ['text', 'Text'],
      ['media', 'Media'],
      ['embed', 'Embeds'],
      ['design', 'Design'],
    ];

    return (
      <div className="gutenberg__inserter">
        <div className="gutenberg__inserter-head">
          <input
            autoFocus
            className="gutenberg__inserter-search"
            placeholder="Search for a block"
            value={inserterQuery}
            onChange={(e) => setInserterQuery(e.target.value)}
          />
          <button type="button" className="gutenberg__inserter-close" onClick={() => setInserterFor(null)}>
            ✕
          </button>
        </div>
        {groups.map(([key, label]) => {
          const items = filteredCatalog.filter((item) => item.category === key);
          if (!items.length) return null;
          return (
            <div key={key} className="gutenberg__inserter-group">
              <strong>{label}</strong>
              <div className="gutenberg__inserter-grid">
                {items.map((item) => (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => insertBlock(item.type, anchor === 'end' ? null : anchor)}
                  >
                    <i>{item.icon}</i>
                    <span>{item.label}</span>
                    <small>{item.description}</small>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="gutenberg">
      <div className="gutenberg__topbar">
        <button
          type="button"
          className={`gutenberg__add ${inserterFor === 'top' ? 'is-open' : ''}`}
          aria-label="Add block"
          title="Add block"
          onClick={() => openInserter('top')}
        >
          +
        </button>
        <p className="gutenberg__topbar-hint">
          Add Paragraph, Heading, Image, Video, or YouTube
        </p>
      </div>

      {inserterFor === 'top' ? renderInserterPanel('top') : null}

      <div className="gutenberg__canvas">
        {blocks.map((block) => {
          const isActive = activeBlockId === block.id;
          const showInserterHere = inserterFor === block.id;
          return (
            <div key={block.id} className={`gutenberg__slot ${isActive ? 'is-active-slot' : ''}`}>
              <div
                className={`gutenberg__block is-${block.type} ${isActive ? 'is-active' : ''}`}
                onClick={() => {
                  onActiveBlockId(block.id);
                  if (inserterFor === 'top') setInserterFor(null);
                }}
              >
                {isActive ? (
                  <div className="gutenberg__toolbar" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={block.type}
                      onChange={(e) => transformBlock(block.id, e.target.value as BlogBlockType)}
                      title="Transform block"
                    >
                      {TRANSFORM_TYPES.map((t) => (
                        <option key={t.type} value={t.type}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                    <button type="button" onClick={() => updateBlock(block.id, { align: 'left' })} title="Align left">
                      ⫷
                    </button>
                    <button type="button" onClick={() => updateBlock(block.id, { align: 'center' })} title="Align center">
                      ☰
                    </button>
                    <button type="button" onClick={() => updateBlock(block.id, { align: 'right' })} title="Align right">
                      ⫸
                    </button>
                    <button type="button" onClick={() => moveBlock(block.id, -1)} title="Move up">
                      ↑
                    </button>
                    <button type="button" onClick={() => moveBlock(block.id, 1)} title="Move down">
                      ↓
                    </button>
                    <button type="button" className="is-danger" onClick={() => removeBlock(block.id)} title="Remove">
                      Trash
                    </button>
                  </div>
                ) : null}

                <div className="gutenberg__block-body" style={{ textAlign: block.align === 'wide' || block.align === 'full' ? 'left' : block.align || 'left' }}>
                  {block.type === 'h1' || block.type === 'h2' || block.type === 'h3' || block.type === 'h4' ? (
                    <textarea
                      className={`gutenberg__heading is-${block.type}`}
                      rows={1}
                      value={block.content}
                      placeholder={`${block.type.toUpperCase()} heading`}
                      ref={(el) => autoGrow(el)}
                      onInput={(e: FormEvent<HTMLTextAreaElement>) => autoGrow(e.currentTarget)}
                      onChange={(e) => updateBlock(block.id, { content: e.target.value.replace(/\n/g, ' ') })}
                    />
                  ) : block.type === 'paragraph' ? (
                    <textarea
                      className="gutenberg__paragraph"
                      rows={2}
                      value={block.content}
                      placeholder="Type / to choose a block, or just start writing…"
                      ref={(el) => autoGrow(el)}
                      onInput={(e: FormEvent<HTMLTextAreaElement>) => autoGrow(e.currentTarget)}
                      onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === '/' && !block.content) {
                          e.preventDefault();
                          openInserter(block.id);
                        }
                      }}
                    />
                  ) : block.type === 'list' ? (
                    <textarea
                      className="gutenberg__list"
                      rows={3}
                      value={block.content}
                      placeholder={'- Item one\n- Item two'}
                      ref={(el) => autoGrow(el)}
                      onInput={(e: FormEvent<HTMLTextAreaElement>) => autoGrow(e.currentTarget)}
                      onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                    />
                  ) : block.type === 'quote' ? (
                    <textarea
                      className="gutenberg__quote"
                      rows={2}
                      value={block.content}
                      placeholder="Add quotation"
                      ref={(el) => autoGrow(el)}
                      onInput={(e: FormEvent<HTMLTextAreaElement>) => autoGrow(e.currentTarget)}
                      onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                    />
                  ) : block.type === 'image' ? (
                    <div className="gutenberg__media">
                      {block.mediaUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={block.mediaUrl} alt={block.content || ''} />
                      ) : (
                        <label className="gutenberg__media-drop">
                          <input
                            type="file"
                            accept="image/*"
                            hidden
                            disabled={uploading}
                            onChange={(e) => onFile(e, block.id, 'image')}
                          />
                          {uploading ? 'Uploading…' : 'Upload image'}
                        </label>
                      )}
                      <input
                        className="gutenberg__caption"
                        value={block.content}
                        placeholder="Add alt text / caption"
                        onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                      />
                      {block.mediaUrl ? (
                        <label className="gutenberg__replace">
                          <input
                            type="file"
                            accept="image/*"
                            hidden
                            disabled={uploading}
                            onChange={(e) => onFile(e, block.id, 'image')}
                          />
                          Replace image
                        </label>
                      ) : null}
                    </div>
                  ) : block.type === 'video' ? (
                    <div className="gutenberg__media">
                      {block.mediaUrl ? (
                        <video src={block.mediaUrl} controls playsInline />
                      ) : (
                        <label className="gutenberg__media-drop">
                          <input
                            type="file"
                            accept="video/mp4,video/webm,video/ogg"
                            hidden
                            disabled={uploading}
                            onChange={(e) => onFile(e, block.id, 'video')}
                          />
                          {uploading ? 'Uploading…' : 'Upload video (mp4/webm)'}
                        </label>
                      )}
                      <input
                        className="gutenberg__caption"
                        value={block.content}
                        placeholder="Optional caption"
                        onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                      />
                    </div>
                  ) : block.type === 'youtube' ? (
                    <div className="gutenberg__embed">
                      <input
                        className="gutenberg__embed-url"
                        value={block.content}
                        placeholder="Paste YouTube URL"
                        onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                      />
                      {youtubeId(block.content) ? (
                        <div className="gutenberg__embed-frame">
                          <iframe
                            title="YouTube preview"
                            src={`https://www.youtube.com/embed/${youtubeId(block.content)}`}
                            allowFullScreen
                          />
                        </div>
                      ) : (
                        <p className="gutenberg__embed-hint">Paste a valid YouTube link to preview.</p>
                      )}
                    </div>
                  ) : block.type === 'separator' ? (
                    <hr className="gutenberg__separator" />
                  ) : block.type === 'html' ? (
                    <textarea
                      className="gutenberg__html"
                      rows={5}
                      value={block.content}
                      placeholder="<div>Custom HTML</div>"
                      onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                    />
                  ) : (
                    <textarea
                      className="gutenberg__paragraph"
                      rows={2}
                      value={block.content}
                      onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                    />
                  )}
                </div>
              </div>

              {showInserterHere ? (
                renderInserterPanel(block.id)
              ) : (
                <button
                  type="button"
                  className="gutenberg__append"
                  aria-label="Add block"
                  onClick={() => openInserter(block.id)}
                >
                  <span>+</span>
                </button>
              )}
            </div>
          );
        })}

        {inserterFor === 'end' ? (
          renderInserterPanel('end')
        ) : (
          <button
            type="button"
            className="gutenberg__append gutenberg__append--end"
            aria-label="Add block at end"
            onClick={() => openInserter('end')}
          >
            <span>+</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default BlogBlockEditor;
