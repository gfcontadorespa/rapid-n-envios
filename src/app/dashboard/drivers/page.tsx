import { supabaseAdmin } from '@/utils/supabase/admin';
import { Truck, UserCheck, UserX, AlertCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DriversPage() {
  const { data: conductores } = await supabaseAdmin.from('conductores').select('*').order('creado_en', { ascending: false });
  const { data: clientes } = await supabaseAdmin.from('clientes_telegram').select('telegram_chat_id, nombre_perfil');
  
  const nombresMap = new Map(clientes?.map((c: any) => [c.telegram_chat_id, c.nombre_perfil]) || []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Gestión de Conductores</h1>
        <p className="text-slate-400 text-sm mt-1">Monitorea y autoriza a tu flota de mensajeros</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-slate-800">
          <h2 className="font-semibold text-white flex items-center gap-2">
            <Truck className="text-teal-400" size={20} /> Directorio de Flota
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900/50 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-5 py-3 font-medium">Conductor</th>
                <th className="px-5 py-3 font-medium">Estado</th>
                <th className="px-5 py-3 font-medium">Operación</th>
                <th className="px-5 py-3 font-medium">Vehículo</th>
                <th className="px-5 py-3 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {conductores?.map((c: any) => {
                const nombreReal = nombresMap.get(c.telegram_chat_id) || 'Desconocido';
                return (
                <tr key={c.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-5 py-4 text-slate-300">
                    <div className="font-medium text-white">{nombreReal}</div>
                    <div className="text-xs text-slate-500">ID: {c.telegram_chat_id}</div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 text-xs font-medium border rounded-full ${c.estado === 'activo' ? 'text-teal-400 bg-teal-500/10 border-teal-500/20' : 'text-amber-400 bg-amber-500/10 border-amber-500/20'}`}>
                      {c.estado.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-400 capitalize">{c.rol_operativo}</td>
                  <td className="px-5 py-4 text-slate-400 capitalize">{c.vehiculo || 'Por asignar'}</td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-1.5 bg-slate-800 hover:bg-teal-500/20 text-slate-400 hover:text-teal-400 rounded transition-colors" title="Aprobar">
                        <UserCheck size={16} />
                      </button>
                      <button className="p-1.5 bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded transition-colors" title="Suspender/Rechazar">
                        <UserX size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              )})}
              {(!conductores || conductores.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-slate-500">No hay conductores registrados</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
