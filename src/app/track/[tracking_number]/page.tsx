import { supabaseAdmin } from '@/utils/supabase/admin';
import { Package, MapPin, Clock, Truck, CheckCircle2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

function getStatusColor(status: string) {
  switch (status?.toLowerCase()) {
    case 'entregado': return "text-teal-400 bg-teal-500/10 border-teal-500/20";
    case 'retrasado': case 'cancelado': return "text-rose-400 bg-rose-500/10 border-rose-500/20";
    case 'creado': return "text-blue-400 bg-blue-500/10 border-blue-500/20";
    case 'en_ruta_entrega': case 'asignado_recoleccion': return "text-indigo-400 bg-indigo-500/10 border-indigo-500/20";
    default: return "text-amber-400 bg-amber-500/10 border-amber-500/20";
  }
}

function formatFecha(fechaIso: string) {
  if (!fechaIso) return 'Desconocido';
  const d = new Date(fechaIso);
  return d.toLocaleString('es-PA', { 
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true
  });
}

// Interfaz pública y sencilla
export default async function TrackingPage({ params }: { params: { tracking_number: string } }) {
  const { tracking_number } = params;

  const { data: pedido, error } = await supabaseAdmin
    .from('pedidos')
    .select('*, conductores(vehiculo, usuarios(nombre))')
    .eq('tracking_number', tracking_number)
    .single();

  if (error || !pedido) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <Package size={64} className="text-slate-800 mb-6" />
        <h1 className="text-2xl font-bold text-slate-200 mb-2">Envío no encontrado</h1>
        <p className="text-slate-400 max-w-md">No pudimos encontrar ningún paquete asociado al número de guía <strong className="text-slate-300 font-mono">{tracking_number}</strong>. Verifica el enlace enviado e intenta de nuevo.</p>
      </div>
    );
  }

  const estado = pedido.estado || 'creado';
  const esEntregado = estado === 'entregado';
  const enCamino = estado === 'en_ruta_entrega';

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8 flex justify-center">
      <div className="w-full max-w-2xl mt-4 md:mt-10">
        
        {/* Encabezado */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-center shadow-lg mb-4">
            <Package size={32} className="text-teal-400" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Rastreo de Envío</h1>
          <p className="text-slate-400 mt-2 font-mono text-lg bg-slate-900/50 px-3 py-1 rounded-md border border-slate-800 inline-block">{pedido.tracking_number}</p>
        </div>

        {/* Tarjeta Principal */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          {/* Header de Estado */}
          <div className="p-6 border-b border-slate-800 bg-slate-900/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <p className="text-sm text-slate-400 mb-1">Estado Actual</p>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1.5 text-sm font-bold border rounded-full uppercase tracking-wider ${getStatusColor(estado)}`}>
                  {estado.replace(/_/g, ' ')}
                </span>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-sm text-slate-400 mb-1">Creado el</p>
              <div className="flex items-center gap-1.5 text-slate-200 font-medium">
                <Clock size={16} className="text-slate-500" />
                {formatFecha(pedido.creado_en)}
              </div>
            </div>
          </div>

          {/* Detalles de Ruta */}
          <div className="p-6">
            <div className="relative pl-6 space-y-8">
              {/* Línea vertical conectora */}
              <div className="absolute top-2 left-[11px] bottom-4 w-0.5 bg-slate-800"></div>

              {/* Punto de Origen */}
              <div className="relative">
                <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-slate-900 border-2 border-indigo-500 flex items-center justify-center z-10">
                  <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                </div>
                <h3 className="text-sm font-semibold text-slate-300 mb-1 flex items-center gap-2">
                  <MapPin size={16} className="text-indigo-400" /> Origen de Recolección
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {pedido.origen_direccion || 'Ubicación GPS (Guardada)'}
                </p>
              </div>

              {/* Mensajero (Solo si está asignado o en camino) */}
              {pedido.conductor_id && (
                <div className="relative">
                  <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-slate-900 border-2 border-teal-500 flex items-center justify-center z-10">
                    <Truck size={12} className="text-teal-500" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-300 mb-1 flex items-center gap-2">
                    <Truck size={16} className="text-teal-400" /> Mensajero Asignado
                  </h3>
                  <p className="text-slate-400 text-sm">
                    {pedido.conductores?.usuarios?.nombre ? `${pedido.conductores.usuarios.nombre} - ` : ''} 
                    {pedido.conductores?.vehiculo || 'Vehículo de Reparto'}
                  </p>
                </div>
              )}

              {/* Punto de Destino */}
              <div className="relative">
                <div className={`absolute -left-6 top-1 w-5 h-5 rounded-full bg-slate-900 border-2 ${esEntregado ? 'border-teal-500' : 'border-rose-500'} flex items-center justify-center z-10`}>
                  {esEntregado ? <CheckCircle2 size={14} className="text-teal-500" /> : <div className="w-2 h-2 rounded-full bg-rose-500"></div>}
                </div>
                <h3 className="text-sm font-semibold text-slate-300 mb-1 flex items-center gap-2">
                  <MapPin size={16} className={esEntregado ? "text-teal-400" : "text-rose-400"} /> Destino de Entrega
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  {pedido.destino_direccion || 'Ubicación GPS (Guardada)'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Footer Informativo */}
          <div className="bg-slate-950/50 p-4 border-t border-slate-800 text-center">
            <p className="text-xs text-slate-500">
              Cualquier consulta sobre tu envío, por favor contáctanos a través del <a href="https://t.me/rapidin_bot" className="text-teal-400 hover:underline">Chat de Soporte en Telegram</a>.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
