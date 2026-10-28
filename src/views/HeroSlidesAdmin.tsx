'use client';

import { ChangeEvent, useEffect, useState } from 'react';
import type { HeroSlide } from '@/lib/heroSlides';

const blankSlide = (): HeroSlide => ({
  id: `hero-${Date.now()}`,
  badge: 'Kite Institute',
  title: "India's Most Trusted\nAviation Training Institute",
  subtitle:
    'Bangalore’s leading aviation and hospitality institute — industry-focused training, placement support, and globally recognized certifications.',
  imageUrl: '/images/himg-1.jpg',
  btn1Text: 'Explore Courses',
  btn1Url: '/courses',
  btn2Text: 'About Kite',
  btn2Url: '/about',
});

function HeroSlidesAdmin({
  onToast,
}: {
  onToast?: (type: 'success' | 'error', text: string) => void;
}) {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const notify = (type: 'success' | 'error', text: string) => {
    onToast?.(type, text);
  };

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/hero-slides', { credentials: 'same-origin' });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        notify('error', data.error || 'Failed to load hero slides');
        setSlides([blankSlide()]);
        return;
      }
      setSlides(Array.isArray(data.slides) && data.slides.length ? data.slides : [blankSlide()]);
    } catch {
      notify('error', 'Failed to load hero slides');
      setSlides([blankSlide()]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateField = (index: number, field: keyof HeroSlide, value: string) => {
    setSlides((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const addSlide = () => {
    setSlides((prev) => [...prev, blankSlide()]);
  };

  const deleteSlide = (id: string) => {
    setSlides((prev) => {
      if (prev.length <= 1) {
        notify('error', 'Keep at least one hero slide');
        return prev;
      }
      return prev.filter((s) => s.id !== id);
    });
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/hero-slides', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slides }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        notify('error', data.error || 'Save failed');
        return;
      }
      setSlides(Array.isArray(data.slides) ? data.slides : slides);
      notify('success', data.message || 'Hero slides saved');
    } catch {
      notify('error', 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const uploadImage = async (event: ChangeEvent<HTMLInputElement>, index: number) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setUploadingId(slides[index]?.id || String(index));
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await fetch('/api/hero-slides/upload', {
        method: 'POST',
        credentials: 'same-origin',
        body: form,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success || !data.url) {
        notify('error', data.error || 'Image upload failed');
        return;
      }
      updateField(index, 'imageUrl', data.url);
      notify('success', 'Hero image updated');
    } catch {
      notify('error', 'Image upload failed');
    } finally {
      setUploadingId(null);
    }
  };

  if (loading) {
    return <p className="superadmin-empty">Loading hero slides…</p>;
  }

  return (
    <div className="hero-admin">
      <div className="hero-admin__toolbar">
        <div>
          <h2>Hero Banner Slides</h2>
          <p>
            Configure hero slides. If you add more than 1 slide, the header banner will auto-cycle as a
            carousel (5 seconds per slide).
          </p>
        </div>
        <div className="hero-admin__toolbar-actions">
          <button type="button" className="superadmin-btn superadmin-btn--ghost" onClick={addSlide}>
            + Add New Slide
          </button>
          <button
            type="button"
            className="superadmin-btn superadmin-btn--primary"
            onClick={save}
            disabled={saving}
          >
            {saving ? 'Saving…' : 'Save Hero Slides'}
          </button>
        </div>
      </div>

      <div className="hero-admin__list">
        {slides.map((slide, index) => (
          <article key={slide.id} className="hero-admin__card">
            <div className="hero-admin__card-head">
              <span className="hero-admin__badge">Hero Slide: {slide.id}</span>
              <button
                type="button"
                className="superadmin-btn superadmin-btn--danger"
                onClick={() => deleteSlide(slide.id)}
              >
                Delete Slide
              </button>
            </div>

            <div className="hero-admin__grid">
              <div className="hero-admin__fields">
                <label>
                  <span>Badge Tag</span>
                  <input
                    type="text"
                    value={slide.badge}
                    onChange={(e) => updateField(index, 'badge', e.target.value)}
                  />
                </label>

                <label>
                  <span>Headline Title (use \n for line break)</span>
                  <input
                    type="text"
                    value={slide.title}
                    onChange={(e) => updateField(index, 'title', e.target.value)}
                  />
                </label>

                <label>
                  <span>Paragraph Subtitle</span>
                  <textarea
                    rows={3}
                    value={slide.subtitle}
                    onChange={(e) => updateField(index, 'subtitle', e.target.value)}
                  />
                </label>

                <div className="hero-admin__buttons">
                  <div className="hero-admin__btn-block">
                    <span className="hero-admin__chip hero-admin__chip--primary">Primary Button (Left)</span>
                    <label>
                      <span>Button Label Text</span>
                      <input
                        type="text"
                        value={slide.btn1Text || ''}
                        placeholder="E.g., Explore Courses"
                        onChange={(e) => updateField(index, 'btn1Text', e.target.value)}
                      />
                    </label>
                    <label>
                      <span>Link URL or Section Target (e.g. /courses)</span>
                      <input
                        type="text"
                        value={slide.btn1Url || ''}
                        placeholder="E.g., /courses or #section"
                        onChange={(e) => updateField(index, 'btn1Url', e.target.value)}
                      />
                    </label>
                  </div>

                  <div className="hero-admin__btn-block">
                    <span className="hero-admin__chip">Secondary Button (Right)</span>
                    <label>
                      <span>Button Label Text</span>
                      <input
                        type="text"
                        value={slide.btn2Text || ''}
                        placeholder="E.g., About Kite"
                        onChange={(e) => updateField(index, 'btn2Text', e.target.value)}
                      />
                    </label>
                    <label>
                      <span>Link URL or Section Target (e.g. /about)</span>
                      <input
                        type="text"
                        value={slide.btn2Url || ''}
                        placeholder="E.g., /about or #section"
                        onChange={(e) => updateField(index, 'btn2Url', e.target.value)}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="hero-admin__visual">
                <span className="hero-admin__visual-label">Visual Background Image</span>
                <div className="hero-admin__preview">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={slide.imageUrl || '/images/himg-1.jpg'} alt="" />
                </div>
                <input
                  type="file"
                  accept="image/*"
                  id={`upload-hero-${slide.id}`}
                  className="hero-admin__file"
                  onChange={(e) => uploadImage(e, index)}
                  disabled={uploadingId === slide.id}
                />
                <label htmlFor={`upload-hero-${slide.id}`} className="hero-admin__upload">
                  {uploadingId === slide.id ? 'Uploading…' : 'Upload Slide Image'}
                </label>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="hero-admin__footer">
        <button
          type="button"
          className="superadmin-btn superadmin-btn--primary"
          onClick={save}
          disabled={saving}
        >
          {saving ? 'Saving…' : 'Save Hero Slides'}
        </button>
      </div>
    </div>
  );
}

export default HeroSlidesAdmin;
