"use client";

import { useState } from 'react';
import MapboxMap, { Marker, NavigationControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Truck, MapPin } from 'lucide-react';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export default function Map() {
  // Centrado por defecto en la Ciudad de Panamá
  const [viewState, setViewState] = useState({
    longitude: -79.5199, 
    latitude: 8.9824,
    zoom: 12.5,
    pitch: 45 // Le damos una vista 3D ligera
  });

  // Datos simulados de conductores en vivo (Fase 4: Se leerán de Supabase)
  const drivers = [
    { id: 'd1', name: 'Michael T.', lat: 8.9850, lng: -79.5210, status: 'moving' },
    { id: 'd2', name: 'Sarah K.', lat: 8.9700, lng: -79.5100, status: 'idle' },
    { id: 'd3', name: 'Emma W.', lat: 8.9950, lng: -79.5350, status: 'moving' },
  ];

  // Datos simulados de entregas pendientes
  const packages = [
    { id: 'p1', lat: 8.9900, lng: -79.5300, status: 'pending' },
    { id: 'p2', lat: 8.9750, lng: -79.5000, status: 'pending' },
    { id: 'p3', lat: 8.9800, lng: -79.5250, status: 'pending' },
  ];

  if (!MAPBOX_TOKEN) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-slate-900 border border-slate-800 rounded-xl text-slate-400 p-8 text-center">
        Error: Token de Mapbox no configurado en variables de entorno.
      </div>
    );
  }

  return (
    <div className="h-full w-full rounded-xl overflow-hidden border border-slate-800 relative shadow-[0_0_30px_rgba(0,0,0,0.5)]">
      <MapboxMap
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/dark-v11"
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: '100%', height: '100%' }}
      >
        <NavigationControl position="bottom-right" />

        {/* Renderizar Conductores */}
        {drivers.map(driver => (
          <Marker key={driver.id} longitude={driver.lng} latitude={driver.lat} anchor="center">
            <div className="relative group cursor-pointer">
              <div className="bg-teal-400 p-2 rounded-full shadow-[0_0_15px_rgba(45,212,191,0.6)] animate-pulse">
                <Truck size={16} className="text-slate-950" />
              </div>
              {/* Tooltip Hover */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 text-white text-xs px-3 py-1.5 rounded-lg border border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 shadow-xl font-medium">
                {driver.name}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
              </div>
            </div>
          </Marker>
        ))}

        {/* Renderizar Entregas */}
        {packages.map(pkg => (
          <Marker key={pkg.id} longitude={pkg.lng} latitude={pkg.lat} anchor="bottom">
            <div className="text-rose-500 drop-shadow-lg cursor-pointer hover:scale-110 transition-transform">
              <MapPin size={32} className="fill-slate-900" />
            </div>
          </Marker>
        ))}

      </MapboxMap>
    </div>
  );
}
