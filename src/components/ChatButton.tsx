'use client';

function ChatButton({ onClick }) {
  return (
    <a className="chat-btn tooltip-btn show-fixed-buttons" onClick={onClick}>
      <span className="tooltip-txt">Virtual Assistant</span>
    </a>
  );
}

export default ChatButton;

