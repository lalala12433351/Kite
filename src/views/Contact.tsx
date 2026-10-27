'use client';

import ContactMap from '../components/ContactMap';

function Contact() {
  const openMessageForm = (e) => {
    e.preventDefault();
    window.dispatchEvent(
      new CustomEvent('openEnquiryForm', {
        detail: { title: 'Request a Callback', variant: 'contact' },
      })
    );
  };

  return (
    <div className="content inside-page" id="contact">
      <div className="courses-hero text-box">
        <h1>Contact Us</h1>
        <p className="courses-hero-desc">
        Get in touch with Kite and our admissions team will be happy to guide you through course details, eligibility, fees, and career opportunities in aviation.
        </p>
        <a
                  href="#enquiry"
                  className="apply-now open-panel"
                  onClick={openMessageForm}
                  role="button"
                >
                  Request a Callback
                </a>

        <div className="address-block">
              <div className="ad-tbl">
                <h4>Our Address</h4>
                <strong>Kite Institute of Aviation & Hospitality</strong><br />
                Venus Building<br />
                3rd Floor, 3rd Main, 1, 2 Kalyanamantappa<br />
                Jakkasandra, Koramangala<br />
                Bengaluru, Karnataka 560034
                <br /><br />
                Tel: <strong>+91 70228 33935</strong><br />
                Email: <a href="mailto:enquiry@kiteaviation.in">enquiry@kiteaviation.in</a><br /><br />
                {' '}
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
