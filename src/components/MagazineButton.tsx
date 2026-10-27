'use client';

function MagazineButton({ onClick }) {
  return (
    <a className="magazine tooltip-btn show-fixed-buttons" onClick={onClick}>
      <span className="tooltip-txt">Digital Magazine</span>
    </a>
  );
}

export default MagazineButton;

