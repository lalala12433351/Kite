'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from '@/lib/router';
import { chatAnswers } from '../services/chatAnswers';
import { getAssistantResponse, getSuggestedNavigation, QUICK_TOPICS } from '../services/assistantEngine';
import { parseFormMailResponse } from '../utils/formSubmitResponse';
import { syncTelecrmOnSubmit } from '../utils/submitFormWithTelecrm';
import { getFormSubmitUrl } from '../utils/formSubmit';

const LS_CHAT_HISTORY = 'chatHistory';
const LS_CHAT_USER = 'chat-user-info';
/** Once true, intro form is never shown again (until user clears site data). */
const LS_FORM_COMPLETED = 'kite-chat-form-completed';

/** Shown in the same chat after we navigate to a page for the user */
function getNavigationFollowUpMessage(path) {
  if (!path) return '';
  if (path === '/courses') {
    return "I've opened our Courses page for you — please go through the programs, durations, and details. Tap any course to read more, or ask me here if something isn't clear.";
  }
  if (path.startsWith('/courses/')) {
    return "I've opened this course page for you — please go through the overview, modules, eligibility, and certificates. Ask me anything else when you're ready.";
  }
  if (path === '/placement') {
    return "I've opened our Placements page — please go through opportunities and how we support students. I'm here if you need more details.";
  }
  if (path === '/contact') {
    return "I've opened the Contact page for you — you'll find our address, phone, email, and enquiry options. Go through it and reach out anytime.";
  }
  if (path === '/about') {
    return "I've opened our About page — please go through it to learn more about Kite Institute. Ask me if you'd like a quick summary.";
  }
  if (path === '/team') {
    return "I've opened our Team page — please go through the faculty and leadership profiles.";
  }
  if (path === '/gallery') {
    return "I've opened the Gallery — please go through the photos and highlights.";
  }
  if (path === '/news') {
    return "I've opened News & updates — please go through the latest announcements.";
  }
  return "I've opened that page for you — please go through it. If you have questions, just type them here.";
}

function buildWelcomeMessage(firstName) {
  if (firstName) {
    return `Hi **${firstName}!**\n\nAsk me about courses, admissions, fees, placements or aviation careers, or choose a topic below.`;
  }
  return "Hello! I'm Sara, Kite's virtual assistant.\n\nAsk me about courses, admissions, fees, placements, campus, or aviation careers, or tap a quick topic below.";
}

function readChatStorage() {
  if (typeof window === 'undefined') {
    return { chatHistory: [], savedUser: null, formCompleted: false };
  }
  try {
    const rawHistory = localStorage.getItem(LS_CHAT_HISTORY);
    const chatHistory = rawHistory ? JSON.parse(rawHistory) : [];
    const savedUser = JSON.parse(localStorage.getItem(LS_CHAT_USER) || 'null');
    const formCompleted = localStorage.getItem(LS_FORM_COMPLETED) === 'true';
    return {
      chatHistory: Array.isArray(chatHistory) ? chatHistory : [],
      savedUser,
      formCompleted
    };
  } catch {
    return { chatHistory: [], savedUser: null, formCompleted: false };
  }
}

function getInitialMessages() {
  const { chatHistory, savedUser } = readChatStorage();
  const firstName = savedUser?.studentname?.trim()?.split(/\s+/)[0] || '';

  if (chatHistory.length > 0) {
    return chatHistory.flatMap((entry) => {
      const items = [
        { type: 'user', text: entry.user },
        { type: 'bot', text: entry.bot }
      ];
      if (entry.navigationFollowUp) {
        items.push({ type: 'bot', text: entry.navigationFollowUp });
      }
      return items;
    });
  }
  if (savedUser?.studentname) {
    return [{ type: 'bot', text: buildWelcomeMessage(firstName), isInitial: true }];
  }
  return [{ type: 'bot', text: buildWelcomeMessage(null), isInitial: true }];
}

/** Show intro form only on first visit; after that use chat (restored on refresh). */
function getInitialShowForm() {
  const { chatHistory, savedUser, formCompleted } = readChatStorage();
  const hasMessages = chatHistory.length > 0;
  const hasRegisteredUser = Boolean(savedUser?.studentname);
  if (hasMessages || hasRegisteredUser || formCompleted) {
    return false;
  }
  return true;
}

