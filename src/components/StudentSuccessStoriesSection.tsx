'use client';

import { Link } from '@/lib/router';
import { useCmsContent, cmsAssetUrl } from '@/src/hooks/useCmsContent';
import homeFallback from '../../data/home.json';
import featuredPlacementStudents from '../data/featuredPlacementStudents';

function StudentSuccessStoriesSection() {
  const { data: home } = useCmsContent('home', homeFallback);
  const students = home?.featuredPlacementStudents?.length
    ? home.featuredPlacementStudents
    : featuredPlacementStudents;

  return (
    <section className="content-box student-success-stories" aria-labelledby="student-success-stories-title">
      <div className="content-block">
        <h3 id="student-success-stories-title" className="student-success-stories__title">
          Student Success Stories
        </h3>
        <p className="student-success-stories__description">
          Our graduates are building careers with leading airlines, airport services, and hospitality brands across
          India. Here are a few of our recent placement successes.
        </p>

        <ul className="student-success-stories__grid">
          {students.map((student) => (
            <li key={student.name} className="student-success-stories__card">
              <div className="student-success-stories__photo">
                <img
                  src={cmsAssetUrl(student.image)}
                  alt={`${student.name} placed at ${student.company}`}
                  loading="lazy"
                />
              </div>
              <p className="student-success-stories__name">{student.name}</p>
              <span className="student-success-stories__divider" aria-hidden />
              <p className="student-success-stories__company">{student.company}</p>
            </li>
          ))}
        </ul>

        <div className="student-success-stories__footer">
          <Link to="/placement" className="student-success-stories__link showloader">
            View All Placements
          </Link>
        </div>
      </div>
    </section>
  );
}

export default StudentSuccessStoriesSection;
