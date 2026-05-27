import React, { useState, useEffect } from 'react';
import { Truck, Check, Store, Home, PackageSearch, Phone, MessageSquare, MapPin, Navigation } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useStore } from '../../store/useStore';
import { getPreciseLocation } from '../../lib/geolocation';

// Coordinates for simulation
const locations = {
  jadavpur: { lat: 22.4981, lng: 88.3653 }, // User Address (Jadavpur)
  boutiqueA: { lat: 22.5015, lng: 88.3616 }, // South City Luxe
  boutiqueB: { lat: 22.5555, lng: 88.3524 }, // Park Street
  boutiqueC: { lat: 22.5804, lng: 88.4231 }, // Salt Lake
  boutiqueD: { lat: 22.5726, lng: 88.4633 }  // New Town
};

const mapContainerStyle = {
  width: '100%',
  height: '480px',
  borderRadius: '24px'
};

const scooterIconSvg = "M21.1 12.5l-2.2-2.2c-.3-.3-.7-.5-1.1-.5h-2.3l-2.1-4.2c-.2-.4-.6-.7-1.1-.7H8.8c-.8 0-1.5.7-1.5 1.5v5H5.8c-1.3 0-2.3 1-2.3 2.3v.5c0 1.2.9 2.2 2.1 2.3.2 1.3 1.3 2.3 2.6 2.3s2.4-1 2.6-2.3h5.4c.2 1.3 1.3 2.3 2.6 2.3 1.5 0 2.8-1.2 2.8-2.8v-1c0-.4-.2-.8-.5-1.1zM8.2 17.5c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5zm10.6 0c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5zm-5-4.2h-5v-7h3.5l1.5 3h1.8l1.3 2.6c.1.2.1.4.1.6v.8h-3.2z";

