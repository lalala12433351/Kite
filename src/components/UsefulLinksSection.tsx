'use client';

import { Link } from '@/lib/router';
import { useCmsContent, cmsAssetUrl } from '@/src/hooks/useCmsContent';
import homeFallback from '../../data/home.json';

function dispatchLinkAction(action) {
  if (action === 'openCampusTour') {
    window.dispatchEvent(new CustomEvent('openCampusTour'));
  } else if (action === 'openChatbot') {
    window.dispatchEvent(new CustomEvent('openChatbot'));
  }
}

function UsefulLinksSection() {
  const { data: home } = useCmsContent('home', homeFallback);
  const links = home?.usefulLinks?.length ? home.usefulLinks : homeFallback.usefulLinks || [];

  return (
    <div className="text-box useful-links-section">
      <h3>Useful Links</h3>
      <div className="useful-links-grid">
        {links.map((link) => {
          const icon = cmsAssetUrl(link.icon);
          const content = (
            <>
              <span className="cmall-link-card__icon" aria-hidden>
                <img src={icon} alt="" loading="lazy" />
              </span>
              <span className="cmall-link-card__text">
                <strong>{link.title}</strong>
                <small>{link.subtitle}</small>
              </span>
            </>
          );

          if (link.action) {
            return (
              <button
                key={link.title}
                type="button"
                onClick={() => dispatchLinkAction(link.action)}
                className="cmall-link-card"
              >
                {content}
              </button>
            );
          }

          if (link.external) {
            return (
              <a
                key={link.title}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="cmall-link-card"
              >
                {content}
              </a>
            );
          }

          return (
            <Link key={link.title} to={link.href || '/'} className="cmall-link-card showloader">
              {content}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default UsefulLinksSection;
