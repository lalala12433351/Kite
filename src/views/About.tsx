'use client';

import { Link } from '@/lib/router';
import UsefulLinksSection from '../components/UsefulLinksSection';
import { useCmsContent } from '@/src/hooks/useCmsContent';
import aboutFallback from '../../data/about.json';

const FALLBACK_AIRLINES = [
  { name: 'airindia', url: 'https://www.airindia.com/' },
  { name: 'emirates', url: 'https://www.emirates.com/ie/english/' },
  { name: 'etihad', url: 'https://www.etihad.com/' },
  { name: 'qatar', url: 'https://www.qatarairways.com/' },
  { name: 'kuwait', url: 'https://www.kuwaitairways.com/en' },
  { name: 'indigo', url: 'https://www.goindigo.in/' },
  { name: 'spice', url: 'https://www.spicejet.com/' },
  { name: 'airasia', url: 'https://www.airasia.com/' },
  { name: 'akasaair', url: 'https://www.akasaair.com/' },
  { name: 'starair', url: 'https://www.starair.in/' },
  { name: 'vistara', url: 'https://www.airvistara.com/' },
  { name: 'airindiaexpress', url: 'https://www.airindiaexpress.com/' },
  { name: 'celebi', url: 'https://www.celebiaviation.com/' },
  { name: 'airarabia', url: 'https://www.airarabia.com/' },
  { name: 'american', url: 'https://www.aa.com/homePage.do?locale=en_US' },
  { name: 'airindiasats', url: 'https://www.aisats.in/' },
  { name: 'bwfs', url: 'https://www.bird.in/businessverticals/aviation-services.html' },
  { name: 'gaar', url: 'https://www.gmrgroup.in/airports/' },
  { name: 'itc', url: 'https://www.itcportal.com/' },
  { name: 'harley', url: 'https://www.harley-davidson.com/', className: 'auto' },
  { name: 'easymytrip', url: 'https://www.easemytrip.ae/', className: 'travel' },
  { name: 'vfs', url: 'https://www.vfsglobal.com/en/individuals/index.html', className: 'travel' },
  { name: 'parkhyat', url: 'https://www.hyatt.com/', className: 'hotel' },
  { name: 'theleela', url: 'https://www.theleela.com/', className: 'hotel' },
  { name: 'obroi', url: 'https://www.oberoihotels.com/', className: 'hotel' },
  { name: 'taj', url: 'https://www.tajhotels.com/en-in', className: 'hotel' },
  { name: 'jw', url: 'https://www.jw-marriott.marriott.com/', className: 'hotel' },
  { name: 'radisson', url: 'https://www.radissonhotels.com/', className: 'hotel' },
  { name: 'westin', url: 'https://www.westin.marriott.com/', className: 'hotel' },
];

function IntroBlurb({ intro }) {
  if (!intro) return null;
  const { instituteName, highlightWord, paragraph } = intro;
  if (!paragraph?.includes(highlightWord)) {
    return (
      <>
        <span className="sml">{instituteName}</span> {paragraph}
      </>
    );
  }
  const idx = paragraph.indexOf(highlightWord);
  return (
    <>
      <span className="sml">{instituteName}</span>{' '}
      {paragraph.slice(0, idx)}
      <span className="marking">{highlightWord}</span>
      {paragraph.slice(idx + highlightWord.length)}
    </>
  );
}

function About() {
  const { data: about } = useCmsContent('about', aboutFallback);
  const pageTitle = about?.title || aboutFallback.title;
  const intro = about?.intro || aboutFallback.intro;
  const whyChoose = about?.whyChoose?.length ? about.whyChoose : aboutFallback.whyChoose;
  const courses = about?.coursesTeaser?.length ? about.coursesTeaser : aboutFallback.coursesTeaser;
  const airlines = about?.airlines?.length ? about.airlines : FALLBACK_AIRLINES;
  const closingText = about?.closingText || aboutFallback.closingText;
  const mdMessage = about?.mdMessage || aboutFallback.mdMessage;
  const iataVerify = about?.iataVerify || aboutFallback.iataVerify;
  const teamCta = about?.teamCta || aboutFallback.teamCta;
  const vision = about?.vision || aboutFallback.vision;
  const mission = about?.mission || aboutFallback.mission;
  const airlinesHeading = about?.airlinesHeading || 'Where Careers Take Off – Top Hiring Airlines';

  return (
    <div className="content-box about">
      <div className="content-block">
        <div className="lt">
          <h1>{pageTitle}</h1>
          <span className="lrg">
            <IntroBlurb intro={intro} />
          </span>

          <h3>Why Choose Kite Institute?</h3>
          {whyChoose.map((item) => (
            <p key={item.title}>
              {item.title} – {item.text}
            </p>
          ))}

          <h3>Courses We Offer</h3>
          <div className="course-cards">
            {courses.map((course) => (
              <Link key={course.id} to={`/courses/${course.id}`}>
                {course.title}
                <span>
                  Duration: <strong>{course.duration}</strong>
                </span>
              </Link>
            ))}
          </div>

          <h3>{airlinesHeading}</h3>
          <div className="list-of-airlines">
            {airlines.map((airline, index) => (
              <a
                key={index}
                href={airline.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`card tooltip-btn ${airline.name || airline.logo} ${airline.className || ''}`}
              >
                <span className="tooltip-txt">{airline.url}</span>
              </a>
            ))}
          </div>

          <div className="text">
            {closingText.split('\n').map((line, idx, arr) => (
              <span key={idx}>
                {line}
                {idx < arr.length - 1 ? (
                  <>
                    <br />
                  </>
                ) : null}
              </span>
            ))}
            <br />
            <br />
            <Link to="/contact" className="showloader">
              Contact us
            </Link>{' '}
            and turn your passion into profession!
          </div>
        </div>

        <div className="rt">
          <div className="ceo-speaks">
            <h3>{mdMessage.heading}</h3>
            <div className="message-block">
              <div className="ceo-photo"></div>
              <div className="message">
                <strong>{mdMessage.lead}</strong> {mdMessage.body}
                <br />
                <br />
                {mdMessage.closingLine}
                <br />
                <br />
                <strong className="sign">{mdMessage.signatory}</strong>
                <span>{mdMessage.signatoryRole}</span>
              </div>
            </div>
          </div>

          <div className="text-box iata-certified-card">
            <div className="iata-certified-card-inner">
              <div className="iata-certified-logo" aria-hidden />
              <div className="iata-certified-text">
                <h4>{iataVerify.partner.title}</h4>
                <p>{iataVerify.partner.text}</p>
              </div>
            </div>
            <div className="verify-certificate-card-inner">
              <div className="verify-certificate-logo" aria-hidden />
              <div className="iata-certified-text">
                <h4>{iataVerify.verify.title}</h4>
                <p>{iataVerify.verify.text}</p>
                <a
                  href={iataVerify.verify.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="verify-certificate-link"
                >
                  {iataVerify.verify.linkLabel}
                </a>
              </div>
            </div>
          </div>

          <UsefulLinksSection />

          <div className="team-cta-section">
            <h3>{teamCta.heading}</h3>
            <div className="text">
              {teamCta.text}
              <br />
              <Link to={teamCta.linkHref} className="showloader">
                {teamCta.linkLabel}
              </Link>
            </div>
          </div>

          <h3>Our Vision</h3>
          <div className="text">
            <strong>{vision.headline}</strong>
            <br />
            <br />
            {vision.body}
          </div>

          <h3>Our Mission</h3>
          <div className="text">{mission}</div>
        </div>
      </div>
    </div>
  );
}

export default About;
