import React, { useEffect, useRef } from 'react';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface LiveMapTrackerProps {
  phase: string;
  partnerInfo?: any;
  storeLocation: { lat: number; lng: number };
  homeLocation: { lat: number; lng: number };
}

const PING_INTERVAL_MS = 3000;
const ORS_API_KEY = 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjkyZDVkYWY3MWM1ZjRjYzU5ZDVlNjNhYjUwMGJkZTdhIiwiaCI6Im11cm11cjY0In0=';

export default function LiveMapTracker({ phase, partnerInfo, storeLocation, homeLocation }: LiveMapTrackerProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const bikeImageRef = useRef<HTMLImageElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);

  // Animation State Refs (to avoid stale closures in animate)
  const stepStartCoords = useRef<{ lat: number; lng: number } | null>(null);
  const stepEndCoords = useRef<{ lat: number; lng: number } | null>(null);
  const stepStartTime = useRef<number | null>(null);
  const currentPingDurationMs = useRef<number>(1000);

  // Mathematical Bearing Calculation
  const calculateBearing = (startLat: number, startLng: number, endLat: number, endLng: number) => {
    const dLng = ((endLng - startLng) * Math.PI) / 180;
    const lat1 = (startLat * Math.PI) / 180;
    const lat2 = (endLat * Math.PI) / 180;
    const y = Math.sin(dLng) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
    const brng = (Math.atan2(y, x) * 180) / Math.PI;
    return (brng + 360) % 360;
  };

  // High Performance 60FPS DOM Bypass Animation
  const animateMarkerFrame = (timestamp: number) => {
    if (!stepStartTime.current) stepStartTime.current = timestamp;
    const runtimeElapsed = timestamp - stepStartTime.current;
    
    // Determine total duration for this segment based on the dynamic interval
    const progressPercentage = Math.min(runtimeElapsed / currentPingDurationMs.current, 1);

    if (stepStartCoords.current && stepEndCoords.current && markerRef.current) {
      const currentLat = stepStartCoords.current.lat + (stepEndCoords.current.lat - stepStartCoords.current.lat) * progressPercentage;
      const currentLng = stepStartCoords.current.lng + (stepEndCoords.current.lng - stepStartCoords.current.lng) * progressPercentage;
      
      markerRef.current.setLatLng([currentLat, currentLng]);
      if (mapRef.current) mapRef.current.panTo([currentLat, currentLng], { animate: false });
    }

    if (progressPercentage < 1) {
      animationFrameRef.current = requestAnimationFrame(animateMarkerFrame);
    }
  };

  const handleIncomingPing = (newLat: number, newLng: number) => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (!markerRef.current) return;

    const currentLatLng = markerRef.current.getLatLng();
    stepStartCoords.current = { lat: currentLatLng.lat, lng: currentLatLng.lng };
    stepEndCoords.current = { lat: newLat, lng: newLng };

    const computedHeading = calculateBearing(
      currentLatLng.lat, currentLatLng.lng,
      newLat, newLng
    );

    if (bikeImageRef.current) {
      bikeImageRef.current.style.transform = `rotate(${computedHeading}deg)`;
    }

    stepStartTime.current = null;
    animationFrameRef.current = requestAnimationFrame(animateMarkerFrame);
  };

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const fallbackLatLng = [homeLocation.lat, homeLocation.lng]; 
    mapRef.current = L.map(containerRef.current, {
      zoomControl: false,
      attributionControl: false
    }).setView(fallbackLatLng as L.LatLngExpression, 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(mapRef.current);

    // Create DOM bypass biker
    bikeImageRef.current = document.createElement('img');
    bikeImageRef.current.src = "https://cdn-icons-png.flaticon.com/512/3448/3448339.png";
    bikeImageRef.current.style.width = '100%';
    bikeImageRef.current.style.height = '100%';
    bikeImageRef.current.style.transition = 'transform 0.25s ease-out';
    bikeImageRef.current.style.transformOrigin = 'center center';
    bikeImageRef.current.style.willChange = 'transform';
    bikeImageRef.current.style.filter = 'drop-shadow(0 4px 6px rgba(0,0,0,0.3))';

    const customDivIcon = L.divIcon({
      html: bikeImageRef.current,
      className: 'biker-icon-wrapper',
      iconSize: [40, 40],
      iconAnchor: [20, 20]
    });

    markerRef.current = L.marker(fallbackLatLng as L.LatLngExpression, { icon: customDivIcon }).addTo(mapRef.current);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // Fetch routes based on phase
  useEffect(() => {
    if (!mapRef.current) return;

    const fetchRoute = async () => {
      try {
        const start = phase === 'heading_to_store' || phase === 'assigning' 
          ? [storeLocation.lng - 0.005, storeLocation.lat - 0.005] // Partner starting point
          : [storeLocation.lng, storeLocation.lat]; // Store point

        const end = phase === 'heading_to_store' || phase === 'assigning'
          ? [storeLocation.lng, storeLocation.lat]
          : [homeLocation.lng, homeLocation.lat];

        const response = await fetch(`https://api.openrouteservice.org/v2/directions/driving-car?api_key=${ORS_API_KEY}&start=${start[0]},${start[1]}&end=${end[0]},${end[1]}`);
        const data = await response.json();
        
        if (data.features && data.features.length > 0) {
          const coords = data.features[0].geometry.coordinates;
          // Flip from [Lng, Lat] to [Lat, Lng]
          const latLngs = coords.map((c: any) => [c[1], c[0]]);
          
          if (routePolylineRef.current) {
            routePolylineRef.current.remove();
          }

          routePolylineRef.current = L.polyline(latLngs, {
            color: phase === 'heading_to_store' || phase === 'assigning' ? '#94a3b8' : '#3b82f6',
            weight: 6,
            opacity: 0.9,
            lineCap: 'round'
          }).addTo(mapRef.current!);

          mapRef.current!.fitBounds(routePolylineRef.current.getBounds(), { padding: [50, 50] });

          // Start ping loop for simulation across this polyline
          if (phase === 'heading_to_store' || phase === 'delivering') {
             const phaseDurationMs = phase === 'heading_to_store' ? 12000 : 16000;
             const stepCount = latLngs.length;
             const intervalMs = Math.max(50, Math.floor(phaseDurationMs / stepCount));
             currentPingDurationMs.current = intervalMs;
             
             let currentIdx = 0;
             const interval = setInterval(() => {
                if (currentIdx < stepCount) {
                  handleIncomingPing(latLngs[currentIdx][0], latLngs[currentIdx][1]);
                  currentIdx += 1;
                } else {
                  clearInterval(interval);
                }
             }, intervalMs);
             return () => clearInterval(interval);
          }
        }
      } catch (err) {
        console.error("Error fetching ORS route:", err);
      }
    };

    fetchRoute();
  }, [phase]);

  return (
    <div className="w-full h-full relative z-0">
      <div ref={containerRef} className="w-full h-full" style={{ zIndex: 0 }} />
      {/* Overlay Status Bubble */}
      {phase !== 'delivered' && partnerInfo && (
        <div className="absolute top-4 left-4 z-[400] bg-white px-4 py-3 rounded-xl shadow-lg border border-gray-100 flex items-center gap-3">
           <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${partnerInfo.name}&backgroundColor=f1f5f9`} alt="Partner" className="w-10 h-10 rounded-full bg-gray-100" />
           <div>
             <p className="text-xs text-gray-500 font-medium">Delivery Partner</p>
             <p className="text-sm font-bold text-gray-900">{partnerInfo.name}</p>
           </div>
        </div>
      )}
    </div>
  );
}
