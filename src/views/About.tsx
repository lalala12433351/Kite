'use client';

import { Link } from '@/lib/router';
import UsefulLinksSection from '../components/UsefulLinksSection';
import AirlinesList from '../components/AirlinesList';

function About() {
  const courses = [
    { id: 1, title: 'Kite Diploma Course in Aviation, Hospitality and Travel Management', duration: '12 Months, 5 days/week (Mon- Fri) 2 hours' },
    { id: 5, title: 'Airport Operations Fundamentals', duration: '6 Months, 5 days/week (Mon-Fri) 2 hours' },
    { id: 3, title: 'Passenger Ground Services Course', duration: '6 Months, 5 days/week (Mon-Fri) 2 hours' },
    { id: 4, title: 'Airport Ramp Services Training', duration: '6 Months, 5 days/week (Mon-Fri) 2 hours' },
    { id: 2, title: 'Foundation in Travel & Tourism with Amadeus', duration: '8 Months, 5 days/week (Mon-Fri) 2 hours' },
    { id: 6, title: 'Cargo Introductory Course', duration: '6 Months, 5 days/week (Mon-Fri) 2 hours' }
  ];

  return (
    <div className="content-box about">
      <div className="content-block">
        <div className="lt">
          <h1>About Kite</h1>
          <span className="lrg">
            <span className="sml">Kite Institute of Aviation & Hospitality</span> India's <span className="marking">prestigious</span> aviation training institute based in Bangalore, dedicated to providing world-class programs that equip aspiring professionals for successful careers in airlines, airports, and the hospitality industry.
          </span>

          <h3>Why Choose Kite Institute?</h3>
          <p>Top-Ranked Institute – Recognized as India's leading aviation training academy, we take pride in our industry-relevant curriculum and expert faculty.</p>
          <p>Industry-Integrated Training – Our courses are designed in collaboration with aviation and hospitality leaders, ensuring hands-on experience and real-world exposure.</p>
          <p>State-of-the-Art Infrastructure – Experience world-class training with modern classrooms, mock aircraft cabins, and advanced hospitality labs.</p>
          <p>100% Placement Assistance – We have a proven track record of placing students in top airlines, airport services, and luxury hospitality brands.</p>
          <p>Experienced Faculty – Learn from aviation professionals, hospitality experts, and certified trainers with years of industry experience.</p>

          <h3>Courses We Offer</h3>
          <div className="course-cards">
            {courses.map((course) => (
              <Link key={course.id} to={`/courses/${course.id}`}>
                {course.title}
                <span>Duration: <strong>{course.duration}</strong></span>
              </Link>
            ))}
          </div>

          <h3>Where Careers Take Off – Top Hiring Airlines</h3>
          <AirlinesList />

          <div className="text">
            At Kite Institute of Aviation & Hospitality, we believe that the sky is not the limit—it's just the beginning.
            <br />
            Join us and take your first step toward a successful and rewarding career in the aviation and hospitality industry.
            <br /><br />
            <Link to="/contact" className="showloader">Contact us</Link> and turn your passion into profession!
          </div>
        </div>

        <div className="rt">
          <div className="ceo-speaks">
            <h3>MD's Message</h3>
            <div className="message-block">
              <div className="ceo-photo"></div>
              <div className="message">
                <strong>At Kite Aviation, we are committed to shaping confident, industry-ready professionals in the fields of aviation and hospitality.</strong> Our goal is to provide not just training, but a transformative learning experience that prepares students to thrive in global careers. With expert faculty, practical exposure, and a focus on personality development, we empower every student to rise with excellence and professionalism.
                <br /><br />Your journey to the skies and beyond starts here.
                <br /><br />
                <strong className="sign">Jyothish Ramachandran</strong>
                <span>Managing Director (MD)</span>
              </div>
            </div>
          </div>

          <div className="text-box iata-certified-card">
            <div className="iata-certified-card-inner">
              <div className="iata-certified-logo" aria-hidden />
              <div className="iata-certified-text">
                <h4>IATA Certified Partner</h4>
                <p>Kite Institute is an IATA certified training partner, delivering globally recognized aviation and hospitality programs.</p>
              </div>
            </div>
            <div className="verify-certificate-card-inner">
              <div className="verify-certificate-logo" aria-hidden />
              <div className="iata-certified-text">
                <h4>Verify Student Certificate</h4>
                <p>Verify Kite Institute student course certificates instantly through our secure online portal.</p>
                <Link to="/students/verify" className="verify-certificate-link">
                  Verify Certificate
                </Link>
              </div>
            </div>
          </div>

          <UsefulLinksSection />

          <div className="team-cta-section">
            <h3>Meet Our Team</h3>
            <div className="text">
              Get to know the experienced professionals and industry experts who are dedicated to your success. Our team brings years of real-world experience and passion for teaching.
              <br />
              <Link to="/team" className="showloader">Meet Our Team</Link>
            </div>
          </div>

          <h3>Our Vision</h3>
          <div className="text">
            <strong>Pioneering the Future of Aviation <br />Training Excellence in India</strong>
            <br /><br />
            At Kite Institute of Aviation & Hospitality, we are committed to providing top-notch education and hands-on training that align with global industry standards. Our curriculum blends theoretical knowledge with real-world application, ensuring students are equipped with the skills and expertise required to excel in the aviation and hospitality sectors.
          </div>

          <h3>Our Mission</h3>
          <div className="text">
            At Kite Institute of Aviation & Hospitality, our mission is to empower aspiring professionals with world-class education, hands-on training, and industry exposure, preparing them for successful careers in aviation and hospitality.
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;

