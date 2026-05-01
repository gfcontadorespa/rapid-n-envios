'use client';

import { useState } from 'react';
import { Package, Clock, MapPin, Truck, MoreHorizontal, Check, UserPlus } from 'lucide-react';
import { assignDriverAction } from '@/app/actions/pedidos';

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

export default function DeliveriesTable({ 
  initialPedidos, 
  conductoresActivos,
  nombresConductores 
}: { 
  initialPedidos: any[];
  conductoresActivos: any[];
  nombresConductores: Record<string, string>;
}) {
  const [openAssignId, setOpenAssignId] = useState<string | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);

  const handleAssign = async (pedidoId: string, conductorId: string) => {
    setIsAssigning(true);
    await assignDriverAction(pedidoId, conductorId);
    setOpenAssignId(null);
    setIsAssigning(false);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/80">
        <h2 className="font-semibold text-white flex items-center gap-2">
          <Package className="text-teal-400" size={20} /> Historial Operativo
        </h2>
      </div>
      
      <div className="overflow-x-auto min-h-[350px]">
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
            {initialPedidos?.map((p: any) => (
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

                <td className="px-5 py-4 text-slate-400 relative">
                  {p.conductor_id ? (
                    <div className="flex items-center gap-1.5 text-teal-400 font-medium">
                      <Check size={14} />
                      {nombresConductores[p.conductor_id] || 'Asignado'}
                    </div>
                  ) : (
                    <button 
                      onClick={() => setOpenAssignId(openAssignId === p.id ? null : p.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-teal-500/10 text-slate-400 hover:text-teal-400 border border-slate-700 hover:border-teal-500/30 rounded-lg transition-colors text-xs font-medium"
                    >
                      <UserPlus size={14} /> Asignar
                    </button>
                  )}

                  {/* Dropdown de Asignación */}
                  {openAssignId === p.id && (
                    <div className="absolute top-12 left-5 w-56 bg-slate-800 border border-slate-700 rounded-lg shadow-2xl z-50 overflow-hidden text-left">
                      <div className="p-3 border-b border-slate-700 bg-slate-900/50">
                        <p className="text-xs font-semibold text-slate-300">Seleccionar Conductor</p>
                      </div>
                      <div className="max-h-48 overflow-y-auto">
                        {conductoresActivos.length > 0 ? (
                          conductoresActivos.map((c) => (
                            <button
                              key={c.id}
                              disabled={isAssigning}
                              onClick={() => handleAssign(p.id, c.id)}
                              className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors border-b border-slate-700/50 last:border-0"
                            >
                              <div className="font-medium">{nombresConductores[c.id] || c.telegram_chat_id}</div>
                              <div className="text-xs text-slate-500">{c.vehiculo || 'Vehículo genérico'}</div>
                            </button>
                          ))
                        ) : (
                          <div className="p-4 text-center text-xs text-slate-500">
                            No hay conductores activos.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
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
            {(!initialPedidos || initialPedidos.length === 0) && (
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
  );
}