function getInitialStudentInfo() {
  const { savedUser } = readChatStorage();
  if (savedUser?.studentname || savedUser?.studentmobile || savedUser?.studentemail) {
    return {
      studentname: savedUser.studentname || '',
      studentmobile: savedUser.studentmobile || '',
      studentemail: savedUser.studentemail || ''
    };
  }
  return { studentname: '', studentmobile: '', studentemail: '' };
}

function markIntroFormDone(studentInfo) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(LS_FORM_COMPLETED, 'true');
  localStorage.setItem(LS_CHAT_USER, JSON.stringify(studentInfo));
}

/** Render simple message formatting: clickable URLs + **bold** text */
function renderMessageWithLinks(text) {
  if (text == null || typeof text !== 'string') return text;
  const parts = text.split(/(https?:\/\/[^\s]+)/g);

  return parts.map((part, i) => {
    if (/^https?:\/\//.test(part)) {
      return (
        <a
          key={`url-${i}`}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="chat-message-link"
        >
          {part}
        </a>
      );
    }
    const richTextParts = part.split(/(\*\*[^*]+\*\*)/g);
    return richTextParts.map((chunk, j) => {
      const key = `txt-${i}-${j}`;
      if (/^\*\*[^*]+\*\*$/.test(chunk)) {
        return <strong key={key}>{chunk.slice(2, -2)}</strong>;
      }
      return <span key={key}>{chunk}</span>;
    });
  });
}

