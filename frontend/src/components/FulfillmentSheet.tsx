import React, { useState, useEffect } from 'react';
import { Truck, Check, Bike, Store, Home, Compass } from 'lucide-react';
import { GoogleMap, useJsApiLoader, Marker, Polyline } from '@react-google-maps/api';

interface FulfillmentSheetProps {
  isOpen: boolean;
  onClose: () => void;
  originHub: string;
}

// Coordinates for simulation
const locations = {
  jamshedpur: { lat: 22.7766, lng: 86.1436 }, // NIT Jamshedpur Campus
  boutiqueA: { lat: 22.7820, lng: 86.1480 },  // Boutique A Hub
  boutiqueB: { lat: 22.7710, lng: 86.1360 },  // Boutique B Hub
  boutiqueC: { lat: 22.7790, lng: 86.1390 },  // Boutique C Hub
  boutiqueD: { lat: 22.7880, lng: 86.1550 }   // Boutique D Hub
};

const mapContainerStyle = {
  width: '100%',
  height: '180px',
  borderRadius: '16px'
};

export const FulfillmentSheet: React.FC<FulfillmentSheetProps> = ({
  isOpen,
  onClose,
  originHub
}) => {
  const [progress, setProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(1);
  const [eta, setEta] = useState(12);
  const [statusMessage, setStatusMessage] = useState("Connecting with local courier network...");
  const [orderRef, setOrderRef] = useState('FW-99201');

  // Google Maps Loader
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: "" // blank key for dev view sandbox
  });

  // Resolve current boutique coordinates
  const getBoutiqueCoords = () => {
    if (originHub.includes('Boutique B')) return locations.boutiqueB;
    if (originHub.includes('Boutique C')) return locations.boutiqueC;
    if (originHub.includes('Boutique D')) return locations.boutiqueD;
    return locations.boutiqueA;
  };

  const startCoords = getBoutiqueCoords();
  const endCoords = locations.jamshedpur;

  // Calculate live scooter position coordinates
  const courierLat = startCoords.lat + (endCoords.lat - startCoords.lat) * (progress / 100);
  const courierLng = startCoords.lng + (endCoords.lng - startCoords.lng) * (progress / 100);

  useEffect(() => {
    if (!isOpen) return;

    setProgress(0);
    setActiveStep(1);
    setEta(12);
    setStatusMessage("🤖 AI Stylist calibrating stock and fit sizing patterns...");
    setOrderRef(`FW-${Math.floor(100000 + Math.random() * 900000)}`);

    let timerId: any = null;
    let t2Id: any = null;

    const t1 = setTimeout(() => {
      setProgress(33);
      setActiveStep(2);
      setEta(10);
      setStatusMessage("🛍️ Boutique is packing your verified garments in magnetic seal-boxes...");

      t2Id = setTimeout(() => {
        setProgress(66);
        setActiveStep(3);
        setStatusMessage("🏍️ Local Courier dispatched! On route with premium electric scooter...");

        timerId = setInterval(() => {
          setEta((prev) => {
            if (prev <= 1) {
              clearInterval(timerId);
              setProgress(100);
              setStatusMessage("🏍️ Courier arrived at NIT Jamshedpur Main Gate!");
              return 0;
            }
            // Increment progress slowly along with ETA countdown
            setProgress((p) => Math.min(99, p + (100 - p) * 0.15));
            return prev - 1;
          });
        }, 3000);

      }, 3000);

    }, 3000);

    return () => {
      clearTimeout(t1);
      if (t2Id) clearTimeout(t2Id);
      if (timerId) clearInterval(timerId);
    };
  }, [isOpen, originHub]);

  if (!isOpen) return null;

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
    <div className="fixed bottom-0 left-0 right-0 z-50 glass-card border-t border-panelBorder shadow-[0_-10px_40px_rgba(0,0,0,0.1)] rounded-t-3xl transition-transform duration-500 select-none animate-slide-up">
      
      {/* Drag handle */}
      <div className="w-full flex justify-center py-3">
        <div className="w-12 h-1 rounded-full bg-panelBorder"></div>
      </div>

      <div className="max-w-4xl mx-auto px-6 pb-8 pt-2 space-y-6">
        
        {/* Top banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-coral/15 p-2 rounded-xl border border-coral/30 flex items-center justify-center text-coral">
              <Truck className="w-5 h-5 animate-bounce-slow" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-gray-900">
                Order Dispatched Successfully!
              </h3>
              <p className="text-xs text-gray-500">
                Order Ref: <span className="text-coral font-semibold">{orderRef}</span> • Delivery to <span className="text-gray-950 font-bold">NIT Jamshedpur Campus</span>
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
                <p className={`text-xs font-bold transition-colors ${getStepLabelClass(1)}`}>AI Parsing Stock</p>
                <p className="text-[9px] text-gray-500 font-medium">Calibrating Fit Model</p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center space-y-2 text-center">
              <div className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-300 ${getStepIconClass(2)}`}>
                {isStepComplete(2) ? <Check className="w-4 h-4" /> : <Store className="w-4 h-4" />}
              </div>
              <div className="space-y-0.5">
                <p className={`text-xs font-bold transition-colors ${getStepLabelClass(2)}`}>Boutique Packing</p>
                <p className="text-[9px] text-gray-500 font-medium">Sealing Magnetic Box</p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center space-y-2 text-center">
              <div className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-300 ${getStepIconClass(3)}`}>
                {progress === 100 ? <Check className="w-4 h-4" /> : <Bike className="w-4 h-4" />}
              </div>
              <div className="space-y-0.5">
                <p className={`text-xs font-bold transition-colors ${getStepLabelClass(3)}`}>Courier Dispatched</p>
                <p className="text-[9px] text-gray-500 font-medium">On route in {eta}m</p>
              </div>
            </div>

          </div>
        </div>

        {/* Live Map Box */}
        <div className="w-full relative overflow-hidden rounded-2xl border border-panelBorder">
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={locations.jamshedpur}
              zoom={14}
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

              {/* Destination campus Marker */}
              <Marker
                position={locations.jamshedpur}
                title="NIT Jamshedpur"
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
              {progress > 33 && (
                <Marker
                  position={{ lat: courierLat, lng: courierLng }}
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
            /* Backup premium SVG visual map representation if maps loader is pending/offline */
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
                    <p className="text-xs font-bold text-gray-900">NIT Jamshedpur</p>
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

        {/* Action Panel */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-white hover:bg-[#FAF8F5] border border-panelBorder text-xs text-gray-700 hover:text-gray-900 font-bold transition-all"
          >
            Close Track Sheet
          </button>
          <button
            onClick={() => alert('GPS Simulator: Courier coordinates calibrating at 1.2 Hz frequency.')}
            className="px-5 py-2.5 rounded-xl bg-[#10B981] hover:bg-[#10B981]/90 text-white text-xs font-extrabold tracking-wide uppercase transition-all shadow-lg shadow-emerald/10 flex items-center gap-1.5"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Calibrate GPS</span>
          </button>
        </div>

      </div>
    </div>
  );
};
