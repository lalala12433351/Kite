'use client';

import { Link } from '@/lib/router';
import { courses } from '../data/coursesData';

const getAssetUrl = (path) => `${'/'}${path}`;

function CourseSection() {
  const handleEnrollClick = (e) => {
    e.preventDefault();
    const event = new CustomEvent('openEnquiryForm', { detail: { title: 'Course Enrollment' } });
    window.dispatchEvent(event);
  };

  return (
    <div className="content-box testimonials pt-0">
      <div className="courses-hero text-box">
        <h1 className="courses-hero-title">Don&apos;t Just Dream. Fly High</h1>
        <p className="courses-hero-desc">
          From ground handling to cabin crew, we provide the expert training you need to excel in the global travel industry.
        </p>
        <button
          type="button"
          className="courses-hero-cta"
          onClick={handleEnrollClick}
        >
          Enquire now
        </button>
      </div>

      <div className="list-of-courses">
        {courses.map((course) => (
          <div key={course.id} className="item">
            <img src={getAssetUrl(course.image)} className="course-thumb" loading="lazy" alt="" />

            <Link to={`/courses/${course.id}`} className="know-more">
              <h3>
                {course.title}
                {('subtitle' in course ? (course as { subtitle?: string }).subtitle : '') && <span>{(course as { subtitle?: string }).subtitle}</span>}
                {course.duration && !('subtitle' in course && (course as { subtitle?: string }).subtitle) && (
                  <span className="course-duration-highlight">Duration: <strong>{course.duration}</strong></span>
                )}
              </h3>
            </Link>

            <div className="text">
              <span className="txt">{course.shortDesc}</span>
              <Link to={`/courses/${course.id}`} className="know-more">
                Know More
              </Link>

              <div className="course-eligibility-block">
                <h6>Eligibility Criteria</h6>
                <ul className={course.eligibility.length > 2 ? 'clear' : ''}>
                  {course.eligibility.map((item, index) => (
                    <li
                      key={index}
                      className={typeof item === 'string' && item.trim().toLowerCase().startsWith('age') ? 'course-age-criteria' : ''}
                      dangerouslySetInnerHTML={{ __html: item }}
                    />
                  ))}
                </ul>
              </div>

              <h4>Govt Recognized Certificate (AASSC)</h4>
              <div className="certificates">
                {course.certificates.map((cert, index) => (
                  <a
                    key={index}
                    href={cert.url}
                    target={cert.isInternal ? '_self' : '_blank'}
                    rel={cert.isInternal ? '' : 'noopener noreferrer'}
                    className={`${cert.className} tooltip-btn`}
                  >
                    <span className="tooltip-txt">{cert.url}</span>
                  </a>
                ))}
              </div>
            </div>

            <a className="apply-now" onClick={handleEnrollClick} href="#enquiry">Enroll Now!</a>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CourseSection;
