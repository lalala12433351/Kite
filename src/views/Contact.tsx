'use client';

import ContactMap from '../components/ContactMap';
import { useCmsContent } from '@/src/hooks/useCmsContent';
import contactFallback from '../../data/contact.json';
import siteSettingsFallback from '../../data/site-settings.json';

function Contact() {
  const { data: contact } = useCmsContent('contact', contactFallback);
  const { data: settings } = useCmsContent('site-settings', siteSettingsFallback);
  const hero = contact?.hero || contactFallback.hero;
  const addressHeading = contact?.addressHeading || contactFallback.addressHeading;
  const phone = settings?.phone || siteSettingsFallback.phone;
  const enquiryEmail = settings?.emails?.enquiry || siteSettingsFallback.emails.enquiry;
  const addressLines = settings?.address?.lines || siteSettingsFallback.address.lines;

  const openMessageForm = (e) => {
    e.preventDefault();
    window.dispatchEvent(
      new CustomEvent('openEnquiryForm', {
        detail: hero.ctaEvent || { title: 'Request a Callback', variant: 'contact' },
      })
    );
  };

  return (
    <div className="content inside-page" id="contact">
      <div className="courses-hero text-box">
        <h1>{hero.title}</h1>
        <p className="courses-hero-desc">{hero.subtitle}</p>
        <a
          href="#enquiry"
          className="apply-now open-panel"
          onClick={openMessageForm}
          role="button"
        >
          {hero.ctaLabel}
        </a>

        <div className="address-block">
          <div className="ad-tbl">
            <h4>{addressHeading}</h4>
            {addressLines.map((line, index) => (
              <span key={index}>
                {index === 0 ? <strong>{line}</strong> : line}
                {index < addressLines.length - 1 ? (
                  <>
                    <br />
                  </>
                ) : null}
              </span>
            ))}
            <br />
            <br />
            Tel: <strong>{phone}</strong>
            <br />
            Email: <a href={`mailto:${enquiryEmail}`}>{enquiryEmail}</a>
            <br />
            <br />{' '}
          </div>
        </div>
      </div>
      <div className="contact-us">
        <div className='campus-hvr'></div>
        <div className="map-block">
          <div className="item">
            <ContactMap />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;
