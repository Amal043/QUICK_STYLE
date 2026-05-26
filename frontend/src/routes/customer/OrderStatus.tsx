import React, { useState, useEffect } from 'react';
import { Truck, Check, Store, Home, PackageSearch } from 'lucide-react';
import { GoogleMap, useJsApiLoader, Marker, DirectionsRenderer } from '@react-google-maps/api';
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

const scooterIconSvg = "M21.1 12.5l-2.2-2.2c-.3-.3-.7-.5-1.1-.5h-2.3l-2.1-4.2c-.2-.4-.6-.7-1.1-.7H8.8c-.8 0-1.5.7-1.5 1.5v5H5.8c-1.3 0-2.3 1-2.3 2.3v.5c0 1.2.9 2.2 2.1 2.3.2 1.3 1.3 2.3 2.6 2.3s2.4-1 2.6-2.3h5.4c.2 1.3 1.3 2.3 2.6 2.3 1.5 0 2.8-1.2 2.8-2.8v-1c0-.4-.2-.8-.5-1.1zM8.2 17.5c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5zm10.6 0c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5zm-5-4.2h-5v-7h3.5l1.5 3h1.8l1.3 2.6c.1.2.1.4.1.6v.8h-3.2z";

export default function OrderStatus() {
  const { originHub, activeOrderId } = useStore();

  const [progress, setProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(1);
  const [eta, setEta] = useState(12);
  const [statusMessage, setStatusMessage] = useState("Connecting with local courier network...");
  
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);

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

  // Fetch Route from Maps API for the "Swiggy Style Highlighted Route"
  useEffect(() => {
    if (!isLoaded || !activeOrderId) return;
    
    const directionsService = new window.google.maps.DirectionsService();
    directionsService.route(
      {
        origin: startCoords,
        destination: endCoords,
        travelMode: window.google.maps.TravelMode.TWO_WHEELER || window.google.maps.TravelMode.DRIVING
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirections(result);
        }
      }
    );
  }, [isLoaded, activeOrderId, startCoords, endCoords]);

  useEffect(() => {
    if (!activeOrderId) return;

    setProgress(0);
    setActiveStep(1);
    setEta(12);
    setStatusMessage("🤖 AI finding nearest vacant partner...");

    // WebSocket live coordinate receiver
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.hostname}:8000/ws/tracking/${activeOrderId}`;
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
  }, [activeOrderId]);

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
    <div className="max-w-3xl mx-auto bg-white border border-panelBorder rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 animate-fade-in relative overflow-hidden">
      
      {/* Delivery Success Confetti (Mocked with CSS) */}
      {progress === 100 && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-50">
          <div className="w-32 h-32 bg-emerald-500/20 rounded-full animate-ping"></div>
          <div className="absolute bg-emerald-500 text-white rounded-full p-4 shadow-2xl">
            <Check className="w-12 h-12" />
          </div>
        </div>
      )}

      {/* Top banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-50 p-2.5 rounded-xl border border-blue-100 flex items-center justify-center text-blue-600">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-gray-900">
              Live Order Tracking
            </h3>
            <p className="text-xs text-gray-500">
              Order Ref: <span className="text-blue-600 font-semibold">{activeOrderId}</span>
            </p>
          </div>
        </div>
        
        {/* Timer Countdown */}
        <div className={`border px-4 py-2 rounded-2xl flex items-center gap-2 ${progress === 100 ? 'bg-emerald-50 border-emerald-200' : 'bg-blue-50 border-blue-200'}`}>
          <span className={`w-2.5 h-2.5 rounded-full ${progress === 100 ? 'bg-emerald' : 'bg-blue-600 animate-pulse'}`}></span>
          <span className={`text-xs font-bold ${progress === 100 ? 'text-emerald-800' : 'text-blue-900'}`}>
            {progress === 100 ? 'DELIVERED!' : `ARRIVING IN ${eta} MINS`}
          </span>
        </div>
      </div>

      {/* Linear progress steps bar */}
      <div className="relative py-4">
        {/* Progress bar line base */}
        <div className="absolute top-[28px] left-[10%] right-[10%] h-[3px] bg-panelBorder rounded-full z-0">
          <div
            className="h-full bg-blue-600 transition-all duration-500 rounded-full"
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
              <p className={`text-xs font-bold transition-colors ${getStepLabelClass(1)}`}>Preparing</p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center space-y-2 text-center">
            <div className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-300 ${getStepIconClass(2)}`}>
              {isStepComplete(2) ? <Check className="w-4 h-4" /> : <Truck className="w-4 h-4" />}
            </div>
            <div className="space-y-0.5">
              <p className={`text-xs font-bold transition-colors ${getStepLabelClass(2)}`}>On the way</p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center space-y-2 text-center">
            <div className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-300 ${getStepIconClass(3)}`}>
              {progress === 100 ? <Check className="w-4 h-4" /> : <Home className="w-4 h-4" />}
            </div>
            <div className="space-y-0.5">
              <p className={`text-xs font-bold transition-colors ${getStepLabelClass(3)}`}>Delivered</p>
            </div>
          </div>

        </div>
      </div>

      {/* Live Map Box */}
      <div className="w-full relative overflow-hidden rounded-2xl border border-panelBorder h-[350px]">
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={locations.jadavpur}
            zoom={13}
            options={{
              disableDefaultUI: true,
              styles: [
                { elementType: 'geometry', stylers: [{ color: '#f5f5f5' }] },
                { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
                { elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
                { elementType: 'labels.text.stroke', stylers: [{ color: '#f5f5f5' }] },
                { featureType: 'administrative.land_parcel', elementType: 'labels.text.fill', stylers: [{ color: '#bdbdbd' }] },
                { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#eeeeee' }] },
                { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
                { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#e5e5e5' }] },
                { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#9e9e9e' }] },
                { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
                { featureType: 'road.arterial', elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
                { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#dadada' }] },
                { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
                { featureType: 'road.local', elementType: 'labels.text.fill', stylers: [{ color: '#9e9e9e' }] },
                { featureType: 'transit.line', elementType: 'geometry', stylers: [{ color: '#e5e5e5' }] },
                { featureType: 'transit.station', elementType: 'geometry', stylers: [{ color: '#eeeeee' }] },
                { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#c9c9c9' }] },
                { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#9e9e9e' }] }
              ]
            }}
          >
            {/* Swiggy Style Blue Route */}
            {directions && (
              <DirectionsRenderer 
                directions={directions} 
                options={{
                  suppressMarkers: true,
                  polylineOptions: {
                    strokeColor: '#2563eb', // Blue
                    strokeWeight: 5,
                    strokeOpacity: 0.8
                  }
                }} 
              />
            )}

            {/* Boutique Origin Marker */}
            <Marker
              position={startCoords}
              title={originHub}
              icon={{
                path: "M0-20 A10 10 0 0 0 -10 -10 C -10 -3 0 10 0 10 C 0 10 10 -3 10 -10 A10 10 0 0 0 0 -20 Z",
                fillColor: '#1e3a8a',
                fillOpacity: 1,
                strokeColor: '#FFFFFF',
                strokeWeight: 2,
                scale: 0.8
              }}
            />

            {/* Destination Marker */}
            <Marker
              position={endCoords}
              title="Jadavpur, Kolkata"
              icon={{
                path: "M0-20 A10 10 0 0 0 -10 -10 C -10 -3 0 10 0 10 C 0 10 10 -3 10 -10 A10 10 0 0 0 0 -20 Z",
                fillColor: '#10B981',
                fillOpacity: 1,
                strokeColor: '#FFFFFF',
                strokeWeight: 2,
                scale: 0.9
              }}
            />

            {/* Moving Courier Rider Marker */}
            {progress > 5 && progress < 100 && (
              <Marker
                position={courierPos}
                title="Courier Scooter Rider"
                icon={{
                  path: scooterIconSvg,
                  fillColor: '#2563eb',
                  fillOpacity: 1,
                  strokeColor: '#FFFFFF',
                  strokeWeight: 1,
                  scale: 1.5,
                  anchor: new window.google.maps.Point(12, 12)
                }}
              />
            )}
          </GoogleMap>
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-500">
            Loading Google Maps...
          </div>
        )}
        
        {/* Status Message Overlay */}
        <div className="absolute bottom-4 left-0 right-0 text-center z-20 pointer-events-none">
          <span className="text-[11px] bg-white border border-panelBorder px-4 py-2 rounded-full text-gray-900 font-bold shadow-lg">
            {statusMessage}
          </span>
        </div>
      </div>

    </div>
  );
}
