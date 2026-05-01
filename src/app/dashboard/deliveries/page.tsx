import { supabaseAdmin } from '@/utils/supabase/admin';
import { Package, Clock, MapPin, Truck, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';

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

export default async function DeliveriesPage() {
  const { data: pedidos } = await supabaseAdmin.from('pedidos').select('*').order('creado_en', { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-white">Centro de Entregas</h1>
          <p className="text-slate-400 text-sm mt-1">Monitorea el estado y ruta de todos los paquetes</p>
        </div>
        <Link href="/dashboard/deliveries/new" className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold rounded-lg shadow-[0_0_15px_rgba(45,212,191,0.3)] transition-all">
          + Nuevo Pedido Manual
        </Link>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/80">
          <h2 className="font-semibold text-white flex items-center gap-2">
            <Package className="text-teal-400" size={20} /> Historial Operativo
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-950/50 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-5 py-4 font-medium">Tracking</th>
                <th className="px-5 py-4 font-medium">Fecha y Hora</th>
                <th className="px-5 py-4 font-medium">Estado</th>
                <th className="px-5 py-4 font-medium">Origen</th>
                <th className="px-5 py-4 font-medium">Destino</th>
                <th className="px-5 py-4 font-medium">Conductor</th>
                <th className="px-5 py-4 font-medium">Tarifa</th>
                <th className="px-5 py-4 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {pedidos?.map((p: any) => (
                <tr key={p.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-mono font-medium text-slate-200">{p.tracking_number}</div>
                    <div className="text-xs text-slate-500 capitalize">{p.tipo}</div>
                  </td>
                  
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Clock size={14} className="text-slate-500" />
                      {formatFecha(p.creado_en)}
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 text-xs font-medium border rounded-full uppercase tracking-wider ${getStatusColor(p.estado)}`}>
                      {(p.estado || 'creado').replace(/_/g, ' ')}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-slate-400">
                    <div className="flex items-center gap-1.5 max-w-[200px] truncate" title={p.origen_direccion}>
                      <MapPin size={14} className="text-indigo-400 shrink-0" />
                      <span className="truncate">{p.origen_direccion || 'GPS'}</span>
                    </div>
                  </td>

                  <td className="px-5 py-4 text-slate-400">
                    <div className="flex items-center gap-1.5 max-w-[200px] truncate" title={p.destino_direccion}>
                      <MapPin size={14} className="text-rose-400 shrink-0" />
                      <span className="truncate">{p.destino_direccion || 'GPS'}</span>
                    </div>
                  </td>

                  <td className="px-5 py-4 text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Truck size={14} className="text-slate-500" />
                      {/* Aquí mostraremos el nombre cuando agreguemos conductor_id a pedidos */}
                      {p.conductor_id ? 'Asignado' : 'Por asignar'}
                    </div>
                  </td>

                  <td className="px-5 py-4 font-medium text-teal-400">
                    ${parseFloat(p.tarifa_envio || 0).toFixed(2)}
                  </td>

                  <td className="px-5 py-4 text-right">
                    <button className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded transition-colors" title="Ver Detalles">
                      <MoreHorizontal size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {(!pedidos || pedidos.length === 0) && (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <Package size={48} className="text-slate-700 mb-3" />
                      <p>No hay pedidos registrados en el sistema.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
