'use client';

import { useEffect, useRef, useState } from 'react';
import { pushFormSubmitted } from '../utils/gtmDataLayer';
import { getFormSubmitUrl } from '../utils/formSubmit';
import { parseFormMailResponse } from '../utils/formSubmitResponse';
import { syncTelecrmOnSubmit } from '../utils/submitFormWithTelecrm';
import OutputMessage from './OutputMessage';

function JobApplicationForm({ isOpen, onClose, onSuccess, jobTitle }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    experience: '',
    qualification: '',
    currentCompany: '',
    resumeLink: '',
    message: ''
  });

  const [showMessage, setShowMessage] = useState(false);
  const [messageType, setMessageType] = useState(''); // 'sending', 'success', 'error'
  const closeTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
        closeTimerRef.current = null;
      }
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate resume link is provided
    if (!formData.resumeLink || formData.resumeLink.trim() === '') {
      alert('Please provide your resume link (Dropbox, Google Drive, etc.)');
      return;
    }
    
    setShowMessage(true);
    setMessageType('sending');

    try {
      await syncTelecrmOnSubmit(
        {
          source: 'Job Application',
          formTitle: jobTitle ? `Job Application: ${jobTitle}` : 'Job Application',
          formType: 'job',
          jobTitle: jobTitle || '',
          resumeLink: formData.resumeLink,
          resume: formData.resumeLink,
          ...formData,
        },
        'job_application'
      );

      // Use URLSearchParams for form data (no file upload)
      const formDataToSend = new URLSearchParams();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('mobile', formData.mobile);
      formDataToSend.append('experience', formData.experience);
      formDataToSend.append('qualification', formData.qualification);
      formDataToSend.append('currentCompany', formData.currentCompany);
      formDataToSend.append('message', formData.message);
      formDataToSend.append('resume', formData.resumeLink); // Send resume link
      formDataToSend.append('jobTitle', jobTitle);
      formDataToSend.append('formTitle', jobTitle ? `Job Application: ${jobTitle}` : 'Job Application');

      const controller = new AbortController();
      const fetchTimeout = setTimeout(() => controller.abort(), 90000);
      const response = await fetch(getFormSubmitUrl('job'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formDataToSend.toString(),
        signal: controller.signal,
      });
      clearTimeout(fetchTimeout);

      const raw = await response.text();
      const parsed = parseFormMailResponse(raw, response.status);
      if (!response.ok || !parsed.ok) {
        throw new Error(parsed.error || `HTTP ${response.status}`);
      }

      pushFormSubmitted('job_application', { ...formData, jobTitle: jobTitle || '', submission_status: 'success' });
      setMessageType('success');

      if (onSuccess) {
        onSuccess();
      }

      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      closeTimerRef.current = setTimeout(() => {
        setShowMessage(false);
        setFormData({
          name: '',
          email: '',
          mobile: '',
          experience: '',
          qualification: '',
          currentCompany: '',
          resumeLink: '',
          message: '',
        });
        onClose();
      }, 5000);
    } catch (error) {
      console.error('Error submitting job application:', error);
      pushFormSubmitted('job_application', { ...formData, jobTitle: jobTitle || '', submission_status: 'success' });
      //alert('Error submitting application. Please try again or email us directly at careers@kiteaviation.in');
      setShowMessage(true);
      setMessageType('error');
      
      // Call onSuccess callback even on error to prevent multiple submissions
      if (onSuccess) {
        onSuccess();
      }
      
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      closeTimerRef.current = setTimeout(() => {
        setShowMessage(false);
        onClose();
      }, 5000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`side-panel ${isOpen ? 'open' : ''}`}>
      <a className="close-form" onClick={onClose}>+</a>
      
      <span className="sb-top-label">Apply for Position</span>
      <h2>{jobTitle}</h2>
      
      <form onSubmit={handleSubmit} className="myform">
          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter your full name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="mobile">Mobile Number *</label>
            <input
              type="tel"
              id="mobile"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              required
              placeholder="Enter your mobile number"
            />
          </div>

          <div className="form-group">
            <label htmlFor="experience">Years of Experience</label>
            <select
              id="experience"
              name="experience"
              value={formData.experience}
              onChange={handleChange}
            >
              <option value="">Select experience</option>
              <option value="Fresher">Fresher</option>
              <option value="1-2 years">1-2 years</option>
              <option value="3-5 years">3-5 years</option>
              <option value="5-10 years">5-10 years</option>
              <option value="10+ years">10+ years</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="qualification">Highest Qualification</label>
            <input
              type="text"
              id="qualification"
              name="qualification"
              value={formData.qualification}
              onChange={handleChange}
              placeholder="e.g., Bachelor's in Aviation"
            />
          </div>

          <div className="form-group">
            <label htmlFor="currentCompany">Current/Last Company</label>
            <input
              type="text"
              id="currentCompany"
              name="currentCompany"
              value={formData.currentCompany}
              onChange={handleChange}
              placeholder="Enter company name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="resumeLink">Resume Link (Dropbox / Google Drive) *</label>
            <input
              type="url"
              id="resumeLink"
              name="resumeLink"
              value={formData.resumeLink}
              onChange={handleChange}
              required
              placeholder="https://drive.google.com/... or https://www.dropbox.com/..."
            />
            <small style={{ fontSize: '11px', opacity: 0.7, display: 'block', marginTop: '4px' }}>
              Please provide a shareable link to your resume from Dropbox, Google Drive, or similar cloud storage
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="message">Cover Letter / Additional Information</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={4}
              placeholder="Tell us why you're a great fit for this role"
            ></textarea>
          </div>

          <div className="buttons">
            <button type="submit" className="btn click-disable" disabled={messageType === 'sending'}>
              {messageType === 'sending' ? 'Submitting...' : 'Submit Application'}
            </button>
            <button type="button" onClick={onClose} className="btn cancel">Cancel</button>
          </div>

          {showMessage && messageType === 'sending' && (
            <OutputMessage variant="sending">
              Submitting your application, just a moment!
            </OutputMessage>
          )}
          {showMessage && messageType === 'success' && (
            <OutputMessage variant="success">
              Application submitted successfully! We&apos;ll get back to you soon.
            </OutputMessage>
          )}
          {showMessage && messageType === 'error' && (
            <OutputMessage variant="error">
              Error submitting application. Please try again.
            </OutputMessage>
          )}
        </form>
    </div>
  );
}

export default JobApplicationForm;

