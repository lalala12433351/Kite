'use client';

import { useEffect, useMemo, useState } from 'react';
import { Link } from '@/lib/router';
import { publicSitemapSections } from '../data/sitemapConfig';
import { courses } from '../data/coursesData';

function Sitemap() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState('All');

  const courseLinks = courses.map((course) => ({
    label: course.title,
    path: `/courses/${course.id}`,
  }));

  const [newsLinks, setNewsLinks] = useState<{ label: string; path: string }[]>([]);

  useEffect(() => {
    fetch('/api/news?scope=public')
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        const posts = Array.isArray(data?.posts) ? data.posts : [];
        if (!posts.length) return;
        setNewsLinks(
          posts.map((news: { title?: string; slug?: string }) => ({
            label: news.title || 'News',
            path: `/news/${news.slug}`,
          })),
        );
      })
      .catch(() => {});
  }, []);

  const allSections = [
    ...publicSitemapSections,
    { title: 'Course Detail Pages', links: courseLinks },
    { title: 'News Detail Pages', links: newsLinks },
  ];

  const sectionFilters = ['All', ...allSections.map((section) => section.title)];

  const filteredSections = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return allSections
      .filter((section) => activeSection === 'All' || section.title === activeSection)
      .map((section) => {
        const links = section.links.filter((item) => {
          if (!query) return true;
          return (
            item.label.toLowerCase().includes(query) ||
            item.path.toLowerCase().includes(query)
          );
        });
        return { ...section, links };
      })
      .filter((section) => section.links.length > 0);
  }, [activeSection, allSections, searchQuery]);

  const totalLinks = allSections.reduce((sum, section) => sum + section.links.length, 0);
  const visibleLinks = filteredSections.reduce((sum, section) => sum + section.links.length, 0);

  return (
    <div className="content-box sitemap-page">
      <div className="content-block">
        <header className="sitemap-page-head">
          <h1>Sitemap</h1>
          <p>Browse and quickly find every important page on Kite Aviation website.</p>
        </header>

        <div className="sitemap-toolbar">
          <div className="sitemap-search">
            <input
              type="text"
              placeholder="Search page name or URL..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <span className="sitemap-count">
            Showing {visibleLinks} of {totalLinks} links
          </span>
        </div>

        <div className="sitemap-filters" role="tablist" aria-label="Sitemap section filters">
          {sectionFilters.map((filter) => (
            <button
              key={filter}
              type="button"
              className={`sitemap-filter-chip ${activeSection === filter ? 'active' : ''}`}
              onClick={() => setActiveSection(filter)}
            >
              {filter}
            </button>
          ))}
        </div>

        {filteredSections.length === 0 ? (
          <div className="sitemap-empty-state">
            <p>No pages found for your search. Try another keyword.</p>
            <button type="button" onClick={() => { setSearchQuery(''); setActiveSection('All'); }}>
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="sitemap-grid">
            {filteredSections.map((section) => (
              <section key={section.title} className="sitemap-section-card">
                <div className="sitemap-section-head">
                  <h2>{section.title}</h2>
                  <span>{section.links.length}</span>
                </div>
                <ul>
                  {section.links.map((item) => (
                    <li key={`${section.title}-${item.path}`}>
                      <Link to={item.path}>
                        <span>{item.label}</span>
                        <small>{item.path}</small>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Sitemap;

