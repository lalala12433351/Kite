'use client';

import { useEffect, useState } from 'react';

function ContactMap() {
  const [MapView, setMapView] = useState(null);

  useEffect(() => {
    let active = true;

    import('./ContactMapView').then((module) => {
      if (active) {
        setMapView(() => module.default);
      }
    });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="map-embed-wrap">
      {MapView ? (
        <MapView />
      ) : (
        <div className="contact-map contact-map--loading" aria-hidden="true" />
      )}
    </div>
  );
}

export default ContactMap;
