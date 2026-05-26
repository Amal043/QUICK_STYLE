import React, { useState, useEffect } from 'react';
import { Truck, Check, Bike, Store, Home, Compass } from 'lucide-react';
import { GoogleMap, useJsApiLoader, Marker, Polyline } from '@react-google-maps/api';
import { useStore } from '../../store/useStore';

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
  height: '350px',
  borderRadius: '16px'
};

export default function OrderStatus() {
  const { originHub } = useStore();

  const [progress, setProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(1);
  const [eta, setEta] = useState(12);
  const [statusMessage, setStatusMessage] = useState("Connecting with local courier network...");
  const [orderRef] = useState(`FW-${Math.floor(100000 + Math.random() * 900000)}`);

  // Google Maps Loader
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ""
  });

  // Resolve current boutique coordinates
  const getBoutiqueCoords = () => {
    if (originHub.includes('Park Street')) return locations.boutiqueB;
    if (originHub.includes('Salt Lake')) return locations.boutiqueC;
    if (originHub.includes('New Town')) return locations.boutiqueD;
    return locations.boutiqueA;
  };

  const startCoords = getBoutiqueCoords();
  const endCoords = locations.jadavpur;

  const [courierPos, setCourierPos] = useState({ lat: startCoords.lat, lng: startCoords.lng });

  // Update initial courier location when boutique changes
  useEffect(() => {
    setCourierPos({ lat: startCoords.lat, lng: startCoords.lng });
  }, [originHub]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('order_id') || 'demo-order';

    setProgress(0);
    setActiveStep(1);
    setEta(12);
    setStatusMessage("🤖 AI finding nearest vacant partner...");

    // WebSocket live coordinate receiver
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.hostname}:8000/ws/tracking/${orderId}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('Live tracking socket connected');
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
  }, [originHub]);

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
      return "border-coral bg-coral/5 animate-pulse-subtle text-coral";
    }
    return "bg-[#FAF8F5] border-panelBorder text-gray-400";
  };

  const getStepLabelClass = (step: number) => {
    if (isStepComplete(step)) return "text-emerald";
    if (activeStep === step) return "text-coral";
    return "text-gray-400";
  };

  return (
    <div className="max-w-3xl mx-auto bg-white border border-panelBorder rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 animate-fade-in">
      
      {/* Top banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-coral/15 p-2.5 rounded-xl border border-coral/30 flex items-center justify-center text-coral">
            <Truck className="w-5 h-5 animate-bounce-slow" />
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-gray-900">
              Order Tracking
            </h3>
            <p className="text-xs text-gray-500">
              Order Ref: <span className="text-coral font-semibold">{orderRef}</span> • Delivery to <span className="text-gray-950 font-bold">Jadavpur, Kolkata</span>
            </p>
          </div>
        </div>
        
        {/* Timer Countdown */}
        <div className="bg-[#E1F7EF] border border-[#10B981]/20 px-4 py-2 rounded-2xl flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald animate-pulse"></span>
          <span className="text-xs font-bold text-emerald-950">
            ETA: <span className="font-black text-sm">{eta === 0 ? "Arriving Now!" : `${eta} mins`}</span>
          </span>
        </div>
      </div>

      {/* Linear progress steps bar */}
      <div className="relative py-4">
        {/* Progress bar line base */}
        <div className="absolute top-[28px] left-[10%] right-[10%] h-[3px] bg-panelBorder rounded-full z-0">
          <div
            className="h-full bg-gradient-to-r from-coral via-coral to-emerald transition-all duration-500 rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Progress Steps */}
        <div className="relative z-10 flex justify-between px-[5%]">
          
          {/* Step 1 */}
          <div className="flex flex-col items-center space-y-2 text-center">
            <div className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-300 ${getStepIconClass(1)}`}>
              {isStepComplete(1) ? <Check className="w-4 h-4" /> : <Store className="w-4 h-4" />}
            </div>
            <div className="space-y-0.5">
              <p className={`text-xs font-bold transition-colors ${getStepLabelClass(1)}`}>Partner to Shop</p>
              <p className="text-[9px] text-gray-500 font-medium">Preparing Order</p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center space-y-2 text-center">
            <div className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-300 ${getStepIconClass(2)}`}>
              {isStepComplete(2) ? <Check className="w-4 h-4" /> : <Bike className="w-4 h-4" />}
            </div>
            <div className="space-y-0.5">
              <p className={`text-xs font-bold transition-colors ${getStepLabelClass(2)}`}>Out for Delivery</p>
              <p className="text-[9px] text-gray-500 font-medium">Shop to Home</p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center space-y-2 text-center">
            <div className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-300 ${getStepIconClass(3)}`}>
              {progress === 100 ? <Check className="w-4 h-4" /> : <Home className="w-4 h-4" />}
            </div>
            <div className="space-y-0.5">
              <p className={`text-xs font-bold transition-colors ${getStepLabelClass(3)}`}>Delivered</p>
              <p className="text-[9px] text-gray-500 font-medium">At your doorstep</p>
            </div>
          </div>

        </div>
      </div>

      {/* Live Map Box */}
      <div className="w-full relative overflow-hidden rounded-2xl border border-panelBorder">
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={locations.jadavpur}
            zoom={13}
            options={{
              disableDefaultUI: true,
              styles: [
                { elementType: 'geometry', stylers: [{ color: '#FAF8F5' }] },
                { elementType: 'labels.text.stroke', stylers: [{ color: '#FAF8F5' }] },
                { elementType: 'labels.text.fill', stylers: [{ color: '#6B7280' }] },
                { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#EAE6DF' }] },
                { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#FAF8F5' }] },
                { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#E3F2FD' }] }
              ]
            }}
          >
            {/* Boutique Origin Marker */}
            <Marker
              position={startCoords}
              title={originHub}
              icon={{
                path: "M 0,-10 L 10,10 L -10,10 Z",
                fillColor: '#C5A880',
                fillOpacity: 1,
                strokeColor: '#FFFFFF',
                strokeWeight: 1,
                scale: 0.8
              }}
            />

            {/* Destination Marker */}
            <Marker
              position={endCoords}
              title="Jadavpur, Kolkata"
              icon={{
                path: "M0-20 A10 10 0 0 0 -10 -10 C -10 -3 0 10 0 10 C 0 10 10 -3 10 -10 A10 10 0 0 0 0 -20 Z",
                fillColor: '#5C1324',
                fillOpacity: 1,
                strokeColor: '#FFFFFF',
                strokeWeight: 1.5,
                scale: 0.9
              }}
            />

            {/* Moving Courier Rider Marker */}
            {progress > 5 && (
              <Marker
                position={courierPos}
                title="Courier Scooter Rider"
                icon={{
                  path: "M -5,-5 L 5,-5 L 5,5 L -5,5 Z",
                  fillColor: '#10B981',
                  fillOpacity: 1,
                  strokeColor: '#FFFFFF',
                  strokeWeight: 1,
                  scale: 1
                }}
              />
            )}

            {/* Dotted polyline representing the routing track */}
            <Polyline
              path={[startCoords, endCoords]}
              options={{
                strokeColor: '#5C1324',
                strokeOpacity: 0.8,
                strokeWeight: 2.5,
                geodesic: true
              }}
            />
          </GoogleMap>
        ) : (
          /* Backup SVG map representation if maps loader is pending/offline */
          <div className="h-44 w-full bg-white border border-panelBorder p-4 flex items-center justify-between relative rounded-xl overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(197,168,128,0.06)_10%,transparent_70%)]"></div>
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.015)_1px,transparent_1px)] bg-[size:16px_16px]"></div>

            <div className="relative z-10 w-full flex items-center justify-between px-6">
              <div className="flex items-center gap-3">
                <div className="bg-[#FAF8F5] border border-panelBorder p-2.5 rounded-xl text-coral">
                  <Store className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Origin</p>
                  <p className="text-xs font-bold text-gray-900">{originHub}</p>
                </div>
              </div>

              <div className="flex-1 mx-4 relative h-6 flex items-center justify-center">
                <div className="w-full h-[1px] border-t border-dashed border-panelBorder"></div>
                <div
                  className="absolute transform -translate-x-1/2 bg-coral border-2 border-white p-1 rounded-full text-white shadow-lg transition-all duration-[3000ms] ease-out"
                  style={{ left: `${Math.min(90, progress * 0.9)}%` }}
                >
                  <Bike className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Destination</p>
                  <p className="text-xs font-bold text-gray-900">Jadavpur</p>
                </div>
                <div className="bg-white border border-panelBorder p-2.5 rounded-xl text-emerald">
                  <Home className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="absolute bottom-2 left-0 right-0 text-center z-20">
          <span className="text-[9px] bg-[#FAF8F5]/90 border border-panelBorder px-2.5 py-1 rounded text-gray-700 uppercase tracking-widest font-bold">
            {statusMessage}
          </span>
        </div>
      </div>

    </div>
  );
}
