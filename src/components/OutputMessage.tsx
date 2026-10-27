'use client';

/** Full-screen form feedback overlay with flight video (replaces loader/success GIF ::after). */
function OutputMessage({ variant = 'sending', children }) {
  const innerClass = [variant, 'output_message-inner'].filter(Boolean).join(' ');

  return (
    <span className="output_message" style={{ display: 'block' }}>
      <span className={innerClass}>
        <div className="output-message-video-wrap" aria-hidden="true">
          <video
            className="output-message-video"
            preload="auto"
            loop
            playsInline
            autoPlay
            muted
          >
            <source src="/flight.mp4" type="video/mp4" />
          </video>
        </div>
        {children}
      </span>
    </span>
  );
}

export default OutputMessage;
