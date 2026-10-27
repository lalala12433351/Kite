'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation } from '@/lib/router';
import { pushFormSubmitted } from '../utils/gtmDataLayer';
import { syncTelecrmOnSubmit } from '../utils/submitFormWithTelecrm';
import { getFormSubmitUrl } from '../utils/formSubmit';
import { parseFormMailResponse } from '../utils/formSubmitResponse';
import OutputMessage from './OutputMessage';

const OPEN_DELAY_MS = 1800;
const FORM_SEND_MIN_MS = 4000;
const DRAG_THRESHOLD_PX = 5;

const ADMIN_PATHS = /^\/(?:admin|careers-admin|aviation-careers-admin|news-admin|gallery-admin)(?:\/|$)/;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function CallbackPopup({ suppressed = false }) {
  const location = useLocation();
  const panelRef = useRef(null);
  const dragRef = useRef(null);
  const closeTimerRef = useRef(null);

  const [visible, setVisible] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [entered, setEntered] = useState(false);
  const [position, setPosition] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
  });
  const [showMessage, setShowMessage] = useState(false);
  const [messageType, setMessageType] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const isAdminRoute = ADMIN_PATHS.test(location.pathname);

  useEffect(() => {
    if (typeof window === 'undefined' || suppressed || isAdminRoute) return undefined;

    const timer = window.setTimeout(() => {
      setVisible(true);
      requestAnimationFrame(() => setEntered(true));
    }, OPEN_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [suppressed, isAdminRoute]);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMinimize = () => {
    setPosition(null);
    setMinimized(true);
  };

  const handleClose = () => {
    setEntered(false);
    setVisible(false);
    setMinimized(false);
    setPosition(null);
  };

  const handleExpand = () => {
    setMinimized(false);
    requestAnimationFrame(() => setEntered(true));
  };

  const stopHeaderDrag = (event) => {
    event.stopPropagation();
  };

  const getPanelRect = useCallback(() => {
    const el = panelRef.current;
    if (!el) return null;
    return el.getBoundingClientRect();
  }, []);

  const onDragPointerDown = (event) => {
    if (event.button !== 0) return;
    if (event.target.closest('.callback-popup__control')) return;
    const rect = getPanelRect();
    if (!rect) return;

    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: position?.x ?? rect.left,
      originY: position?.y ?? rect.top,
      moved: false,
      fromTitle: Boolean(event.target.closest('.callback-popup__title-btn')),
    };

    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onDragPointerMove = (event) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;

    if (!drag.moved) {
      if (Math.abs(dx) <= DRAG_THRESHOLD_PX && Math.abs(dy) <= DRAG_THRESHOLD_PX) return;
      drag.moved = true;
    }

    const rect = getPanelRect();
    const width = rect?.width ?? 360;
    const height = rect?.height ?? (minimized ? 56 : 520);

    const nextX = drag.originX + dx;
    const nextY = drag.originY + dy;

    setPosition({
      x: clamp(nextX, 8, window.innerWidth - width - 8),
      y: clamp(nextY, 8, window.innerHeight - height - 8),
    });
  };

  const onDragPointerUp = (event) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const wasClick = !drag.moved;
    const fromTitle = drag.fromTitle;
    dragRef.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);

    if (wasClick && minimized && fromTitle) {
      handleExpand();
    }
  };

  const onTitlePointerDown = (event) => {
    onDragPointerDown(event);
    event.stopPropagation();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowMessage(true);
    setMessageType('sending');
    const sendStartedAt = Date.now();
    const message = 'Please call me back regarding Kite courses and admissions.';

    const payload = {
      name: formData.name,
      email: formData.email,
      mobile: formData.mobile,
      age: '',
      gender: '',
      cityState: '',
      message,
    };

    try {
      await syncTelecrmOnSubmit(
        {
          source: 'Callback Popup',
          formTitle: 'Request a Callback',
          formType: 'contact',
          ...payload,
        },
        'contact'
      );

      const formBody = new URLSearchParams();
      formBody.append('formTitle', 'Request a Callback');
      formBody.append('name', payload.name);
      formBody.append('email', payload.email);
      formBody.append('mobile', payload.mobile);
      formBody.append('age', payload.age);
      formBody.append('gender', payload.gender);
      formBody.append('cityState', payload.cityState);
      formBody.append('message', payload.message);
      formBody.append('feedback', payload.message);

      const controller = new AbortController();
      const fetchTimeout = setTimeout(() => controller.abort(), 90000);
      const response = await fetch(getFormSubmitUrl('contact'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formBody.toString(),
        signal: controller.signal,
      });
      clearTimeout(fetchTimeout);

      const raw = await response.text();
      const parsed = parseFormMailResponse(raw, response.status);
      if (!response.ok || !parsed.ok) {
        throw new Error(parsed.error || `HTTP ${response.status}`);
      }

      pushFormSubmitted('contact', { ...payload, submission_status: 'success' });
      const elapsed = Date.now() - sendStartedAt;
      if (elapsed < FORM_SEND_MIN_MS) {
        await new Promise((resolve) => setTimeout(resolve, FORM_SEND_MIN_MS - elapsed));
      }

      setMessageType('success');
      setIsSuccess(true);
      setFormData({ name: '', mobile: '', email: '' });

      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      closeTimerRef.current = setTimeout(() => {
        setIsSuccess(false);
        setShowMessage(false);
        setMessageType('');
        handleMinimize();
      }, 4500);
    } catch (error) {
      console.error('Callback popup submit error:', error);
      pushFormSubmitted('contact', { ...payload, submission_status: 'error' });
      setMessageType('error');
      setIsSuccess(false);
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      closeTimerRef.current = setTimeout(() => {
        setShowMessage(false);
        setMessageType('');
      }, 5000);
    }
  };

  if (!visible || suppressed || isAdminRoute) return null;

  const panelStyle =
    position != null
      ? { left: `${position.x}px`, top: `${position.y}px`, right: 'auto', bottom: 'auto' }
      : undefined;

  return (
    <div
      ref={panelRef}
      className={`callback-popup${entered ? ' is-visible' : ''}${minimized ? ' is-minimized' : ' is-expanded'}`}
      style={panelStyle}
      role="dialog"
      aria-modal="false"
      aria-label="Request a callback"
    >
      <div
        className="callback-popup__header"
        onPointerDown={onDragPointerDown}
        onPointerMove={onDragPointerMove}
        onPointerUp={onDragPointerUp}
        onPointerCancel={onDragPointerUp}
      >
        <button
          type="button"
          className="callback-popup__title-btn"
          onPointerDown={onTitlePointerDown}
          onPointerMove={onDragPointerMove}
          onPointerUp={onDragPointerUp}
          onPointerCancel={onDragPointerUp}
          aria-expanded={!minimized}
        >
          <span className="callback-popup__icon" aria-hidden="true" />
          Request a Callback
        </button>
        <div className="callback-popup__controls">
          {!minimized && (
            <button
              type="button"
              className="callback-popup__control callback-popup__control--minimize"
              onPointerDown={stopHeaderDrag}
              onClick={handleMinimize}
              aria-label="Minimize"
            />
          )}
          {minimized && (
            <button
              type="button"
              className="callback-popup__control callback-popup__control--expand"
              onPointerDown={stopHeaderDrag}
              onClick={handleExpand}
              aria-label="Expand"
            />
          )}
          <button
            type="button"
            className="callback-popup__control callback-popup__control--close"
            onPointerDown={stopHeaderDrag}
            onClick={handleClose}
            aria-label="Close"
          />
        </div>
      </div>

      {!minimized && (
        <div className="callback-popup__body">
          <p className="callback-popup__intro">
            Share your details and our counsellor will call you shortly.
          </p>

          <form onSubmit={handleSubmit} className="callback-popup__form">
            {isSuccess ? (
              <OutputMessage variant="success">
                Thank you! We&apos;ll call you back soon.
              </OutputMessage>
            ) : (
              <>
                {showMessage && messageType === 'sending' && (
                  <OutputMessage variant="sending">Sending your request…</OutputMessage>
                )}
                {showMessage && messageType === 'error' && (
                  <OutputMessage variant="error">
                    Could not send. Please try again or call +91 70228 33935.
                  </OutputMessage>
                )}

                <label className="callback-popup__field">
                  <span>Name</span>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    autoComplete="name"
                    placeholder="Your full name"
                  />
                </label>

                <label className="callback-popup__field">
                  <span>Mobile</span>
                  <input
                    type="tel"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    required
                    autoComplete="tel"
                    placeholder="+91"
                  />
                </label>

                <label className="callback-popup__field">
                  <span>Email</span>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                  />
                </label>

                <button
                  type="submit"
                  className="callback-popup__submit"
                  disabled={messageType === 'sending'}
                >
                  {messageType === 'sending' ? 'Sending…' : 'Request callback'}
                </button>
              </>
            )}
          </form>
        </div>
      )}
    </div>
  );
}

export default CallbackPopup;
