import React, { useEffect, useState, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon issues in Leaflet for Vite/Webpack bundling
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const center = {
  lat: 22.7815,
  lng: 86.1510
};

interface LiveTrackingMapProps {
  orderId: string;
}

export default function LiveTrackingMap({ orderId }: LiveTrackingMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const riderMarkerRef = useRef<L.Marker | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);

  const [riderPosition, setRiderPosition] = useState(center);
  const [route, setRoute] = useState<[number, number][]>([]);
  const ws = useRef<WebSocket | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Create map instance
    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false
    }).setView([riderPosition.lat, riderPosition.lng], 15);

    // Premium dark/clean map theme (CartoDB Voyager)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19
    }).addTo(map);

    mapRef.current = map;

    // Custom rider icon
    const riderIcon = L.icon({
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/2983/2983050.png',
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    // Create marker
    const marker = L.marker([riderPosition.lat, riderPosition.lng], { icon: riderIcon }).addTo(map);
    riderMarkerRef.current = marker;

    // Create polyline
    const polyline = L.polyline([], {
      color: '#FF6B6B',
      weight: 4,
      opacity: 0.8
    }).addTo(map);
    routePolylineRef.current = polyline;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update marker position
  useEffect(() => {
    if (mapRef.current && riderMarkerRef.current) {
      mapRef.current.setView([riderPosition.lat, riderPosition.lng]);
      riderMarkerRef.current.setLatLng([riderPosition.lat, riderPosition.lng]);
    }
  }, [riderPosition]);

  // Update polyline route path
  useEffect(() => {
    if (routePolylineRef.current) {
      routePolylineRef.current.setLatLngs(route);
    }
  }, [route]);

  // WebSocket Live Updates
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    ws.current = new WebSocket(`${protocol}//${window.location.hostname}:8000/ws/tracking/${orderId}`);

    ws.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.lat && data.lng) {
          setRiderPosition({ lat: data.lat, lng: data.lng });
          setRoute(prev => [...prev, [data.lat, data.lng]]);
        }
      } catch (err) {
        console.error('Error parsing live position updates', err);
      }
    };

    return () => {
      if (ws.current) ws.current.close();
    };
  }, [orderId]);

  return (
    <div 
      ref={mapContainerRef} 
      style={{ width: '100%', height: '400px', borderRadius: '12px' }}
      className="bg-slate-800 shadow-inner" 
    />
  );
}
