import React, { useState, useEffect, useRef } from 'react';
import { Truck, Check, Store, Home, PackageSearch, Phone } from 'lucide-react';
import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer, OverlayView } from '@react-google-maps/api';
import { useStore } from '../../store/useStore';

const locations = {
  jadavpur: { lat: 22.4981, lng: 88.3653 },
  boutiqueA: { lat: 22.5015, lng: 88.3616 },
  boutiqueB: { lat: 22.5555, lng: 88.3524 },
  boutiqueC: { lat: 22.5804, lng: 88.4231 },
  boutiqueD: { lat: 22.5726, lng: 88.4633 }
};

const scooterIconSvg = "M21.1 12.5l-2.2-2.2c-.3-.3-.7-.5-1.1-.5h-2.3l-2.1-4.2c-.2-.4-.6-.7-1.1-.7H8.8c-.8 0-1.5.7-1.5 1.5v5H5.8c-1.3 0-2.3 1-2.3 2.3v.5c0 1.2.9 2.2 2.1 2.3.2 1.3 1.3 2.3 2.6 2.3s2.4-1 2.6-2.3h5.4c.2 1.3 1.3 2.3 2.6 2.3 1.5 0 2.8-1.2 2.8-2.8v-1c0-.4-.2-.8-.5-1.1zM8.2 17.5c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5zm10.6 0c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5zm-5-4.2h-5v-7h3.5l1.5 3h1.8l1.3 2.6c.1.2.1.4.1.6v.8h-3.2z";

