'use client';

import { useState, useEffect, useRef } from 'react';
import { pushFormSubmitted } from '../utils/gtmDataLayer';
import { syncTelecrmOnSubmit } from '../utils/submitFormWithTelecrm';
import { getFormSubmitUrl } from '../utils/formSubmit';
import { parseFormMailResponse } from '../utils/formSubmitResponse';
import OutputMessage from './OutputMessage';

function getInitialFormData(variant): {
  name: string;
  email: string;
  mobile: string;
  age: string;
  gender: string;
  cityState: string;
  message?: string;
  qualification?: string;
} {
  const base = {
    name: '',
    email: '',
    mobile: '',
    age: '',
    gender: '',
    cityState: '',
  };
  if (variant === 'contact') {
    return { ...base, message: '' };
  }
  return { ...base, qualification: '' };
}

function EnquiryForm({ isOpen, onClose, preSelectedCourse = '', formTitle = 'Enquiry Form', variant = 'enquiry' }) {
  const isContactForm = variant === 'contact';
  const [formData, setFormData] = useState(() => getInitialFormData(variant));
  const [showMessage, setShowMessage] = useState(false);
  const [messageType, setMessageType] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const closeTimerRef = useRef(null);
  const FORM_SEND_MIN_MS = 4000;

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('popup-opened');
      setFormData(getInitialFormData(variant));
    } else {
      document.body.classList.remove('popup-opened');
      setIsSuccess(false);
      setShowMessage(false);
      setMessageType('');
      setFormData(getInitialFormData(variant));
    }
    return () => {
      document.body.classList.remove('popup-opened');
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
    };
  }, [isOpen, variant]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData(getInitialFormData(variant));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowMessage(true);
    setMessageType('sending');
    const sendStartedAt = Date.now();
    const submitType = isContactForm ? 'contact' : 'enquiry';
    const telecrmContext = isContactForm ? 'contact' : 'enquiry';

    try {
      await syncTelecrmOnSubmit(
        {
          source: isContactForm ? 'Contact Form' : 'Website Enquiry',
          formTitle,
          course: preSelectedCourse,
          formType: telecrmContext,
          ...formData,
        },
        telecrmContext
      );

      const formBody = new URLSearchParams();
      formBody.append('formTitle', formTitle);
      formBody.append('name', formData.name);
      formBody.append('email', formData.email);
      formBody.append('mobile', formData.mobile);
      formBody.append('age', formData.age);
      formBody.append('gender', formData.gender);
      formBody.append('cityState', formData.cityState);
      if (isContactForm) {
        formBody.append('message', formData.message ?? '');
        formBody.append('feedback', formData.message ?? '');
      } else {
        formBody.append('qualification', formData.qualification ?? '');
      }

      const controller = new AbortController();
      const fetchTimeout = setTimeout(() => controller.abort(), 90000);
      const response = await fetch(getFormSubmitUrl(submitType), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formBody.toString(),
        signal: controller.signal,
      });
      clearTimeout(fetchTimeout);

      const raw = await response.text();
      const parsed = parseFormMailResponse(raw, response.status);
      if (!response.ok || !parsed.ok) {
        console.error('[Kite form] Mail script response:', {
          status: response.status,
          url: getFormSubmitUrl(submitType),
          bodyPreview: String(raw).slice(0, 200),
        });
        throw new Error(parsed.error || `HTTP ${response.status}`);
      }

      console.log(`[Kite form] Email sent via sendmail-${submitType === 'contact' ? 'contact' : 'new'}.php`);

      pushFormSubmitted(isContactForm ? 'contact' : 'enquiry', {
        ...formData,
        submission_status: 'success',
      });
      const elapsed = Date.now() - sendStartedAt;
      if (elapsed < FORM_SEND_MIN_MS) {
        await new Promise((resolve) => setTimeout(resolve, FORM_SEND_MIN_MS - elapsed));
      }
      setMessageType('success');
      setIsSuccess(true);
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      closeTimerRef.current = setTimeout(() => {
        setIsSuccess(false);
        setShowMessage(false);
        setMessageType('');
        onClose?.();
      }, 5000);
      resetForm();
    } catch (error) {
      console.error('Error submitting form:', error);
      pushFormSubmitted(isContactForm ? 'contact' : 'enquiry', {
        ...formData,
        submission_status: 'error',
      });
      setMessageType('error');
      setIsSuccess(false);
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      closeTimerRef.current = setTimeout(() => {
        setIsSuccess(false);
        setShowMessage(false);
        setMessageType('');
      }, 5000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`side-panel ${isOpen ? 'open' : ''}`}>
      <h2>{formTitle}</h2>
      <a className="close-form" onClick={onClose}>+</a>

      <form onSubmit={handleSubmit} className="myform">
        {isSuccess ? (
          <OutputMessage variant="success">
            All set! Your message has been sent successfully. <br /> Our team will get back to you soon.
          </OutputMessage>
        ) : (
          <>
            {showMessage && messageType === 'sending' && (
              <OutputMessage variant="sending">
                Email is being sent, just a moment!
              </OutputMessage>
            )}
            {showMessage && messageType === 'error' && (
              <OutputMessage variant="error">
                Sorry, we could not send your message. Please try again or call +91 70228 33935.
              </OutputMessage>
            )}

            <div className="form-group name-field">
              <label htmlFor="name">Full Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group email-field">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group mobile-field">
              <label htmlFor="mobile">Mobile</label>
              <input
                type="tel"
                id="mobile"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group age-field">
              <label htmlFor="age">Age</label>
              <input
                type="number"
                id="age"
                name="age"
                min="1"
                max="120"
                value={formData.age}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group gender-field">
              <label>Gender</label>
              <div className="checkbox-group">
                <input
                  type="radio"
                  id="male"
                  name="gender"
                  value="Male"
                  checked={formData.gender === 'Male'}
                  onChange={handleChange}
                />
                <label htmlFor="male">Male</label>
                <input
                  type="radio"
                  id="female"
                  name="gender"
                  value="Female"
                  checked={formData.gender === 'Female'}
                  onChange={handleChange}
                />
                <label htmlFor="female">Female</label>
              </div>
            </div>

            <div className="form-group city-state-field">
              <label htmlFor="cityState">City / State</label>
              <input
                type="text"
                id="cityState"
                name="cityState"
                placeholder="e.g. Mumbai, Maharashtra"
                value={formData.cityState}
                onChange={handleChange}
                required
              />
            </div>

            {isContactForm ? (
              <div className="form-group message-field">
                <label htmlFor="message">Your message / feedback</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="How can we help you?"
                  required
                />
              </div>
            ) : (
              <div className="form-group qualification-field">
                <label htmlFor="qualification">Qualification</label>
                <select
                  id="qualification"
                  name="qualification"
                  value={formData.qualification}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Your Qualification</option>
                  <option value="12th Pursuing">12th Pursuing</option>
                  <option value="12th Pass">12th Pass</option>
                  <option value="Graduation Pursuing">Graduation Pursuing</option>
                  <option value="Graduate">Graduate</option>
                  <option value="Post Graduate">Post Graduate</option>
                </select>
              </div>
            )}

            <div className="buttons">
              <button
                type="submit"
                className="btn click-disable"
                disabled={messageType === 'sending'}
                aria-busy={messageType === 'sending'}
              >
                {messageType === 'sending'
                  ? 'Sending…'
                  : isContactForm
                    ? 'Send Message'
                    : 'Send Enquiry'}
              </button>
              <button type="button" onClick={onClose} className="btn cancel">
                Cancel
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}

export default EnquiryForm;