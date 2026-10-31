'use client';

import { Link } from '@/lib/router';
import { useCmsContent, cmsAssetUrl } from '@/src/hooks/useCmsContent';
import chromeFallback from '../../data/chrome.json';
import siteSettingsFallback from '../../data/site-settings.json';

const SOCIAL_ITEMS = [
  { key: 'facebook', label: 'Facebook', icon: 'icons/facebook-icon-footer.svg' },
  { key: 'instagram', label: 'Instagram', icon: 'icons/instagram-icon-footer.svg' },
  { key: 'youtube', label: 'YouTube', icon: 'icons/youtube-icon-footer.svg' },
  { key: 'whatsapp', label: 'WhatsApp', icon: 'icons/whatsapp-icon-footer.svg' },
  { key: 'x', label: 'X', icon: 'icons/twitter-icon-footer.svg' },
];

function Footer() {
  const currentYear = new Date().getFullYear();
  const { data: chrome } = useCmsContent('chrome', chromeFallback);
  const { data: settings } = useCmsContent('site-settings', siteSettingsFallback);

  const footerLinks = chrome?.footerLinks?.length ? chrome.footerLinks : chromeFallback.footerLinks;
  const footerArt = chrome?.footerArt || chromeFallback.footerArt;
  const copyright = chrome?.copyright || chromeFallback.copyright;
  const social = settings?.social || siteSettingsFallback.social;

  const copyrightText = (copyright.text || '').replace(/\{\{year\}\}/g, String(currentYear));

  return (
    <footer>
      <img src={cmsAssetUrl(footerArt.src)} className="footer-art" alt={footerArt.alt || 'Kite'} />

      <div className="links">
        {footerLinks.map((item) => (
          <Link key={item.href} className="item" to={item.href}>
            {item.label}
          </Link>
        ))}
      </div>

      <ul className="social-media">
        {SOCIAL_ITEMS.map(({ key, label, icon }) => {
          const href = social?.[key];
          if (!href) return null;
          return (
            <li key={key}>
              <a href={href} target="_blank" rel="noopener noreferrer" className="tooltip-btn">
                <span className="tooltip-txt">{label}</span>
                <img src={cmsAssetUrl(icon)} alt={label} />
              </a>
            </li>
          );
        })}
      </ul>

      <div className="copyright">
        {copyrightText}{' '}
        {copyright.developerLink && (
          <>
            Developed and managed by{' '}
            <Link to={copyright.developerLink.href}>{copyright.developerLink.label}</Link>{' '}
          </>
        )}
        <button
          type="button"
          className="footer-privacy-link"
          onClick={() => window.dispatchEvent(new Event('openPrivacyPopup'))}
        >
          {copyright.privacyLabel || 'Privacy'}
        </button>
      </div>
    </footer>
  );
}

export default Footer;