export default function OrderStatus() {
  const { originHub, activeOrderId, userCoords: storeCoordsVal, setUserCoords } = useStore();

  const [progress, setProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(1);
  const [eta, setEta] = useState(12);
  const [statusMessage, setStatusMessage] = useState("Connecting with local courier network...");
  
  // DOM references for Leaflet Map
  const mapContainerRef = React.useRef<HTMLDivElement | null>(null);
  const mapRef = React.useRef<L.Map | null>(null);
  const startMarkerRef = React.useRef<L.Marker | null>(null);
  const endMarkerRef = React.useRef<L.Marker | null>(null);
  const courierMarkerRef = React.useRef<L.Marker | null>(null);
  const polylineRef = React.useRef<L.Polyline | null>(null);

  // Dynamic user coordinates state (reads from store, falls back to Jadavpur)
  const [userCoords, setUserCoordsLocal] = useState({ 
    lat: storeCoordsVal?.lat ?? 22.4981, 
    lng: storeCoordsVal?.lng ?? 88.3653 
  });
  const [coordsLoading, setCoordsLoading] = useState(false);
  const [locationPermission, setLocationPermission] = useState<'prompt' | 'granted' | 'denied'>(
    storeCoordsVal ? 'granted' : 'prompt'
  );
  const [roadWaypoints, setRoadWaypoints] = useState<[number, number][]>([]);

  // Synchronize state and check navigator permission on mount
  useEffect(() => {
    if (storeCoordsVal) {
      setUserCoordsLocal({ lat: storeCoordsVal.lat, lng: storeCoordsVal.lng });
      setLocationPermission('granted');
      return;
    }
    // Check if permission is already granted in the browser
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        if (result.state === 'granted') {
          handleRequestLocation();
        } else if (result.state === 'denied') {
          setLocationPermission('denied');
        }
      }).catch(err => {
        console.warn("Navigator permissions query error:", err);
      });
    }
  }, [storeCoordsVal]);

  const fetchIPLocation = async (active: boolean) => {
    // 1. Try freeipapi.com (unlimited, fast, CORS-friendly)
    try {
      console.log("[GEOLOCATION] Attempting freeipapi.com...");
      const resp = await fetch('https://freeipapi.com/api/json');
      if (resp.ok) {
        const data = await resp.json();
        if (data.latitude && data.longitude && active) {
          console.log(`[GEOLOCATION] freeipapi.com fetched: lat=${data.latitude}, lng=${data.longitude}`);
          setUserCoordsLocal({ lat: data.latitude, lng: data.longitude });
          setUserCoords({ lat: data.latitude, lng: data.longitude });
          setCoordsLoading(false);
          setLocationPermission('granted');
          return true;
        }
      }
    } catch (e) {
      console.warn("[GEOLOCATION] freeipapi.com failed:", e);
    }

    // 2. Try ipapi.co (standard fallback)
    try {
      console.log("[GEOLOCATION] Attempting ipapi.co...");
      const resp = await fetch('https://ipapi.co/json/');
      if (resp.ok) {
        const data = await resp.json();
        if (data.latitude && data.longitude && active) {
          console.log(`[GEOLOCATION] ipapi.co fetched: lat=${data.latitude}, lng=${data.longitude}`);
          setUserCoordsLocal({ lat: data.latitude, lng: data.longitude });
          setUserCoords({ lat: data.latitude, lng: data.longitude });
          setCoordsLoading(false);
          setLocationPermission('granted');
          return true;
        }
      }
    } catch (e) {
      console.warn("[GEOLOCATION] ipapi.co failed:", e);
    }

    // 3. Try ipinfo.io (final API fallback)
    try {
      console.log("[GEOLOCATION] Attempting ipinfo.io...");
      const resp = await fetch('https://ipinfo.io/json');
      if (resp.ok) {
        const data = await resp.json();
        if (data.loc && active) {
          const [latStr, lngStr] = data.loc.split(',');
          const lat = parseFloat(latStr);
          const lng = parseFloat(lngStr);
          console.log(`[GEOLOCATION] ipinfo.io fetched: lat=${lat}, lng=${lng}`);
          setUserCoordsLocal({ lat, lng });
          setUserCoords({ lat, lng });
          setCoordsLoading(false);
          setLocationPermission('granted');
          return true;
        }
      }
    } catch (e) {
      console.warn("[GEOLOCATION] ipinfo.io failed:", e);
    }

    return false;
  };

  const handleRequestLocation = () => {
    setCoordsLoading(true);
    
    getPreciseLocation(
      (coords) => {
        const { lat, lng } = coords;
        console.log(`[GEOLOCATION] Device coordinates fetched: lat=${lat}, lng=${lng}`);
        setUserCoordsLocal({ lat, lng });
        setUserCoords({ lat, lng });
        setCoordsLoading(false);
        setLocationPermission('granted');
      },
      async (error) => {
        console.warn("[GEOLOCATION] Browser geolocation failed, Error:", error.message);
        if (error.code === error.PERMISSION_DENIED) {
          setLocationPermission('denied');
          setCoordsLoading(false);
        } else {
          const success = await fetchIPLocation(true);
          if (!success) {
            console.log("[GEOLOCATION] IP fallback failed, using default (Jadavpur)");
            setUserCoordsLocal({ lat: 22.4981, lng: 88.3653 });
            setUserCoords({ lat: 22.4981, lng: 88.3653 });
            setCoordsLoading(false);
            setLocationPermission('granted');
          }
        }
      }
    );
  };

  // Resolve current boutique coordinates
  const getBoutiqueCoords = () => {
    if (originHub.includes('Park Street')) return locations.boutiqueB;
    if (originHub.includes('Salt Lake')) return locations.boutiqueC;
    if (originHub.includes('New Town')) return locations.boutiqueD;
    return locations.boutiqueA;
  };

  const startCoords = React.useMemo(() => {
    const defaultStore = getBoutiqueCoords();
    const latDiff = Math.abs(userCoords.lat - 22.50);
    const lngDiff = Math.abs(userCoords.lng - 88.36);
    if (latDiff > 0.5 || lngDiff > 0.5) {
      // Place store ~1.2 km north-west of the user
      return { lat: userCoords.lat + 0.008, lng: userCoords.lng - 0.01 };
    }
    return defaultStore;
  }, [userCoords, originHub]);

  const endCoords = userCoords;

  const [courierPos, setCourierPos] = useState({ lat: startCoords.lat, lng: startCoords.lng });

  // Update initial courier location when boutique changes
  useEffect(() => {
    setCourierPos({ lat: startCoords.lat, lng: startCoords.lng });
  }, [startCoords]);

  // Fetch OSRM road route between Boutique and User
  useEffect(() => {
    if (locationPermission !== 'granted') return;
    
    const fetchRoadRoute = async () => {
      try {
        console.log(`[OSRM] Fetching client route: ${startCoords.lat},${startCoords.lng} -> ${endCoords.lat},${endCoords.lng}`);
        const url = `https://router.project-osrm.org/route/v1/driving/${startCoords.lng},${startCoords.lat};${endCoords.lng},${endCoords.lat}?overview=full&geometries=geojson`;
        const resp = await fetch(url);
        if (resp.ok) {
          const data = await resp.json();
          if (data.routes && data.routes.length > 0) {
            const coords = data.routes[0].geometry.coordinates; // [[lng, lat], ...]
            const waypoints: [number, number][] = coords.map((c: any) => [c[1], c[0]]); // [lat, lng]
            console.log(`[OSRM] Successfully fetched ${waypoints.length} route coordinates.`);
            setRoadWaypoints(waypoints);
          }
        }
      } catch (err) {
        console.error("[OSRM] Client-side route fetching failed:", err);
      }
    };

    fetchRoadRoute();
  }, [startCoords, endCoords, locationPermission]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (locationPermission !== 'granted') return;
    if (!mapContainerRef.current || mapRef.current) return;

    console.log("[MAP] Initializing Leaflet map...");
    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false
    }).setView([endCoords.lat, endCoords.lng], 14);

    // CartoDB Positron clean map tiles (completely free, modern light layout)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19
    }).addTo(map);

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        console.log("[MAP] Cleaning up Leaflet map...");
        mapRef.current.remove();
        mapRef.current = null;
        startMarkerRef.current = null;
        endMarkerRef.current = null;
        polylineRef.current = null;
        courierMarkerRef.current = null;
      }
    };
  }, [locationPermission]);

  // Update Markers, Route and Fit Bounds dynamically
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Fit bounds to show both boutique and user location dynamically
    const bounds = L.latLngBounds([
      [startCoords.lat, startCoords.lng],
      [endCoords.lat, endCoords.lng]
    ]);
    map.fitBounds(bounds, { padding: [50, 50] });

    // 1. Boutique Origin Marker
    if (startMarkerRef.current) {
      startMarkerRef.current.setLatLng([startCoords.lat, startCoords.lng]);
    } else {
      const storeDivIcon = L.divIcon({
        html: `
          <div class="relative flex items-center justify-center w-8 h-8 rounded-full bg-gray-900 border-2 border-[#C5A880] shadow-lg text-[#C5A880]">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-store"><path d="m2 7 4.41-3.67A2 2 0 0 1 7.73 2.78L12 7h0l4.27-4.22a2 2 0 0 1 1.32-.55L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M7 12h10"/><path d="M12 22v-4"/></svg>
          </div>
        `,
        className: '',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });
      startMarkerRef.current = L.marker([startCoords.lat, startCoords.lng], { icon: storeDivIcon })
        .addTo(map)
        .bindPopup(`<b>${originHub}</b>`);
    }

    // 2. Customer Destination Marker
    if (endMarkerRef.current) {
      endMarkerRef.current.setLatLng([endCoords.lat, endCoords.lng]);
    } else {
      const homeDivIcon = L.divIcon({
        html: `
          <div class="relative flex items-center justify-center w-8 h-8">
            <div class="absolute inset-0 rounded-full bg-[#fc8019] opacity-25 animate-ping"></div>
            <div class="relative flex items-center justify-center w-6 h-6 rounded-full bg-[#fc8019] border-2 border-white shadow-lg text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-home"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            </div>
          </div>
        `,
        className: '',
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });
      endMarkerRef.current = L.marker([endCoords.lat, endCoords.lng], { icon: homeDivIcon })
        .addTo(map)
        .bindPopup('<b>Your Location</b>');
    }

    // 3. Moving Courier Marker
    if (progress > 5 && progress < 100) {
      if (courierMarkerRef.current) {
        courierMarkerRef.current.setLatLng([courierPos.lat, courierPos.lng]);
      } else {
        const courierDivIcon = L.divIcon({
          html: `
            <div class="relative flex items-center justify-center w-9 h-9 bg-[#fc8019] border-2 border-white rounded-full shadow-xl text-white transform hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-bike"><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm-3 11.5V14l-3-3 4-3 2 3h4"/></svg>
            </div>
          `,
          className: '',
          iconSize: [36, 36],
          iconAnchor: [18, 18]
        });
        courierMarkerRef.current = L.marker([courierPos.lat, courierPos.lng], { icon: courierDivIcon })
          .addTo(map)
          .bindPopup('<b>Courier Scooter Rider</b>');
      }
    } else {
      if (courierMarkerRef.current) {
        courierMarkerRef.current.remove();
        courierMarkerRef.current = null;
      }
    }

    // 4. Draw route path polyline (Swiggy / Quick Style orange color)
    const latlngs: [number, number][] = roadWaypoints.length > 0
      ? roadWaypoints
      : [
          [startCoords.lat, startCoords.lng],
          [endCoords.lat, endCoords.lng]
        ];

    if (polylineRef.current) {
      polylineRef.current.setLatLngs(latlngs);
    } else {
      polylineRef.current = L.polyline(latlngs, {
        color: '#fc8019',
        weight: 6,
        opacity: 0.9
      }).addTo(map);
    }
  }, [startCoords, endCoords, courierPos, progress, originHub, roadWaypoints]);

  useEffect(() => {
    if (!activeOrderId || coordsLoading || locationPermission !== 'granted') return;

    setProgress(0);
    setActiveStep(1);
    setEta(12);
    setStatusMessage("🤖 AI finding nearest vacant partner...");

    // WebSocket live coordinate receiver with dynamic client and store coordinates as query params
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.hostname}:8000/ws/tracking/${activeOrderId}?lat=${userCoords.lat}&lng=${userCoords.lng}&store_lat=${startCoords.lat}&store_lng=${startCoords.lng}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('Live tracking socket connected with query params');
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setProgress(data.progress);
        setEta(data.eta_minutes);
        setStatusMessage(data.status);
        if (data.lat && data.lng) {
            setCourierPos({ lat: data.lat, lng: data.lng });
        }

        if (data.progress < 45) {
          setActiveStep(1);
        } else if (data.progress < 95) {
          setActiveStep(2);
        } else {
          setActiveStep(3);
        }
      } catch (err) {
        console.error('Failed to parse WebSocket message', err);
      }
    };

    ws.onerror = (err) => {
      console.error('WebSocket connection error:', err);
    };

    ws.onclose = () => {
      console.log('Live tracking socket closed');
    };

    return () => {
      ws.close();
    };
  }, [activeOrderId, coordsLoading, userCoords, locationPermission]);

  if (!activeOrderId) {
    return (
      <div className="max-w-3xl mx-auto bg-white border border-panelBorder rounded-3xl p-12 shadow-md flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-6 border border-gray-100">
          <PackageSearch className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-gray-900 mb-2">No Active Orders</h2>
        <p className="text-gray-500 max-w-sm">Place an order to see live delivery tracking and ETA here.</p>
      </div>
    );
  }

  if (locationPermission !== 'granted') {
    return (
      <div className="max-w-3xl mx-auto bg-white border border-panelBorder rounded-3xl p-12 shadow-2xl flex flex-col items-center justify-center text-center space-y-6 animate-fade-in my-8">
        <div className="w-20 h-20 bg-[#fff1e6] rounded-full flex items-center justify-center text-[#fc8019] mb-4 border border-orange-100 animate-pulse">
          <MapPin className="w-10 h-10" />
        </div>
        <span className="text-[10px] font-black tracking-wider uppercase bg-[#fff1e6] text-[#fc8019] px-2.5 py-1 rounded-md">
          Location Access Required
        </span>
        <h2 className="text-2xl font-black text-gray-900">Enable Live Tracking</h2>
        <p className="text-gray-500 max-w-md leading-relaxed text-sm">
          Please share your location access to display your live delivery route, track the courier on the street, and calculate your 12-minute ETA.
        </p>
        <button
          onClick={handleRequestLocation}
          disabled={coordsLoading}
          className="px-8 py-3.5 bg-[#fc8019] hover:bg-[#e07016] text-white rounded-2xl font-bold tracking-wide shadow-lg shadow-orange-500/10 hover:shadow-orange-500/20 active:scale-[0.98] transition-all flex items-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          <Navigation className="w-4 h-4 fill-white" />
          {coordsLoading ? "Requesting..." : "Share Location Access"}
        </button>
        {locationPermission === 'denied' && (
          <div className="bg-red-50 text-coral border border-red-100 rounded-2xl p-4 text-xs font-semibold max-w-md">
            ⚠️ Geolocation permission was blocked. Please reset site permissions in your browser's address bar settings and click "Share Location Access" again.
          </div>
        )}
      </div>
    );
  }

  const isStepComplete = (step: number) => {
    if (progress >= 100) return true;
    return activeStep > step;
  };

  const getStepIconClass = (step: number) => {
    const isCompleted = isStepComplete(step);
    const isActive = activeStep === step;

    if (isCompleted) {
      return "bg-emerald-dark/10 border-emerald text-emerald";
    }
    if (isActive) {
      return "border-blue-600 bg-blue-50 text-blue-600 animate-pulse-subtle";
    }
    return "bg-[#FAF8F5] border-panelBorder text-gray-400";
  };

  const getStepLabelClass = (step: number) => {
    if (isStepComplete(step)) return "text-emerald";
    if (activeStep === step) return "text-blue-600";
    return "text-gray-400";
  };

  return (
    <div className="max-w-6xl mx-auto bg-white border border-panelBorder rounded-3xl p-6 md:p-8 shadow-2xl animate-fade-in relative overflow-hidden">
      
      {/* Quick Style Confetti Banner on Success */}
      {progress === 100 && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-50 bg-white/90 backdrop-blur-sm transition-all duration-500">
          <div className="text-center space-y-4 max-w-sm p-6 bg-white border border-emerald-200 rounded-3xl shadow-2xl pointer-events-auto">
            <div className="w-20 h-20 bg-emerald-100 text-emerald rounded-full flex items-center justify-center mx-auto border-2 border-emerald-400 animate-bounce">
              <Check className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-gray-900">Order Delivered!</h2>
            <p className="text-xs text-gray-500">Your fashion boutique items have been successfully delivered. Thank you for shopping with us!</p>
          </div>
        </div>
      )}

      {/* Main split grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Panel: Stats and Valet */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
          <div className="space-y-6">
            {/* Header info */}
            <div className="flex items-start justify-between border-b pb-4 border-gray-100">
              <div>
                <span className="text-[10px] font-black tracking-wider uppercase bg-[#fff1e6] text-[#fc8019] px-2.5 py-1 rounded-md">
                  Quick Style Tracking
                </span>
                <h3 className="font-extrabold text-2xl text-gray-900 mt-2">
                  Live Courier Status
                </h3>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Order ID: <span className="font-bold text-[#fc8019]">{activeOrderId}</span>
                </p>
              </div>
              <span className="flex h-3.5 w-3.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
              </span>
            </div>

            {/* ETA Panel */}
            <div className="bg-gradient-to-br from-[#fff7f0] to-[#faf8f5] p-5 rounded-3xl border border-orange-100/50 space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Estimated Arrival</span>
                <span className="text-[9px] bg-[#fc8019] text-white px-2 py-0.5 rounded font-black tracking-wider uppercase animate-pulse">
                  LIVE
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-5xl font-black text-gray-900">{progress === 100 ? '0' : eta}</span>
                <span className="text-lg font-extrabold text-gray-800">mins</span>
              </div>
              <p className="text-xs font-bold text-gray-600 flex items-center gap-1.5 mt-1">
                <span className="w-2 h-2 rounded-full bg-[#fc8019] animate-pulse"></span>
                {statusMessage}
              </p>
            </div>

            {/* Step Milestone Bar */}
            <div className="space-y-4 pt-2">
              <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider pl-1">Delivery Stages</h4>
              
              <div className="relative pl-6 space-y-6 border-l-2 border-dashed border-orange-100">
                {/* Stage 1 */}
                <div className="relative">
                  <div className={`absolute -left-[31px] top-0 w-4 h-4 rounded-full border-2 transition-all duration-300 ${activeStep >= 1 ? 'bg-[#fc8019] border-[#fc8019] scale-110 shadow-sm' : 'bg-white border-gray-200'}`}></div>
                  <div className="pl-2">
                    <p className={`text-xs font-extrabold transition-colors ${activeStep >= 1 ? 'text-gray-900' : 'text-gray-400'}`}>Order Confirmed</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Boutique preparing your premium items</p>
                  </div>
                </div>

                {/* Stage 2 */}
                <div className="relative">
                  <div className={`absolute -left-[31px] top-0 w-4 h-4 rounded-full border-2 transition-all duration-300 ${activeStep >= 2 ? 'bg-[#fc8019] border-[#fc8019] scale-110 shadow-sm' : 'bg-white border-gray-200'}`}></div>
                  <div className="pl-2">
                    <p className={`text-xs font-extrabold transition-colors ${activeStep >= 2 ? 'text-gray-900' : 'text-gray-400'}`}>Out for Delivery</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Courier partner heading to your location</p>
                  </div>
                </div>

                {/* Stage 3 */}
                <div className="relative">
                  <div className={`absolute -left-[31px] top-0 w-4 h-4 rounded-full border-2 transition-all duration-300 ${progress === 100 ? 'bg-emerald border-emerald scale-110 shadow-sm' : 'bg-white border-gray-200'}`}></div>
                  <div className="pl-2">
                    <p className={`text-xs font-extrabold transition-colors ${progress === 100 ? 'text-emerald' : 'text-gray-400'}`}>Delivered</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Delivery successfully handed over</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Valet profile info */}
          <div className="bg-gray-50 border border-panelBorder p-4 rounded-2xl flex items-center justify-between gap-3 shadow-inner">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-orange-100 text-[#fc8019] border border-orange-200 flex items-center justify-center font-extrabold text-sm shadow-sm">
                VS
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-gray-800">Vikram Singh</h4>
                <p className="text-[11px] text-gray-500 font-semibold mt-0.5">Delivery Partner • ★ 4.9</p>
                <p className="text-[10px] text-gray-400 font-medium mt-0.5">Scooter: WB-02-5819</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <a href="tel:+919876543210" className="p-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 shadow-sm transition-all flex items-center justify-center">
                <Phone className="w-4 h-4 text-gray-500" />
              </a>
              <button className="p-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 shadow-sm transition-all flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel: Map */}
        <div className="lg:col-span-7 relative">
          <div className="w-full relative overflow-hidden rounded-3xl border border-panelBorder h-[480px] shadow-xl">
            <div ref={mapContainerRef} style={mapContainerStyle} className="shadow-inner w-full h-full" />
            
            {/* Status Message Overlay */}
            <div className="absolute bottom-4 left-0 right-0 text-center z-20 pointer-events-none">
              <span className="text-[11px] bg-white border border-panelBorder px-4 py-2 rounded-full text-gray-900 font-bold shadow-lg">
                {statusMessage}
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
