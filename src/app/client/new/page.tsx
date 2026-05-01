"use client";

import { useState, useRef, useEffect } from 'react';
import { MapPin, Search, Star, BookmarkPlus, Navigation, Send, Package, Loader2 } from 'lucide-react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { createOrderAction } from '@/app/actions/pedidos';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export default function NewDeliveryPage() {
  const [origin, setOrigin] = useState({ lat: 8.9824, lng: -79.5199, address: '' });
  const [destination, setDestination] = useState({ lat: 8.9950, lng: -79.5100, address: '' });
  const [activeInput, setActiveInput] = useState<'origin' | 'destination' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<any>(null);
  
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const originMarker = useRef<mapboxgl.Marker | null>(null);
  const destMarker = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    if (!mapContainer.current || !MAPBOX_TOKEN) return;
    
    mapboxgl.accessToken = MAPBOX_TOKEN;
    
    if (!map.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [-79.5199, 8.9824],
        zoom: 12.5,
      });

      // Evento de clic en el mapa
      map.current.on('click', (e) => {
        const { lng, lat } = e.lngLat;
        
        if (activeInput === 'origin') {
          setOrigin(prev => ({ ...prev, lat, lng, address: `Ubicación en mapa (${lat.toFixed(4)}, ${lng.toFixed(4)})` }));
          updateMarker('origin', lng, lat);
        } else if (activeInput === 'destination') {
          setDestination(prev => ({ ...prev, lat, lng, address: `Ubicación en mapa (${lat.toFixed(4)}, ${lng.toFixed(4)})` }));
          updateMarker('destination', lng, lat);
        }
      });
      
      // Inicializar marcadores
      updateMarker('origin', origin.lng, origin.lat);
      updateMarker('destination', destination.lng, destination.lat);
    }
  }, [activeInput]);

  const updateMarker = (type: 'origin' | 'destination', lng: number, lat: number) => {
    if (!map.current) return;

    const color = type === 'origin' ? '#38bdf8' : '#fb7185'; // Cyan para origen, Rose para destino
    
    if (type === 'origin') {
      if (!originMarker.current) {
        originMarker.current = new mapboxgl.Marker({ color }).setLngLat([lng, lat]).addTo(map.current);
      } else {
        originMarker.current.setLngLat([lng, lat]);
      }
    } else {
      if (!destMarker.current) {
        destMarker.current = new mapboxgl.Marker({ color }).setLngLat([lng, lat]).addTo(map.current);
      } else {
        destMarker.current.setLngLat([lng, lat]);
      }
    }
    
    // Auto-fit bounds si ambos existen y están seteados
    if (originMarker.current && destMarker.current) {
      const bounds = new mapboxgl.LngLatBounds()
        .extend(originMarker.current.getLngLat())
        .extend(destMarker.current.getLngLat());
      
      map.current.fitBounds(bounds, { padding: 50, maxZoom: 14 });
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin.address || !destination.address) {
      alert("Por favor, selecciona origen y destino.");
      return;
    }

    setIsSubmitting(true);
    try {
      const pedido = await createOrderAction({
        originLat: origin.lat,
        originLng: origin.lng,
        originAddress: origin.address,
        destLat: destination.lat,
        destLng: destination.lng,
        destAddress: destination.address,
        price: 4.50 // TODO: Calcular dinámicamente con Turf.js o API
      });
      
      setCreatedOrder(pedido);
      // Aquí el siguiente paso será mostrar la vista de Etiqueta
      
    } catch (error) {
      console.error(error);
      alert("Hubo un error al crear el pedido.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (createdOrder) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 bg-cyan-500/10 text-cyan-400 rounded-full flex items-center justify-center mx-auto">
            <Package size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">¡Pedido Guardado!</h2>
            <p className="text-slate-400">Tu envío ha sido registrado en el sistema. Pronto un conductor será asignado para recogerlo.</p>
          </div>
          
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
            <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Tracking ID</div>
            <div className="text-xl font-mono text-cyan-400">{createdOrder.tracking_number}</div>
          </div>

          <div className="flex gap-4 pt-4">
            <button 
              onClick={() => setCreatedOrder(null)}
              className="flex-1 py-2.5 border border-slate-700 hover:bg-slate-800 text-white rounded-lg transition-colors"
            >
              Volver
            </button>
            <button className="flex-1 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg transition-colors">
              Imprimir Etiqueta
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-6">
      {/* Formulario */}
      <div className="w-full lg:w-1/3 bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col h-full overflow-y-auto">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Send className="text-cyan-400" />
            Crear Envío
          </h2>
          <p className="text-slate-400 text-sm mt-1">Busca la dirección o selecciona el punto en el mapa interactivo.</p>
        </div>

        <form onSubmit={handleCreateOrder} className="flex-1 flex flex-col space-y-6">
          {/* Origen */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 flex items-center justify-between">
              <span>Dirección de Recolección (Origen)</span>
              <button type="button" className="text-xs text-cyan-400 flex items-center gap-1 hover:text-cyan-300">
                <BookmarkPlus size={14} /> Guardar
              </button>
            </label>
            <div className={`relative rounded-lg border transition-colors ${activeInput === 'origin' ? 'border-cyan-500 ring-1 ring-cyan-500/50' : 'border-slate-700'}`}>
              <MapPin className="absolute left-3 top-3 text-cyan-400" size={18} />
              <input 
                type="text" 
                value={origin.address}
                onChange={(e) => setOrigin({...origin, address: e.target.value})}
                onFocus={() => setActiveInput('origin')}
                placeholder="Ej. Calle 50, Ciudad de Panamá"
                className="w-full bg-slate-900/50 text-white pl-10 pr-4 py-2.5 rounded-lg focus:outline-none"
              />
            </div>
            {activeInput === 'origin' && <p className="text-xs text-cyan-400">Haz clic en el mapa para marcar el origen exacto.</p>}
          </div>

          {/* Destino */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300 flex items-center justify-between">
              <span>Dirección de Entrega (Destino)</span>
              <button type="button" className="text-xs text-cyan-400 flex items-center gap-1 hover:text-cyan-300">
                <BookmarkPlus size={14} /> Guardar
              </button>
            </label>
            <div className={`relative rounded-lg border transition-colors ${activeInput === 'destination' ? 'border-rose-500 ring-1 ring-rose-500/50' : 'border-slate-700'}`}>
              <Navigation className="absolute left-3 top-3 text-rose-400" size={18} />
              <input 
                type="text" 
                value={destination.address}
                onChange={(e) => setDestination({...destination, address: e.target.value})}
                onFocus={() => setActiveInput('destination')}
                placeholder="Ej. Costa del Este, Panamá"
                className="w-full bg-slate-900/50 text-white pl-10 pr-4 py-2.5 rounded-lg focus:outline-none"
              />
            </div>
            {activeInput === 'destination' && <p className="text-xs text-rose-400">Haz clic en el mapa para marcar el destino exacto.</p>}
          </div>

          {/* Rutas Favoritas */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 mt-2">
            <h3 className="text-sm font-medium text-slate-300 flex items-center gap-2 mb-3">
              <Star className="text-amber-400" size={16} /> Rutas Favoritas
            </h3>
            <div className="space-y-2">
              <button type="button" className="w-full text-left px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors flex items-center gap-2">
                <MapPin size={14} className="text-slate-500" /> Sucursal Principal → Almacén
              </button>
              <button type="button" className="w-full text-left px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-colors flex items-center gap-2">
                <MapPin size={14} className="text-slate-500" /> Almacén → Oficina Central
              </button>
            </div>
          </div>

          <div className="flex-1"></div>

          {/* Resumen y Botón */}
          <div className="border-t border-slate-800 pt-4 mt-auto">
            <div className="flex justify-between items-center mb-4">
              <span className="text-slate-400">Tarifa Estimada</span>
              <span className="text-xl font-bold text-white">$4.50</span>
            </div>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold rounded-lg shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <Package size={20} />}
              {isSubmitting ? "Registrando..." : "Colocar Envío"}
            </button>
          </div>
        </form>
      </div>

      {/* Mapa */}
      <div className="w-full lg:w-2/3 h-[400px] lg:h-full relative rounded-xl overflow-hidden border border-slate-800">
        <div ref={mapContainer} className="w-full h-full" />
        
        {/* Leyenda flotante */}
        <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-sm border border-slate-700 p-3 rounded-lg shadow-xl">
          <div className="text-xs font-medium text-slate-300 mb-2">Instrucciones del Mapa</div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <div className="w-3 h-3 rounded-full bg-cyan-400"></div> Origen (Selecciona el input)
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <div className="w-3 h-3 rounded-full bg-rose-400"></div> Destino (Selecciona el input)
          </div>
        </div>
      </div>
    </div>
  );
}
