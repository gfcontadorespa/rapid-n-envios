"use client";

import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export default function Map() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || !MAPBOX_TOKEN) return;
    
    mapboxgl.accessToken = MAPBOX_TOKEN;
    
    if (!map.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [-79.5199, 8.9824],
        zoom: 12.5,
        pitch: 45
      });
      
      map.current.addControl(new mapboxgl.NavigationControl(), 'bottom-right');
      
      // Drivers
      const drivers = [
        { id: 'd1', name: 'Michael T.', lat: 8.9850, lng: -79.5210 },
        { id: 'd2', name: 'Sarah K.', lat: 8.9700, lng: -79.5100 },
      ];
      
      drivers.forEach(d => {
        const el = document.createElement('div');
        el.className = 'bg-teal-400 p-2 rounded-full shadow-[0_0_15px_rgba(45,212,191,0.6)] animate-pulse flex items-center justify-center text-slate-950 w-8 h-8';
        el.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 17h4V5H2v12h3"/><path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5"/><path d="M14 17h1"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>';
        new mapboxgl.Marker(el).setLngLat([d.lng, d.lat]).addTo(map.current!);
      });

      // Packages
      const packages = [
        { id: 'p1', lat: 8.9900, lng: -79.5300 },
        { id: 'p2', lat: 8.9750, lng: -79.5000 },
      ];
      packages.forEach(p => {
        const el = document.createElement('div');
        el.className = 'text-rose-500 drop-shadow-lg';
        el.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="fill-slate-900"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>';
        new mapboxgl.Marker({ anchor: 'bottom', element: el }).setLngLat([p.lng, p.lat]).addTo(map.current!);
      });
    }
    
    return () => {
      // Cleanup no es estrictamente necesario aquí, pero buena práctica
    };
  }, []);

  if (!MAPBOX_TOKEN) {
    return <div className="h-full w-full flex items-center justify-center bg-slate-900 border border-slate-800 rounded-xl text-slate-400">Mapbox Token Missing</div>;
  }

  return (
    <div ref={mapContainer} className="h-full w-full rounded-xl" />
  );
}
