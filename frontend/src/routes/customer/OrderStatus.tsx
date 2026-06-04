import React, { useState, useEffect, useRef } from 'react';
import { Truck, Check, Store, Home, PackageSearch, Phone, MapPin } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useStore } from '../../store/useStore';

const locations = {
  jadavpur: { lat: 22.4981, lng: 88.3653 },
  boutiqueA: { lat: 22.5015, lng: 88.3616 },
  boutiqueB: { lat: 22.5555, lng: 88.3524 },
  boutiqueC: { lat: 22.5804, lng: 88.4231 },
  boutiqueD: { lat: 22.5726, lng: 88.4633 }
};

const interpolatePoints = (start: { lat: number; lng: number }, end: { lat: number; lng: number }, steps = 100): [number, number][] => {
  const points: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const lat = start.lat + (end.lat - start.lat) * t;
    const lng = start.lng + (end.lng - start.lng) * t;
    points.push([lat, lng]);
  }
  return points;
};

const fetchRoute = async (start: { lat: number; lng: number }, end: { lat: number; lng: number }) => {
  try {
    const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`);
    if (!res.ok) throw new Error("OSRM routing failed");
    const data = await res.json();
    const route = data.routes[0];
    if (route) {
      const coordinates = route.geometry.coordinates.map((coord: number[]) => [coord[1], coord[0]] as [number, number]);
      const durationSeconds = route.duration;
      const durationMinutes = Math.max(1, Math.round(durationSeconds / 60));
      return {
        coordinates,
        durationText: `${durationMinutes} MIN`
      };
    }
  } catch (error) {
    console.warn("Failed to fetch OSRM route, falling back to straight-line interpolation:", error);
  }
  return {
    coordinates: interpolatePoints(start, end, 50),
    durationText: "8 MIN"
  };
};

export default function OrderStatus() {
  const { originHub, activeOrderId, userCoords } = useStore();

  const [phase, setPhase] = useState("assigning");
  const [activePhase, setActivePhase] = useState("assigning");
  const [statusMessage, setStatusMessage] = useState("Connecting with local courier network...");
  const [partner, setPartner] = useState<any>(null);
  
  const [partnerRoute, setPartnerRoute] = useState<[number, number][]>([]);
  const [storeRoute, setStoreRoute] = useState<[number, number][]>([]);
  const [etaText, setEtaText] = useState("CALCULATING");

  const getBoutiqueCoords = () => {
    if (originHub.includes('Park Street')) return locations.boutiqueB;
    if (originHub.includes('Salt Lake')) return locations.boutiqueC;
    if (originHub.includes('New Town')) return locations.boutiqueD;
    return locations.boutiqueA;
  };

  const storeCoords = getBoutiqueCoords();
  const homeCoords = userCoords || locations.jadavpur;
  
  // Dummy initial partner position for demo (slightly offset from store)
  const initialPartnerPos = { lat: storeCoords.lat - 0.005, lng: storeCoords.lng - 0.005 };

  const [courierPos] = useState({ lat: initialPartnerPos.lat, lng: initialPartnerPos.lng });
  
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const bikerMarkerRef = useRef<L.Marker | null>(null);
  const partnerPolylineRef = useRef<L.Polyline | null>(null);
  const storePolylineRef = useRef<L.Polyline | null>(null);
  const animationRef = useRef<number>();

  const isHeadingToStore = phase === "assigning" || phase === "heading_to_store" || phase === "packing";

  // Fetch routes from OSRM
  useEffect(() => {
    if (!userCoords) return;
    const fetchAllRoutes = async () => {
      const resPartner = await fetchRoute(initialPartnerPos, storeCoords);
      setPartnerRoute(resPartner.coordinates);

      const resStore = await fetchRoute(storeCoords, homeCoords);
      setStoreRoute(resStore.coordinates);
      setEtaText(resStore.durationText);
    };

    fetchAllRoutes();
  }, [originHub, userCoords]);

  // Initialize Map
  useEffect(() => {
    if (!userCoords || !mapContainerRef.current) return;

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false
    }).setView([initialPartnerPos.lat, initialPartnerPos.lng], 14);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      maxZoom: 19
    }).addTo(map);

    mapInstanceRef.current = map;

    // Store Marker (Modern Dark Pin)
    const storeIcon = L.divIcon({
      html: `<div style="background-color: #1e293b; color: white; width: 30px; height: 30px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.2);"><span class="material-symbols-outlined text-[16px]">store</span></div>`,
      className: 'store-marker-icon',
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });
    L.marker([storeCoords.lat, storeCoords.lng], { icon: storeIcon }).addTo(map);

    // Home Marker (Modern Dark Pin)
    const homeIcon = L.divIcon({
      html: `<div style="background-color: #5a1a1a; color: white; width: 30px; height: 30px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.2);"><span class="material-symbols-outlined text-[16px]">home</span></div>`,
      className: 'home-marker-icon',
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });
    L.marker([homeCoords.lat, homeCoords.lng], { icon: homeIcon }).addTo(map);

    // Biker Marker (Custom HTML divIcon)
    const bikerIcon = L.divIcon({
      html: `
        <div style="position: absolute; transform: translate(-50%, -50%); display: flex; flex-direction: column; align-items: center; pointer-events: none;">
          <div id="eta-bubble-leaflet" class="bg-[#2C3440] text-white text-[11px] font-extrabold px-3 py-1.5 rounded-lg shadow-xl mb-1.5 whitespace-nowrap tracking-wide">
            ETA: CALCULATING
          </div>
          <img id="biker-img-leaflet" src="/images/biker_marker.png" style="width: 50px; height: 50px; filter: drop-shadow(0px 4px 6px rgba(0,0,0,0.4)); transition: none;" />
        </div>
      `,
      className: 'biker-marker-icon',
      iconSize: [50, 80],
      iconAnchor: [25, 65]
    });

    const biker = L.marker([initialPartnerPos.lat, initialPartnerPos.lng], { icon: bikerIcon }).addTo(map);
    bikerMarkerRef.current = biker;

    partnerPolylineRef.current = L.polyline([], { color: '#0066FF', weight: 6, opacity: 0.9 }).addTo(map);
    storePolylineRef.current = L.polyline([], { color: '#CBD5E1', weight: 6, opacity: 0.9 }).addTo(map);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [storeCoords]);

  // Update polylines path
  useEffect(() => {
    if (partnerPolylineRef.current) {
      partnerPolylineRef.current.setLatLngs(isHeadingToStore ? partnerRoute : []);
    }
  }, [partnerRoute, isHeadingToStore]);

  useEffect(() => {
    if (storePolylineRef.current) {
      storePolylineRef.current.setLatLngs(storeRoute);
      storePolylineRef.current.setStyle({
        color: isHeadingToStore ? '#CBD5E1' : '#0066FF'
      });
    }
  }, [storeRoute, isHeadingToStore]);

  // Update ETA text in leaflet bubble
  useEffect(() => {
    const bubble = document.getElementById('eta-bubble-leaflet');
    if (bubble) bubble.innerText = `ETA: ${etaText}`;
  }, [etaText]);

  const calculateBearing = (startLat: number, startLng: number, endLat: number, endLng: number) => {
    const dLng = (endLng - startLng) * Math.PI / 180;
    const lat1 = startLat * Math.PI / 180;
    const lat2 = endLat * Math.PI / 180;

    const y = Math.sin(dLng) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
    
    let brng = Math.atan2(y, x) * 180 / Math.PI;
    return (brng + 360) % 360;
  };

  const animateMarker = (coordinates: [number, number][], durationMs: number) => {
    if (coordinates.length === 0) return;
    const startTime = performance.now();
    let lastLat = coordinates[0][0];
    let lastLng = coordinates[0][1];

    const animate = (currentTime: number) => {
      if (!mapInstanceRef.current || !bikerMarkerRef.current) return;

      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / durationMs, 1);

      const exactIdx = progress * (coordinates.length - 1);
      const lowerIdx = Math.floor(exactIdx);
      const upperIdx = Math.min(lowerIdx + 1, coordinates.length - 1);
      const t = exactIdx - lowerIdx;

      const p1 = coordinates[lowerIdx];
      const p2 = coordinates[upperIdx];

      const lat = p1[0] + (p2[0] - p1[0]) * t;
      const lng = p1[1] + (p2[1] - p1[1]) * t;

      const heading = calculateBearing(lastLat, lastLng, lat, lng);

      if (Math.abs(lat - lastLat) > 0.00001 || Math.abs(lng - lastLng) > 0.00001) {
        lastLat = lat;
        lastLng = lng;
      }

      const currentLatLng: [number, number] = [lat, lng];
      bikerMarkerRef.current.setLatLng(currentLatLng);

      const img = document.getElementById('biker-img-leaflet') as HTMLImageElement;
      if (img) img.style.transform = `rotate(${heading}deg)`;

      mapInstanceRef.current.panTo(currentLatLng);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    animationRef.current = requestAnimationFrame(animate);
  };

  // WebSocket Live Updates
  useEffect(() => {
    if (!activeOrderId) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.hostname}:8000/ws/tracking/${activeOrderId}`;
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setStatusMessage(data.status);
        setPhase(data.phase);
        setActivePhase(data.phase);
        if (data.partner) setPartner(data.partner);
      } catch (err) {
        console.error('WebSocket msg error', err);
      }
    };

    return () => {
      ws.close();
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [activeOrderId]);

  // Handle phase triggers for animation
  useEffect(() => {
    if (activePhase === "heading_to_store" && partnerRoute.length > 0) {
      animateMarker(partnerRoute, 12000);
    } else if (activePhase === "delivering" && storeRoute.length > 0) {
      animateMarker(storeRoute, 15000);
    }
  }, [activePhase, partnerRoute, storeRoute]);

  if (!activeOrderId) {
    return (
      <div className="max-w-3xl mx-auto bg-white border border-panelBorder rounded-3xl p-12 shadow-md flex flex-col items-center justify-center text-center mt-10">
        <PackageSearch className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">No Active Orders</h2>
        <p className="text-gray-500">Place an order to see the live tracking experience.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] overflow-hidden border border-gray-100">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <h2 className="font-extrabold text-xl text-gray-900 tracking-tight">ORDER #{activeOrderId}</h2>
            <p className="text-sm text-gray-500 mt-0.5">Placed today | QUICK_STYLE Instant</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="bg-blue-100 text-blue-700 font-bold text-xs px-3 py-1.5 rounded-full animate-pulse">LIVE</span>
            <button className="text-coral font-bold text-sm hover:underline">HELP</button>
          </div>
        </div>

        {/* 2-Column Layout */}
        <div className="flex flex-col lg:flex-row">
          
          {/* Left: Leaflet Map Container or Location Notice */}
          <div className="w-full lg:w-2/3 h-[500px] relative bg-gray-100 border-r border-gray-100">
            {userCoords ? (
              <div ref={mapContainerRef} className="w-full h-full" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 bg-gray-50 p-8 text-center">
                <MapPin className="w-12 h-12 text-gray-300 mb-3" />
                <h3 className="font-bold text-gray-800 text-lg">Live Map Tracking Unavailable</h3>
                <p className="text-xs text-gray-500 mt-2 max-w-sm leading-relaxed">
                  To view live shipping routes and delivery partner tracking, please select or detect your current delivery location in the navigation bar.
                </p>
              </div>
            )}
          </div>

          {/* Right: Order Status Details */}
          <div className="w-full lg:w-1/3 flex flex-col bg-white">
            <div className="p-6 flex-1">
              <h2 className="text-2xl font-black text-gray-900 tracking-tight leading-tight mb-2">
                {phase === "delivered" ? "Delivered Successfully!" : statusMessage}
              </h2>
              <p className="text-gray-500 text-sm mb-8">
                {phase === "delivered" 
                  ? "Enjoy your purchase! Thank you for choosing QUICK_STYLE."
                  : isHeadingToStore 
                    ? "The delivery partner is on their way to the boutique to pick up your order."
                    : "Your order is picked up and en route to your location!"}
              </p>

              {/* Status Timeline */}
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm ${phase === "delivered" ? 'bg-emerald-500 text-white' : 'bg-blue-600 text-white animate-pulse'}`}>
                    {phase === "delivered" ? <Check className="w-5 h-5" /> : <Truck className="w-5 h-5" />}
                  </div>
                </div>
              </div>
            </div>

            {/* Delivery Partner Card */}
            {partner && phase !== "delivered" && (
              <div className="p-6 bg-gray-50 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white rounded-full border shadow-sm flex items-center justify-center overflow-hidden p-1">
                      <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${partner.name}&backgroundColor=f1f5f9`} alt="Partner" className="w-full h-full rounded-full" />
                    </div>
                    <div>
                      <p className="font-extrabold text-gray-900 text-lg">{partner.name}</p>
                      <p className="text-sm text-gray-500 capitalize">{partner.vehicle} Delivery Partner</p>
                    </div>
                  </div>
                  <a href={`tel:${partner.phone}`} className="w-12 h-12 bg-[#5a1a1a] rounded-full flex items-center justify-center shadow-lg hover:bg-[#3d1111] transition-colors">
                    <Phone className="w-5 h-5 text-white fill-white" />
                  </a>
                </div>
              </div>
            )}
            
            {phase === "delivered" && (
              <div className="p-6 bg-emerald-50 text-emerald-800 text-center font-bold border-t border-emerald-100">
                🎉 Package delivered at {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
