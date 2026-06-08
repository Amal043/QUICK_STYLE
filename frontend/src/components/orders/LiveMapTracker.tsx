import React, { useEffect, useRef } from 'react';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface LiveMapTrackerProps {
  phase: string;
  mode: string;
  partnerInfo?: any;
  storeLocation: { lat: number; lng: number };
  homeLocation: { lat: number; lng: number };
  phaseProgress?: number; // 0.0–1.0 within the current phase (from backend)
}

const ORS_API_KEY = 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjkyZDVkYWY3MWM1ZjRjYzU5ZDVlNjNhYjUwMGJkZTdhIiwiaCI6Im11cm11cjY0In0=';

const MOVING_PHASES = ['heading_to_store', 'delivering', 'heading_to_user', 'delivering_and_picking_up'];

export default function LiveMapTracker({
  phase,
  mode,
  partnerInfo,
  storeLocation,
  homeLocation,
  phaseProgress = 0,
}: LiveMapTrackerProps) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const bikeImageRef = useRef<HTMLImageElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const routePolylineRef = useRef<L.Polyline | null>(null);
  const pingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Animation state refs
  const stepStartCoords = useRef<{ lat: number; lng: number } | null>(null);
  const stepEndCoords = useRef<{ lat: number; lng: number } | null>(null);
  const stepStartTime = useRef<number | null>(null);
  const currentPingDurationMs = useRef<number>(1000);

  // Always hold the latest phaseProgress without causing route re-fetches
  const latestPhaseProgressRef = useRef<number>(phaseProgress);
  useEffect(() => {
    latestPhaseProgressRef.current = phaseProgress;
  }, [phaseProgress]);

  // ── Bearing ────────────────────────────────────────────────────────────────
  const calculateBearing = (sLat: number, sLng: number, eLat: number, eLng: number) => {
    const dLng = ((eLng - sLng) * Math.PI) / 180;
    const lat1 = (sLat * Math.PI) / 180;
    const lat2 = (eLat * Math.PI) / 180;
    const y = Math.sin(dLng) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
    return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
  };

  // ── 60 FPS marker animation ────────────────────────────────────────────────
  const animateMarkerFrame = (timestamp: number) => {
    if (!stepStartTime.current) stepStartTime.current = timestamp;
    const progress = Math.min((timestamp - stepStartTime.current) / currentPingDurationMs.current, 1);

    if (stepStartCoords.current && stepEndCoords.current && markerRef.current) {
      const lat = stepStartCoords.current.lat + (stepEndCoords.current.lat - stepStartCoords.current.lat) * progress;
      const lng = stepStartCoords.current.lng + (stepEndCoords.current.lng - stepStartCoords.current.lng) * progress;
      markerRef.current.setLatLng([lat, lng]);
      if (mapRef.current) mapRef.current.panTo([lat, lng], { animate: false });
    }

    if (progress < 1) {
      animationFrameRef.current = requestAnimationFrame(animateMarkerFrame);
    }
  };

  const handleIncomingPing = (newLat: number, newLng: number) => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (!markerRef.current) return;

    const cur = markerRef.current.getLatLng();
    stepStartCoords.current = { lat: cur.lat, lng: cur.lng };
    stepEndCoords.current = { lat: newLat, lng: newLng };

    if (bikeImageRef.current) {
      const heading = calculateBearing(cur.lat, cur.lng, newLat, newLng);
      bikeImageRef.current.style.transform = `rotate(${heading}deg)`;
    }

    stepStartTime.current = null;
    animationFrameRef.current = requestAnimationFrame(animateMarkerFrame);
  };

  // ── Map init (once) ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    mapRef.current = L.map(containerRef.current, {
      zoomControl: false,
      attributionControl: false,
    }).setView([homeLocation.lat, homeLocation.lng], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(mapRef.current);

    bikeImageRef.current = document.createElement('img');
    bikeImageRef.current.src = 'https://cdn-icons-png.flaticon.com/512/3448/3448339.png';
    bikeImageRef.current.style.cssText =
      'width:100%;height:100%;transition:transform 0.25s ease-out;transform-origin:center center;will-change:transform;filter:drop-shadow(0 4px 6px rgba(0,0,0,0.3))';

    markerRef.current = L.marker([homeLocation.lat, homeLocation.lng], {
      icon: L.divIcon({
        html: bikeImageRef.current,
        className: 'biker-icon-wrapper',
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      }),
    }).addTo(mapRef.current);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // ── Route fetch + animation — triggered on phase change ───────────────────
  useEffect(() => {
    if (!mapRef.current) return;

    // Cancel any previous animation
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    let cancelled = false;

    const fetchRoute = async () => {
      try {
        // Determine start/end coordinates for this phase + mode
        let start: [number, number];
        let end: [number, number];

        if (mode === 'Return') {
          // Partner always travels towards user home
          start = [homeLocation.lng - 0.005, homeLocation.lat - 0.005];
          end = [homeLocation.lng, homeLocation.lat];
        } else if (mode === 'Exchange') {
          if (phase === 'assigning' || phase === 'heading_to_store' || phase === 'packing') {
            start = [storeLocation.lng - 0.005, storeLocation.lat - 0.005];
            end = [storeLocation.lng, storeLocation.lat];
          } else {
            // delivering_and_picking_up: store → home
            start = [storeLocation.lng, storeLocation.lat];
            end = [homeLocation.lng, homeLocation.lat];
          }
        } else {
          // Delivery
          if (phase === 'assigning' || phase === 'heading_to_store' || phase === 'packing') {
            start = [storeLocation.lng - 0.005, storeLocation.lat - 0.005];
            end = [storeLocation.lng, storeLocation.lat];
          } else {
            // delivering: store → home
            start = [storeLocation.lng, storeLocation.lat];
            end = [homeLocation.lng, homeLocation.lat];
          }
        }

        const res = await fetch(
          `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${ORS_API_KEY}&start=${start[0]},${start[1]}&end=${end[0]},${end[1]}`
        );
        if (cancelled) return;

        const data = await res.json();
        if (cancelled || !data.features?.length) return;

        const latLngs: [number, number][] = data.features[0].geometry.coordinates.map(
          (c: [number, number]) => [c[1], c[0]]
        );

        if (routePolylineRef.current) routePolylineRef.current.remove();

        const grayPhases = ['assigning', 'heading_to_store', 'heading_to_user', 'packing'];
        routePolylineRef.current = L.polyline(latLngs, {
          color: grayPhases.includes(phase) ? '#94a3b8' : '#3b82f6',
          weight: 6,
          opacity: 0.9,
          lineCap: 'round',
        }).addTo(mapRef.current!);

        mapRef.current!.fitBounds(routePolylineRef.current.getBounds(), { padding: [50, 50] });

        // During assigning: snap marker to route start so it doesn't jump when motion begins
        if (phase === 'assigning' && latLngs.length > 0 && markerRef.current) {
          markerRef.current.setLatLng(latLngs[0]);
          stepStartCoords.current = { lat: latLngs[0][0], lng: latLngs[0][1] };
          stepEndCoords.current = { lat: latLngs[0][0], lng: latLngs[0][1] };
        }

        if (MOVING_PHASES.includes(phase)) {
          const totalDurationMs = ['heading_to_store', 'heading_to_user'].includes(phase) ? 12000 : 16000;
          const stepCount = latLngs.length;

          // Use latest phaseProgress (captured AFTER fetch completes) to start from correct waypoint.
          // This prevents the "catching up across the whole path" lag on reconnect / late page load.
          const pp = Math.min(latestPhaseProgressRef.current, 0.99);
          const startIdx = Math.min(Math.floor(pp * stepCount), stepCount - 1);

          // Snap marker to the correct position immediately
          if (markerRef.current && latLngs[startIdx]) {
            markerRef.current.setLatLng(latLngs[startIdx]);
            stepStartCoords.current = { lat: latLngs[startIdx][0], lng: latLngs[startIdx][1] };
            stepEndCoords.current = { lat: latLngs[startIdx][0], lng: latLngs[startIdx][1] };
          }

          // Interval = remaining duration / remaining waypoints
          const remainingWaypoints = Math.max(1, stepCount - startIdx);
          const remainingDuration = Math.max(500, (1 - pp) * totalDurationMs);
          const intervalMs = Math.max(50, Math.floor(remainingDuration / remainingWaypoints));
          currentPingDurationMs.current = intervalMs;

          let idx = startIdx;
          pingIntervalRef.current = setInterval(() => {
            if (cancelled) {
              clearInterval(pingIntervalRef.current!);
              pingIntervalRef.current = null;
              return;
            }
            if (idx < stepCount) {
              handleIncomingPing(latLngs[idx][0], latLngs[idx][1]);
              idx++;
            } else {
              clearInterval(pingIntervalRef.current!);
              pingIntervalRef.current = null;
            }
          }, intervalMs);
        }
      } catch (err) {
        if (!cancelled) console.error('[LiveMapTracker] ORS route error:', err);
      }
    };

    fetchRoute();

    return () => {
      cancelled = true;
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = null;
      }
    };
  }, [phase]); // only re-fetch when phase changes, not on every phaseProgress tick

  const isDone = ['delivered', 'returned', 'exchanged'].includes(phase);

  return (
    <div className="w-full h-full relative z-0">
      <div ref={containerRef} className="w-full h-full" style={{ zIndex: 0 }} />
      {!isDone && partnerInfo && (
        <div className="absolute top-4 left-4 z-[400] bg-white px-4 py-3 rounded-xl shadow-lg border border-gray-100 flex items-center gap-3">
          <img
            src={`https://api.dicebear.com/7.x/notionists/svg?seed=${partnerInfo.name}&backgroundColor=f1f5f9`}
            alt="Partner"
            className="w-10 h-10 rounded-full bg-gray-100"
          />
          <div>
            <p className="text-xs text-gray-500 font-medium">Delivery Partner</p>
            <p className="text-sm font-bold text-gray-900">{partnerInfo.name}</p>
          </div>
        </div>
      )}
    </div>
  );
}
