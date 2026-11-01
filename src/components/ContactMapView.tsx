'use client';

import { useEffect } from 'react';
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const KITE_LAT = 12.92199144490488;
const KITE_LNG = 77.63651978088221;
const KITE_POSITION: [number, number] = [KITE_LAT, KITE_LNG];

const kiteMarkerIcon = L.divIcon({
  className: 'map-leaflet-pin-host',
  html: `
    <div class="map-custom-marker" aria-hidden="true">
      <div class="map-custom-marker__body">
        <img src="/favicon.png" alt="" />
      </div>
      <span class="map-custom-marker__tip"></span>
    </div>
  `.trim(),
  iconSize: [72, 86],
  iconAnchor: [36, 86],
});

/** Pin horizontal position from the left edge of the map (0–1). */
const MARKER_SCREEN_X_DESKTOP = 0.64;
const MARKER_SCREEN_X_MOBILE = 0.5;
const MOBILE_MAP_MQ = '(max-width: 768px)';

function getMarkerScreenX() {
  if (typeof window === 'undefined') {
    return MARKER_SCREEN_X_DESKTOP;
  }
  return window.matchMedia(MOBILE_MAP_MQ).matches
    ? MARKER_SCREEN_X_MOBILE
    : MARKER_SCREEN_X_DESKTOP;
}

function MapViewSetup() {
  const map = useMap();

  useEffect(() => {
    const applyView = () => {
      map.invalidateSize();
      map.setView(KITE_POSITION, map.getZoom() || 16, { animate: false });
      const { x: width } = map.getSize();
      const offsetX = width * (getMarkerScreenX() - 0.5);
      map.panBy([-offsetX, 0], { animate: false });
    };

    applyView();
    const timer = window.setTimeout(applyView, 150);
    map.on('resize', applyView);

    const mq = window.matchMedia(MOBILE_MAP_MQ);
    const onBreakpointChange = () => applyView();
    mq.addEventListener('change', onBreakpointChange);

    return () => {
      window.clearTimeout(timer);
      map.off('resize', applyView);
      mq.removeEventListener('change', onBreakpointChange);
    };
  }, [map]);

  return null;
}

function ContactMapView() {
  return (
    <MapContainer
      center={KITE_POSITION}
      zoom={16}
      className="contact-map"
      scrollWheelZoom
      attributionControl
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        subdomains="abcd"
        maxZoom={20}
      />
      <MapViewSetup />
      <Marker position={KITE_POSITION} icon={kiteMarkerIcon} />
    </MapContainer>
  );
}

export default ContactMapView;
