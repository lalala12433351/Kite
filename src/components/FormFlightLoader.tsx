'use client';

import { useId } from 'react';

/** Full-screen sending overlay: realistic takeoff (4s, plays once). */
function FormFlightLoader() {
  const uid = useId().replace(/:/g, '');

  return (
    <div className="form-sending-overlay" role="status" aria-live="polite">
      <div className="form-flight-scene">
        <div className="form-flight-clouds" aria-hidden="true">
          <span className="form-flight-cloud form-flight-cloud--1" />
          <span className="form-flight-cloud form-flight-cloud--2" />
          <span className="form-flight-cloud form-flight-cloud--3" />
        </div>

        <div className="form-flight-runway-wrap" aria-hidden="true">
          <div className="form-flight-runway" />
          <span className="form-flight-runway-markings" />
        </div>

        <div className="form-flight-aircraft-wrap">
          <svg
            className="form-flight-aircraft"
            viewBox="0 0 200 80"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id={`${uid}-fuselage`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f8fafc" />
                <stop offset="50%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#d1dce8" />
              </linearGradient>
              <linearGradient id={`${uid}-wing`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#e2e8f0" />
                <stop offset="100%" stopColor="#94a3b8" />
              </linearGradient>
            </defs>
            <g className="form-flight-contrail">
              <path
                d="M0 42 Q30 40 55 38"
                fill="none"
                stroke="rgba(255,255,255,0.55)"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </g>
            <g className="form-flight-gear">
              <rect x="52" y="48" width="4" height="10" rx="1" fill="#334155" />
              <rect x="118" y="48" width="4" height="10" rx="1" fill="#334155" />
              <circle cx="54" cy="60" r="5" fill="#1e293b" />
              <circle cx="120" cy="60" r="5" fill="#1e293b" />
              <circle cx="54" cy="60" r="2.5" fill="#64748b" />
              <circle cx="120" cy="60" r="2.5" fill="#64748b" />
            </g>
            <ellipse cx="100" cy="38" rx="52" ry="11" fill={`url(#${uid}-fuselage)`} stroke="#0a377f" strokeWidth="1.2" />
            <path
              d="M48 38 L58 22 L68 38 Z"
              fill="#0a377f"
            />
            <path
              d="M132 36 L140 26 L148 36 Z"
              fill="#0a377f"
            />
            <path
              d="M165 36 L178 28 L188 38 L178 40 L165 38 Z"
              fill="#0a377f"
            />
            <path
              d="M62 40 L138 40 L145 48 L55 48 Z"
              fill={`url(#${uid}-wing)`}
              stroke="#0a377f"
              strokeWidth="0.8"
            />
            <ellipse cx="88" cy="34" rx="5" ry="4" fill="#bae6fd" stroke="#0a377f" strokeWidth="0.6" />
            <ellipse cx="112" cy="34" rx="5" ry="4" fill="#bae6fd" stroke="#0a377f" strokeWidth="0.6" />
            <circle cx="172" cy="36" r="2" fill="#1e293b" />
          </svg>
        </div>

        <p className="form-flight-caption">Sending your message…</p>
      </div>
    </div>
  );
}

export default FormFlightLoader;