export default function OrderStatus() {
  const { originHub, activeOrderId } = useStore();

  const [phase, setPhase] = useState("assigning");
  const [statusMessage, setStatusMessage] = useState("Connecting with local courier network...");
  const [partner, setPartner] = useState<any>(null);
  
  const [dirPartnerToStore, setDirPartnerToStore] = useState<google.maps.DirectionsResult | null>(null);
  const [dirStoreToHome, setDirStoreToHome] = useState<google.maps.DirectionsResult | null>(null);
  const [etaText, setEtaText] = useState("CALCULATING");

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ""
  });

  const getBoutiqueCoords = () => {
    if (originHub.includes('Park Street')) return locations.boutiqueB;
    if (originHub.includes('Salt Lake')) return locations.boutiqueC;
    if (originHub.includes('New Town')) return locations.boutiqueD;
    return locations.boutiqueA;
  };

  const storeCoords = getBoutiqueCoords();
  const homeCoords = locations.jadavpur;
  
  // Dummy initial partner position for demo (slightly offset from store)
  const initialPartnerPos = { lat: storeCoords.lat - 0.005, lng: storeCoords.lng - 0.005 };

  const [courierPos] = useState({ lat: initialPartnerPos.lat, lng: initialPartnerPos.lng });
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerOverlayRef = useRef<any>(null); // Native OverlayView reference
  const animationRef = useRef<number>();
  
  // Custom Native Overlay for the Biker Marker to bypass React DOM lifecycle
  const createBikerOverlay = (map: google.maps.Map) => {
    class BikerOverlay extends window.google.maps.OverlayView {
      position: google.maps.LatLng;
      div: HTMLDivElement | null;
      rotation: number;

      constructor(position: google.maps.LatLng) {
        super();
        this.position = position;
        this.div = null;
        this.rotation = 0;
      }

      onAdd() {
        this.div = document.createElement('div');
        this.div.style.position = 'absolute';
        this.div.style.transform = 'translate(-50%, -50%)';
        this.div.style.display = 'flex';
        this.div.style.flexDirection = 'column';
        this.div.style.alignItems = 'center';
        
        // Add ETA bubble
        const etaBubble = document.createElement('div');
        etaBubble.className = 'bg-[#2C3440] text-white text-[11px] font-extrabold px-3 py-1.5 rounded-lg shadow-xl mb-1.5 whitespace-nowrap tracking-wide';
        etaBubble.id = 'eta-bubble';
        etaBubble.innerText = 'ETA: CALCULATING';
        this.div.appendChild(etaBubble);
        
        // Add the genuine background-less biker image we generated
        const img = document.createElement('img');
        img.src = '/images/biker_marker.png';
        img.style.width = '50px';
        img.style.height = '50px';
        img.style.transition = 'none'; // Controlled by JS
        img.style.filter = 'drop-shadow(0px 4px 6px rgba(0,0,0,0.4))';
        img.id = 'biker-img';
        
        this.div.appendChild(img);
        
        const panes = this.getPanes();
        panes?.overlayMouseTarget.appendChild(this.div);
      }

      draw() {
        if (!this.div) return;
        const overlayProjection = this.getProjection();
        const pos = overlayProjection.fromLatLngToDivPixel(this.position);
        if (pos) {
          this.div.style.left = pos.x + 'px';
          this.div.style.top = pos.y + 'px';
          // Rotate the image element itself, keep ETA bubble upright
          const img = this.div.querySelector('#biker-img') as HTMLImageElement;
          if (img) img.style.transform = `rotate(${this.rotation}deg)`;
        }
      }

      onRemove() {
        if (this.div) {
          this.div.parentNode?.removeChild(this.div);
          this.div = null;
        }
      }

      updatePosition(newLatLng: google.maps.LatLng, heading: number) {
        this.position = newLatLng;
        this.rotation = heading;
        this.draw();
      }
    }

    const overlay = new BikerOverlay(new window.google.maps.LatLng(initialPartnerPos.lat, initialPartnerPos.lng));
    overlay.setMap(map);
    return overlay;
  };

  const calculateBearing = (startLat: number, startLng: number, endLat: number, endLng: number) => {
    const dLng = (endLng - startLng) * Math.PI / 180;
    const lat1 = startLat * Math.PI / 180;
    const lat2 = endLat * Math.PI / 180;

    const y = Math.sin(dLng) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
    
    let brng = Math.atan2(y, x) * 180 / Math.PI;
    return (brng + 360) % 360;
  };

  // Fetch routes
  useEffect(() => {
    if (!isLoaded) return;
    const directionsService = new window.google.maps.DirectionsService();
    
    // Partner -> Store
    directionsService.route(
      { origin: initialPartnerPos, destination: storeCoords, travelMode: window.google.maps.TravelMode.DRIVING },
      (result, status) => { if (status === window.google.maps.DirectionsStatus.OK) setDirPartnerToStore(result); }
    );

    // Store -> Home
    directionsService.route(
      { origin: storeCoords, destination: homeCoords, travelMode: window.google.maps.TravelMode.DRIVING },
      (result, status) => { 
        if (status === window.google.maps.DirectionsStatus.OK && result) {
          setDirStoreToHome(result);
          const duration = result.routes[0]?.legs[0]?.duration?.text;
          if (duration) {
            setEtaText(duration.toUpperCase());
            // Update native overlay if it exists
            if (markerOverlayRef.current && markerOverlayRef.current.div) {
              const etaEl = markerOverlayRef.current.div.querySelector('#eta-bubble');
              if (etaEl) etaEl.innerText = `ETA: ${duration.toUpperCase()}`;
            }
          }
        }
      }
    );
  }, [isLoaded, storeCoords]);

  // Smooth animation function (Linear Interpolation + Bearing)
  const animateMarker = (routeParams: google.maps.DirectionsResult, durationMs: number) => {
    const route = routeParams.routes[0];
    if (!route || !markerOverlayRef.current) return;
    const path = route.overview_path;
    const startTime = performance.now();

    let lastLat = markerOverlayRef.current.position.lat();
    let lastLng = markerOverlayRef.current.position.lng();

    const animate = (currentTime: number) => {
      if (!markerOverlayRef.current) return;
      
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      
      const exactIdx = progress * (path.length - 1);
      const lowerIdx = Math.floor(exactIdx);
      const upperIdx = Math.min(lowerIdx + 1, path.length - 1);
      const t = exactIdx - lowerIdx;

      const p1 = path[lowerIdx];
      const p2 = path[upperIdx];

      const lat = p1.lat() + (p2.lat() - p1.lat()) * t;
      const lng = p1.lng() + (p2.lng() - p1.lng()) * t;

      // Calculate bearing dynamically
      const heading = calculateBearing(lastLat, lastLng, lat, lng);
      
      // Update our stored coords for the next frame's bearing calculation
      if (Math.abs(lat - lastLat) > 0.00001 || Math.abs(lng - lastLng) > 0.00001) {
          lastLat = lat;
          lastLng = lng;
      }

      // Mutate native element directly, bypassing React state
      const currentLatLng = new window.google.maps.LatLng(lat, lng);
      markerOverlayRef.current.updatePosition(currentLatLng, heading);
      
      // Smoothly pan map to follow
      if (mapRef.current) {
         mapRef.current.panTo(currentLatLng);
      }

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };
    
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    animationRef.current = requestAnimationFrame(animate);
  };

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
        if (data.partner) setPartner(data.partner);

        // Trigger animations based on phase
        if (data.phase === "heading_to_store" && dirPartnerToStore) {
          animateMarker(dirPartnerToStore, data.duration || 3000);
        } else if (data.phase === "delivering" && dirStoreToHome) {
          animateMarker(dirStoreToHome, data.duration || 4000);
        }
      } catch (err) {
        console.error('WebSocket msg error', err);
      }
    };

    return () => {
      ws.close();
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [activeOrderId, dirPartnerToStore, dirStoreToHome]);

  if (!activeOrderId) {
    return (
      <div className="max-w-3xl mx-auto bg-white border border-panelBorder rounded-3xl p-12 shadow-md flex flex-col items-center justify-center text-center mt-10">
        <PackageSearch className="w-16 h-16 text-gray-300 mb-4" />
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">No Active Orders</h2>
        <p className="text-gray-500">Place an order to see the live tracking experience.</p>
      </div>
    );
  }

  const isHeadingToStore = phase === "assigning" || phase === "heading_to_store" || phase === "packing";

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

        {/* 2-Column Layout for Laptop */}
        <div className="flex flex-col lg:flex-row">
          
          {/* Left: Map */}
          <div className="w-full lg:w-2/3 h-[500px] relative bg-gray-100 border-r border-gray-100">
            {isLoaded ? (
              <GoogleMap
                mapContainerStyle={{ width: '100%', height: '100%' }}
                center={courierPos}
                zoom={14}
                onLoad={map => { 
                  mapRef.current = map;
                  markerOverlayRef.current = createBikerOverlay(map);
                }}
                options={{
                  disableDefaultUI: true,
                  styles: [
                    { elementType: 'geometry', stylers: [{ color: '#f5f5f5' }] },
                    { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
                    { elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
                    { elementType: 'labels.text.stroke', stylers: [{ color: '#f5f5f5' }] },
                    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
                    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#c9c9c9' }] }
                  ]
                }}
              >
                {/* Store -> Home Route */}
                {dirStoreToHome && (
                  <DirectionsRenderer 
                    directions={dirStoreToHome} 
                    options={{ suppressMarkers: true, polylineOptions: { strokeColor: isHeadingToStore ? '#CBD5E1' : '#0066FF', strokeWeight: 6, strokeOpacity: 0.9 } }} 
                  />
                )}

                {/* Partner -> Store Route */}
                {isHeadingToStore && dirPartnerToStore && (
                  <DirectionsRenderer 
                    directions={dirPartnerToStore} 
                    options={{ suppressMarkers: true, polylineOptions: { strokeColor: '#0066FF', strokeWeight: 6, strokeOpacity: 0.9 } }} 
                  />
                )}

                <Marker position={storeCoords} icon={{ path: "M0-20 A10 10 0 0 0 -10 -10 C -10 -3 0 10 0 10 C 0 10 10 -3 10 -10 A10 10 0 0 0 0 -20 Z", fillColor: '#1e293b', fillOpacity: 1, strokeColor: '#fff', strokeWeight: 2, scale: 0.8 }} />
                <Marker position={homeCoords} icon={{ path: "M0-20 A10 10 0 0 0 -10 -10 C -10 -3 0 10 0 10 C 0 10 10 -3 10 -10 A10 10 0 0 0 0 -20 Z", fillColor: '#1e293b', fillOpacity: 1, strokeColor: '#fff', strokeWeight: 2, scale: 0.8 }} />

                {/* Removed React OverlayView to use our Native High-Performance Overlay instead! */}
              </GoogleMap>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 font-medium">Loading Interactive Map...</div>
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