function VirtualAssistant({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [messages, setMessages] = useState(getInitialMessages);
  const [userInput, setUserInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingText, setTypingText] = useState('');
  const [isBotResponding, setIsBotResponding] = useState(false);
  const [showForm, setShowForm] = useState(getInitialShowForm);
  const [studentInfo, setStudentInfo] = useState(getInitialStudentInfo);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const chatboxRef = useRef(null);
  const typingIntervalRef = useRef(null);
  const userInputRef = useRef(null);
  const messagesRef = useRef(messages);
  const dragStateRef = useRef({
    active: false,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0
  });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDraggingWindow, setIsDraggingWindow] = useState(false);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    const handlePointerMove = (e) => {
      if (!dragStateRef.current.active) return;
      const dx = e.clientX - dragStateRef.current.startX;
      const dy = e.clientY - dragStateRef.current.startY;
      setDragOffset({
        x: dragStateRef.current.originX + dx,
        y: dragStateRef.current.originY + dy
      });
    };

    const handlePointerUp = () => {
      if (!dragStateRef.current.active) return;
      dragStateRef.current.active = false;
      setIsDraggingWindow(false);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, []);

  useEffect(() => {
    if (chatboxRef.current) {
      chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight;
    }
  }, [messages, typingText]);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('chat-opened');
    } else {
      document.body.classList.remove('chat-opened');
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
      setIsBotResponding(false);
      setIsTyping(false);
    }

    return () => {
      document.body.classList.remove('chat-opened');
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
      setIsBotResponding(false);
      setIsTyping(false);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || showForm) return;

    const handleKeyPress = (e) => {
      const target = e.target;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      if (
        e.key === 'Escape' ||
        e.key === 'Tab' ||
        e.key === 'F1' ||
        e.key === 'F2' ||
        e.key === 'F3' ||
        e.key === 'F4' ||
        e.key === 'F5' ||
        e.key === 'F6' ||
        e.key === 'F7' ||
        e.key === 'F8' ||
        e.key === 'F9' ||
        e.key === 'F10' ||
        e.key === 'F11' ||
        e.key === 'F12' ||
        e.ctrlKey ||
        e.metaKey ||
        e.altKey
      ) {
        return;
      }

      if (userInputRef.current && !isBotResponding) {
        e.preventDefault();
        userInputRef.current.focus();
        if (e.key.length === 1) {
          setUserInput((prev) => prev + e.key);
        }
      }
    };

    document.addEventListener('keypress', handleKeyPress);

    return () => {
      document.removeEventListener('keypress', handleKeyPress);
    };
  }, [isOpen, showForm, isBotResponding]);

  const typeMessage = (text, callback) => {
    setTypingText('');
    let i = 0;

    const typing = setInterval(() => {
      if (i < text.length) {
        setTypingText(text.substring(0, i + 1));
        i++;
        if (chatboxRef.current) {
          chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight;
        }
      } else {
        clearInterval(typing);
        setTimeout(() => {
          if (callback) callback();
        }, 100);
      }
    }, 28);

    typingIntervalRef.current = typing;
  };

  const submitMessage = useCallback(
    (textOverride?: string, navOptions?: { path?: string | null }) => {
      const raw = textOverride !== undefined ? textOverride : userInput;
      const currentInput = String(raw).trim();
      if (currentInput === '' || isBotResponding) return;

      const forcedPath = navOptions?.path || null;

      setIsBotResponding(true);

      const newMessages = [...messagesRef.current, { type: 'user', text: currentInput }];
      setMessages(newMessages);
      setUserInput('');

      setIsTyping(true);
      setTypingText('');

      setTimeout(() => {
        setIsTyping(false);
        const { text: botResponse } = getAssistantResponse(currentInput, chatAnswers);

        const botMessagePlaceholder = { type: 'bot', text: '', isTyping: true };
        setMessages([...newMessages, botMessagePlaceholder]);

        typeMessage(botResponse, () => {
          const finalMessages = [...newMessages, { type: 'bot', text: botResponse, isTyping: false }];
          setMessages(finalMessages);

          setTimeout(() => {
            setTypingText('');
          }, 50);

          const path = forcedPath || getSuggestedNavigation(currentInput)?.path;
          const followUp = path ? getNavigationFollowUpMessage(path) : '';

          const historyEntry: { user: string; bot: string; navigationFollowUp?: string } = { user: currentInput, bot: botResponse };
          if (followUp) {
            historyEntry.navigationFollowUp = followUp;
          }
          let chatHistory = JSON.parse(localStorage.getItem(LS_CHAT_HISTORY)) || [];
          chatHistory.push(historyEntry);
          localStorage.setItem(LS_CHAT_HISTORY, JSON.stringify(chatHistory));

          if (path) {
            navigate(path);
            // Second message in the same chat: page opened hint
            const afterFollowUp = [...finalMessages, { type: 'bot', text: '', isTyping: true }];
            setMessages(afterFollowUp);
            typeMessage(followUp, () => {
              const withNavNote = [...finalMessages, { type: 'bot', text: followUp, isTyping: false }];
              setMessages(withNavNote);
              setTypingText('');
              setIsBotResponding(false);
            });
          } else {
            setIsBotResponding(false);
          }
        });
      }, 650);
    },
    [userInput, isBotResponding, navigate]
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    submitMessage();
  };

  const handleQuickTopic = (topic) => {
    if (isBotResponding) return;
    submitMessage(topic.query, { path: topic.path || null });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (formSubmitting) return;

    setFormSubmitting(true);
    setFormError('');

    try {
      await syncTelecrmOnSubmit(
        {
          source: 'Virtual Assistant',
          formTitle: 'Virtual Assistant Chat',
          formType: 'chat',
          name: studentInfo.studentname.trim(),
          email: studentInfo.studentemail.trim(),
          mobile: studentInfo.studentmobile.trim(),
        },
        'virtual_assistant'
      );

      const formData = new URLSearchParams();
      formData.append('formType', 'chat');
      formData.append('formTitle', 'Virtual Assistant Chat');
      formData.append('studentname', studentInfo.studentname.trim());
      formData.append('studentmobile', studentInfo.studentmobile.trim());
      formData.append('studentemail', studentInfo.studentemail.trim());
      formData.append('name', studentInfo.studentname.trim());
      formData.append('mobile', studentInfo.studentmobile.trim());
      formData.append('email', studentInfo.studentemail.trim());

      const response = await fetch(getFormSubmitUrl('chat'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
      });
      const raw = await response.text();
      const parsed = parseFormMailResponse(raw, response.status);
      if (!response.ok || !parsed.ok) {
        throw new Error(parsed.error || `HTTP ${response.status}`);
      }

      markIntroFormDone(studentInfo);
      localStorage.removeItem('chat-form-data');
      setShowForm(false);
      const firstName = studentInfo.studentname.trim().split(/\s+/)[0];
      setMessages([{ type: 'bot', text: buildWelcomeMessage(firstName), isInitial: true }]);
    } catch (error) {
      console.error('Error submitting chat form:', error);
      setFormError('We could not send your details. Please try again in a moment.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const clearChat = () => {
    localStorage.removeItem(LS_CHAT_HISTORY);
    localStorage.removeItem(LS_CHAT_USER);
    localStorage.removeItem(LS_FORM_COMPLETED);
    localStorage.removeItem('chat-form-data');
    setStudentInfo({ studentname: '', studentmobile: '', studentemail: '' });
    setUserInput('');
    setIsBotResponding(false);
    setIsTyping(false);
    setTypingText('');
    setMessages([{ type: 'bot', text: buildWelcomeMessage(null), isInitial: true }]);
    setShowForm(true);
    setFormSubmitting(false);
    setFormError('');
  };

  const handleDragStart = (e) => {
    // Left mouse button or touch/pen.
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    dragStateRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      originX: dragOffset.x,
      originY: dragOffset.y
    };
    setIsDraggingWindow(true);
    e.preventDefault();
  };

  if (!isOpen) return null;

  return (
    <div
      className={`virtual-conversation ${!showForm ? 'enlarge' : ''} ${isDraggingWindow ? 'is-dragging' : ''}`}
      style={{ transform: `translate(${dragOffset.x}px, ${dragOffset.y}px)` }}
    >
      <h3 onPointerDown={handleDragStart}>Kite Virtual Assistant</h3>
      <a className="close-chat" onClick={onClose}>+</a>

      {showForm ? (
        <div className="chat-form">
          <form onSubmit={handleFormSubmit}>
            <div className="title">Please fill out the form below <br/>to start the conversation.</div>
            <div className="form-group">
              <label htmlFor="studentname">Your Name</label>
              <input
                type="text"
                id="studentname"
                name="studentname"
                value={studentInfo.studentname}
                onChange={(e) => setStudentInfo({...studentInfo, studentname: e.target.value})}
                disabled={formSubmitting}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="studentmobile">Mobile</label>
              <input
                type="tel"
                id="studentmobile"
                name="studentmobile"
                value={studentInfo.studentmobile}
                onChange={(e) => setStudentInfo({...studentInfo, studentmobile: e.target.value})}
                disabled={formSubmitting}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="studentemail">Email</label>
              <input
                type="email"
                id="studentemail"
                name="studentemail"
                value={studentInfo.studentemail}
                onChange={(e) => setStudentInfo({...studentInfo, studentemail: e.target.value})}
                disabled={formSubmitting}
                required
              />
            </div>
            {formError ? (
              <p className="chat-form-error" role="alert">{formError}</p>
            ) : null}
            <button type="submit" className="click-disable" disabled={formSubmitting}>
              {formSubmitting ? 'Sending…' : 'Proceed'}
            </button>
          </form>
        </div>
      ) : (
        <div className="chat-container">
          <div id="chatbox" ref={chatboxRef}>
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`message ${msg.type === 'bot' ? 'bot-reply' : ''} ${msg.isInitial ? 'initial-message' : ''}`}
              >
                {msg.isTyping ? (
                  <span className="message-text message-text-typing">{typingText}</span>
                ) : (
                  <span className="message-text">
                    {msg.type === 'bot' ? renderMessageWithLinks(msg.text) : msg.text}
                  </span>
                )}
              </div>
            ))}
            {isTyping && <div className="message typing"></div>}
          </div>

          <div className="quick-topics" role="toolbar" aria-label="Suggested questions">
            {QUICK_TOPICS.map((topic) => (
              <button
                key={topic.label}
                type="button"
                className="quick-topic-chip"
                disabled={isBotResponding}
                onClick={() => handleQuickTopic(topic)}
              >
                {topic.label}
              </button>
            ))}
          </div>

          <div className="send">
            <input
              type="text"
              id="userInput"
              ref={userInputRef}
              placeholder={isBotResponding ? 'Sara is typing…' : 'Ask about courses, fees, placements…'}
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isBotResponding && handleSubmit(e)}
              disabled={isBotResponding}
              autoComplete="off"
            />
            <button type="button" onClick={handleSubmit} disabled={isBotResponding}>
              {isBotResponding ? '…' : 'Send'}
            </button>
            <a className="clear" onClick={clearChat}>Clear Chat</a>
          </div>
        </div>
      )}
    </div>
  );
}

export default VirtualAssistant;
