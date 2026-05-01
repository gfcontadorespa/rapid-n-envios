import { Package, Clock, AlertTriangle, MoreHorizontal, CheckCircle2 } from "lucide-react";
import { supabaseAdmin } from '@/utils/supabase/admin';

// Forced dynamic to avoid caching stale data on the dashboard
export const dynamic = 'force-dynamic';

export default async function ClientDashboardPage() {
  // En un escenario real, aquí filtraríamos por el ID del cliente logueado
  // const clientId = await getLoggedInClientId();
  // const { data: pedidos } = await supabaseAdmin.from('pedidos').select('*').eq('cliente_id', clientId).order('creado_en', { ascending: false });
  
  // Por ahora mostramos todos los pedidos como demo, o podríamos filtrar por creado_por = 'cliente'
  const { data: pedidos } = await supabaseAdmin.from('pedidos').select('*').order('creado_en', { ascending: false }).limit(20);

  const activeDeliveries = pedidos?.filter((p: any) => !['entregado', 'cancelado'].includes(p.estado?.toLowerCase())) || [];
  const completedDeliveries = pedidos?.filter((p: any) => p.estado?.toLowerCase() === 'entregado') || [];
  const issues = pedidos?.filter((p: any) => ['retrasado', 'cancelado'].includes(p.estado?.toLowerCase())) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-white">Mi Panel</h1>
          <p className="text-slate-400 text-sm mt-1">Resumen de tus envíos corporativos</p>
        </div>
        <button className="bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2">
          <Package size={18} />
          Nuevo Envío
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Envíos en Curso" value={activeDeliveries.length.toString()} icon={<Clock className="text-amber-400" />} trend="Monitoreo en vivo" trendUp={true} />
        <StatCard title="Entregas Exitosas" value={completedDeliveries.length.toString()} icon={<CheckCircle2 className="text-cyan-400" />} trend="Histórico" trendUp={true} />
        <StatCard title="Alertas / Retrasos" value={issues.length.toString()} icon={<AlertTriangle className="text-rose-400" />} trend={issues.length > 0 ? "Requiere atención" : "Todo en orden"} trendUp={issues.length === 0} />
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden mt-6">
        <div className="p-5 border-b border-slate-800 flex justify-between items-center">
          <h2 className="font-semibold text-white">Actividad Reciente</h2>
          <button className="text-sm text-cyan-400 hover:text-cyan-300 font-medium">Ver Todos</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900/50 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-5 py-3 font-medium">Tracking ID</th>
                <th className="px-5 py-3 font-medium">Destino</th>
                <th className="px-5 py-3 font-medium">Estado</th>
                <th className="px-5 py-3 font-medium">Tarifa Estimada</th>
                <th className="px-5 py-3 font-medium text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {pedidos?.slice(0, 10).map((pedido: any) => (
                <TableRow 
                  key={pedido.id}
                  id={pedido.tracking_number || `ID-${pedido.id}`} 
                  dest={pedido.destino_direccion || "Desconocido"} 
                  status={pedido.estado || "creado"} 
                  price={`$${(pedido.tarifa_envio || 0).toFixed(2)}`}
                  statusColor={getStatusColor(pedido.estado || "creado")} 
                />
              ))}
              {(!pedidos || pedidos.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-slate-500">No hay envíos recientes</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case 'entregado': return "text-cyan-400 bg-cyan-500/10 border-cyan-500/20";
    case 'retrasado': case 'cancelado': return "text-rose-400 bg-rose-500/10 border-rose-500/20";
    case 'creado': case 'preparando': return "text-blue-400 bg-blue-500/10 border-blue-500/20";
    default: return "text-amber-400 bg-amber-500/10 border-amber-500/20";
  }
}

function StatCard({ title, value, icon, trend, trendUp }: { title: string, value: string, icon: React.ReactNode, trend: string, trendUp: boolean }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-6 opacity-20 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-500">
        {icon}
      </div>
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2.5 bg-slate-800/50 rounded-lg">
          {icon}
        </div>
        <h3 className="text-slate-400 font-medium text-sm">{title}</h3>
      </div>
      <div className="text-3xl font-bold text-white mb-2">{value}</div>
      <div className={`text-xs font-medium ${trendUp ? 'text-cyan-400' : 'text-rose-400'}`}>
        {trend}
      </div>
    </div>
  );
}

function TableRow({ id, dest, status, price, statusColor = "text-amber-400 bg-amber-500/10 border-amber-500/20" }: { id: string, dest: string, status: string, price: string, statusColor?: string }) {
  return (
    <tr className="hover:bg-slate-800/50 transition-colors">
      <td className="px-5 py-4 font-medium text-slate-300">{id}</td>
      <td className="px-5 py-4 text-slate-400">{dest}</td>
      <td className="px-5 py-4">
        <span className={`px-2.5 py-1 text-xs font-medium border rounded-full ${statusColor}`}>
          {status}
        </span>
      </td>
      <td className="px-5 py-4 text-slate-400">{price}</td>
      <td className="px-5 py-4 text-right">
        <button className="p-1 text-slate-500 hover:text-slate-300 transition-colors">
          <MoreHorizontal size={18} />
        </button>
      </td>
    </tr>
  );
}
