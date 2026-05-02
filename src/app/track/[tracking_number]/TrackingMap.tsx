"use client";

import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

interface TrackingMapProps {
  origenLat?: number;
  origenLng?: number;
  destinoLat?: number;
  destinoLng?: number;
  driverLat?: number;
  driverLng?: number;
}

export default function TrackingMap({ origenLat, origenLng, destinoLat, destinoLng, driverLat, driverLng }: TrackingMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || !MAPBOX_TOKEN) return;
    
    // Si no hay coordenadas de origen ni destino, no mostramos el mapa
    if (!origenLat || !origenLng || !destinoLat || !destinoLng) return;

    if (!map.current) {
      mapboxgl.accessToken = MAPBOX_TOKEN;
      
      // Calculate bounds to fit both points
      const bounds = new mapboxgl.LngLatBounds()
        .extend([origenLng, origenLat])
        .extend([destinoLng, destinoLat]);

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        bounds: bounds,
        fitBoundsOptions: {
          padding: 50
        },
        interactive: false // Hacemos el mapa estático para mejor UX en móviles
      });

      map.current.on('load', () => {
        if (!map.current) return;

        // Origin Marker (Indigo)
        const elOrigen = document.createElement('div');
        elOrigen.className = 'w-4 h-4 rounded-full bg-indigo-500 border-2 border-white shadow-[0_0_10px_rgba(99,102,241,0.8)]';
        new mapboxgl.Marker({ element: elOrigen })
          .setLngLat([origenLng, origenLat])
          .addTo(map.current);

        // Destination Marker (Rose)
        const elDestino = document.createElement('div');
        elDestino.className = 'w-4 h-4 rounded-full bg-rose-500 border-2 border-white shadow-[0_0_10px_rgba(244,63,94,0.8)]';
        new mapboxgl.Marker({ element: elDestino })
          .setLngLat([destinoLng, destinoLat])
          .addTo(map.current);

        // Draw Line between Origin and Destination
        map.current.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: [
                [origenLng, origenLat],
                [destinoLng, destinoLat]
              ]
            }
          }
        });

        map.current.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#6366f1', // Indigo
            'line-width': 3,
            'line-dasharray': [2, 2] // Dashed line
          }
        });

        // Opcional: Si el driver tiene coordenadas en vivo, las mostramos (animadas o pulsantes)
        if (driverLat && driverLng) {
          const elDriver = document.createElement('div');
          elDriver.className = 'bg-teal-400 p-1.5 rounded-full shadow-[0_0_15px_rgba(45,212,191,0.6)] animate-pulse flex items-center justify-center text-slate-950 w-6 h-6 border-2 border-white';
          elDriver.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 17h4V5H2v12h3"/><path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5"/><path d="M14 17h1"/><circle cx="7.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>';
          
          new mapboxgl.Marker({ element: elDriver })
            .setLngLat([driverLng, driverLat])
            .addTo(map.current);
        }
      });
    }
  }, [origenLat, origenLng, destinoLat, destinoLng, driverLat, driverLng]);

  if (!MAPBOX_TOKEN) return null;
  if (!origenLat || !origenLng || !destinoLat || !destinoLng) return null;

  return (
    <div className="w-full h-48 sm:h-64 mt-6 border-t border-slate-800 relative">
      <div ref={mapContainer} className="absolute inset-0" />
      {/* Gradiente superior para fusionarse con el fondo */}
      <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-slate-900 to-transparent z-10 pointer-events-none" />
    </div>
  );
}
