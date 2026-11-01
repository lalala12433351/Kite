'use client';

import { Link } from '@/lib/router';

function StudentHub() {
  return (
    <div className="content-box student-hub">
      <div className="content-block">
        <img src="/images/pic-mobie.png" alt="Kite student" />
        <div className="cards-list">
          <h1>Student Hub</h1>
          <span className="desc">
            Fun and learning come together with engaging activities for kids.<br/>
            from exciting quizzes to interactive online games, sparking creativity and curiosity at every click.
          </span>
          <div className="apps">
            {/*<Link className="item flight showloader" to="/flight-announcements">
                <span className="coming-soon-badge">Coming Soon</span>
                <span className="name">Flight<br/>Announcements</span>
                <span className="desc">Listen to professional flight announcements and practice your cabin crew communication skills with our audio training library.</span>
                <span className="desc link">Click here to Start!</span>
              </Link>*/}
            <div className="item flight">
                <span className="coming-soon-badge">Coming Soon</span>
                <span className="name">Flight<br/>Announcements</span>
                <span className="desc">Listen to professional flight announcements and practice your cabin crew communication skills with our audio training library.</span>
                <span className="desc link">Click here to Start!</span>
              </div>
            <Link className="item virtual-classroom showloader" to="/virtual-classroom-login">
                 {/*<span className="coming-soon-badge">Coming Soon</span>*/}
                <span className="name">Virtual<br/> Classroom</span>
                <span className="desc">Explore our library of recorded sessions at your own pace. Catch up on missed classes or discover new learning materials whenever you're ready.</span>
                <span className="desc link">Explore Now</span>
            </Link>
            <Link className="item certificate-verify" to="/students/verify">
              <span className="name">Certificate<br/>Verification</span>
              <span className="desc">Verify the authenticity of certificates issued by Kite Institute using the certificate number and student name.</span>
              <span className="desc link">Verify Certificate</span>
            </Link>
            <a className="item quiz showloader" href="https://kiteaviation.in/quiz" target="_blank" rel="noopener noreferrer">
              <span className="name">Aviation & Hospitality Knowledge Quiz</span>
              <span className="desc">Test your knowledge on Aviation & Hospitality with our interactive quiz, get your score and a detailed report delivered straight to your email.</span>
              <span className="desc link">Click here to Start!</span>
            </a>
            
            <a className="item coming-soon">
              <span className="name">Ready, Set… Soon!</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentHub;

