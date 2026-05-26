import React, { useEffect, useState, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Polyline } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '12px'
};

const center = {
  lat: 22.7815,
  lng: 86.1510
};

interface LiveTrackingMapProps {
  orderId: string;
}

export default function LiveTrackingMap({ orderId }: LiveTrackingMapProps) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  });

  const [riderPosition, setRiderPosition] = useState(center);
  const [route, setRoute] = useState([]);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Connect to WebSocket for live tracking
    ws.current = new WebSocket(`ws://localhost:8000/ws/tracking/${orderId}`);
    
    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.lat && data.lng) {
        setRiderPosition({ lat: data.lat, lng: data.lng });
        setRoute(prev => [...prev, { lat: data.lat, lng: data.lng }]);
      }
    };

    return () => {
      if (ws.current) ws.current.close();
    };
  }, [orderId]);

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={riderPosition}
      zoom={15}
      options={{
        disableDefaultUI: true,
        styles: [
          { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
          { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
          { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
          { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#38414e' }] },
          { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#212a37' }] },
          { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#9ca5b3' }] },
        ]
      }}
    >
      {/* Rider Marker */}
      <Marker
        position={riderPosition}
        icon={{
          url: 'https://cdn-icons-png.flaticon.com/512/2983/2983050.png',
          scaledSize: new window.google.maps.Size(40, 40)
        }}
      />
      
      {/* Route Traveled */}
      {route.length > 1 && (
        <Polyline
          path={route}
          options={{
            strokeColor: '#FF6B6B',
            strokeOpacity: 0.8,
            strokeWeight: 4,
          }}
        />
      )}
    </GoogleMap>
  ) : <div className="h-[400px] w-full bg-slate-800 animate-pulse rounded-xl" />;
}
