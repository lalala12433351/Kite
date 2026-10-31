'use client';

import { Link } from '@/lib/router';
import { useCmsContent, cmsAssetUrl } from '@/src/hooks/useCmsContent';
import studentHubFallback from '../../data/student-hub.json';

function StudentHubApp({ app }) {
  const classMap = {
    'flight-announcements': 'flight',
    'virtual-classroom': 'virtual-classroom',
    quiz: 'quiz',
  };
  const itemClass = classMap[app.id] || app.id;
  const className = `item ${itemClass}${app.comingSoon ? '' : ' showloader'}`.trim();

  const inner = (
    <>
      {app.comingSoon ? <span className="coming-soon-badge">Coming Soon</span> : null}
      <span
        className="name"
        dangerouslySetInnerHTML={{ __html: app.nameHtml || app.name }}
      />
      <span className="desc">{app.description}</span>
      {app.linkText ? <span className="desc link">{app.linkText}</span> : null}
    </>
  );

  if (app.comingSoon || !app.href) {
    return <div className={className}>{inner}</div>;
  }

  if (app.href.startsWith('http')) {
    return (
      <a className={className} href={app.href} target="_blank" rel="noopener noreferrer">
        {inner}
      </a>
    );
  }

  return (
    <Link className={className} to={app.href}>
      {inner}
    </Link>
  );
}

function StudentHub() {
  const { data: hub } = useCmsContent('student-hub', studentHubFallback);
  const title = hub?.title || studentHubFallback.title;
  const description = hub?.description || studentHubFallback.description;
  const heroImage = cmsAssetUrl(hub?.heroImage || studentHubFallback.heroImage);
  const apps = hub?.apps?.length ? hub.apps : studentHubFallback.apps;

  return (
    <div className="content-box student-hub">
      <div className="content-block">
        <img src={heroImage} alt="Kite student" />
        <div className="cards-list">
          <h1>{title}</h1>
          <span className="desc" dangerouslySetInnerHTML={{ __html: description.replace(/\n/g, '<br/>') }} />
          <div className="apps">
            {apps.map((app) => (
              <StudentHubApp key={app.id} app={app} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentHub;
