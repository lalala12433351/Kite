'use client';

import { CSSProperties, useEffect, useState } from 'react';
import type { HiringPartner } from '@/lib/hiringPartners';

type AirlinesListProps = {
  className?: string;
};

function AirlinesList({ className = 'list-of-airlines' }: AirlinesListProps) {
  const [partners, setPartners] = useState<HiringPartner[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/hiring-partners', { credentials: 'same-origin' });
        const data = await res.json().catch(() => ({}));
        if (!cancelled && res.ok && data.success && Array.isArray(data.partners)) {
          setPartners(data.partners);
        }
      } catch {
        // Keep empty; CSS-backed defaults come from admin seed on first API hit.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!partners.length) return null;

  return (
    <div className={className}>
      {partners.map((partner) => {
        const style: CSSProperties = {};
        if (partner.imageUrl) {
          style.backgroundImage = `url(${partner.imageUrl})`;
          style.backgroundSize = 'contain';
          style.backgroundPosition = 'center';
          style.backgroundRepeat = 'no-repeat';
        }
        if (partner.bgColor) {
          style.backgroundColor = partner.bgColor;
        }

        return (
          <a
            key={partner.id}
            href={partner.url || '#'}
            rel="noopener noreferrer"
            className={`card tooltip-btn ${partner.name} ${partner.className || ''}`.trim()}
            style={Object.keys(style).length ? style : undefined}
            aria-label={partner.label || partner.name}
          >
            <span className="tooltip-txt">{partner.url || partner.label}</span>
          </a>
        );
      })}
    </div>
  );
}

export default AirlinesList;
