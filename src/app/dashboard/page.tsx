import Link from 'next/link';
import { Package, Truck, Clock, AlertTriangle, MoreHorizontal, ArrowUpRight } from "lucide-react";
import TrackingMap from '@/components/Map';
import { supabaseAdmin } from '@/utils/supabase/admin';

// Forced dynamic to avoid caching stale data on the dashboard
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  // Fetch real data
  const { data: pedidos } = await supabaseAdmin.from('pedidos').select('*').order('creado_en', { ascending: false });
  const { data: conductores } = await supabaseAdmin.from('conductores').select('*');
  const { data: clientes } = await supabaseAdmin.from('clientes_telegram').select('*');

  const driverMap = new Map(clientes?.map((c: any) => [c.telegram_chat_id, c.nombre_perfil]) || []);

  const activeDeliveries = pedidos?.filter((p: any) => !['entregado', 'cancelado'].includes(p.estado?.toLowerCase())) || [];
  const activeDrivers = conductores?.filter((c: any) => c.estado === 'activo') || [];
  const issues = pedidos?.filter((p: any) => ['retrasado', 'cancelado'].includes(p.estado?.toLowerCase())) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Overview</h1>
        <p className="text-slate-400 text-sm mt-1">Real-time logistics platform status</p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Active Deliveries" value={activeDeliveries.length.toString()} icon={<Package className="text-teal-400" />} trend="Real-time data" trendUp={true} />
        <StatCard title="Drivers Online" value={activeDrivers.length.toString()} icon={<Truck className="text-blue-400" />} trend={`${conductores?.length || 0} total registered`} trendUp={true} />
        <StatCard title="Total Deliveries" value={(pedidos?.length || 0).toString()} icon={<Clock className="text-purple-400" />} trend="All time" trendUp={true} />
        <StatCard title="Issues Reported" value={issues.length.toString()} icon={<AlertTriangle className="text-rose-400" />} trend={issues.length > 0 ? "Requires attention" : "All good"} trendUp={issues.length === 0} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Live Tracking Map */}
          <div className="h-[400px] w-full rounded-xl overflow-hidden relative z-0">
            <TrackingMap pedidos={activeDeliveries} conductores={activeDrivers} />
          </div>

          {/* Recent Deliveries Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="p-5 border-b border-slate-800 flex justify-between items-center">
            <h2 className="font-semibold text-white">Recent Deliveries</h2>
            <Link href="/dashboard/deliveries" className="text-sm text-teal-400 hover:text-teal-300 font-medium">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900/50 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3 font-medium">Tracking ID</th>
                  <th className="px-5 py-3 font-medium">Destination</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Driver</th>
                  <th className="px-5 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {pedidos?.slice(0, 5).map((pedido: any) => (
                  <TableRow 
                    key={pedido.id}
                    id={pedido.tracking_number || `ID-${pedido.id}`} 
                    dest={pedido.destino_direccion || "Desconocido"} 
                    status={pedido.estado || "creado"} 
                    driver={"Unassigned"} // Todavía no hay campo para conductor en pedidos según schema
                    statusColor={getStatusColor(pedido.estado || "creado")} 
                  />
                ))}
                {(!pedidos || pedidos.length === 0) && (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-slate-500">No recent deliveries found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          </div>
        </div>

        {/* Sidebar content - Map/Active Drivers */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h2 className="font-semibold text-white mb-4">Active Drivers</h2>
            <div className="space-y-4">
              {activeDrivers.slice(0, 5).map((driver: any) => {
                const name = driverMap.get(driver.telegram_chat_id) || `Driver ${driver.id}`;
                return (
                  <DriverRow 
                    key={driver.id} 
                    name={name} 
                    status={driver.rol_operativo || 'Disponible'} 
                    time={driver.vehiculo || 'Sin vehículo'} 
                  />
                );
              })}
              {(!activeDrivers || activeDrivers.length === 0) && (
                <div className="text-slate-500 text-center py-4 text-sm">No active drivers</div>
              )}
            </div>
            <Link href="/dashboard/drivers" className="w-full mt-4 py-2 border border-slate-700 hover:bg-slate-800 rounded-lg text-sm text-slate-300 font-medium transition-colors flex justify-center items-center">
              Manage Drivers
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case 'entregado': return "text-teal-400 bg-teal-500/10 border-teal-500/20";
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
      <div className={`text-xs font-medium ${trendUp ? 'text-teal-400' : 'text-rose-400'}`}>
        {trend}
      </div>
    </div>
  );
}

function TableRow({ id, dest, status, driver, statusColor = "text-amber-400 bg-amber-500/10 border-amber-500/20" }: { id: string, dest: string, status: string, driver: string, statusColor?: string }) {
  return (
    <tr className="hover:bg-slate-800/50 transition-colors">
      <td className="px-5 py-4 font-medium text-slate-300">{id}</td>
      <td className="px-5 py-4 text-slate-400">{dest}</td>
      <td className="px-5 py-4">
        <span className={`px-2.5 py-1 text-xs font-medium border rounded-full ${statusColor}`}>
          {status}
        </span>
      </td>
      <td className="px-5 py-4 text-slate-400">{driver}</td>
      <td className="px-5 py-4 text-right">
        <button className="p-1 text-slate-500 hover:text-slate-300 transition-colors">
          <MoreHorizontal size={18} />
        </button>
      </td>
    </tr>
  );
}

function DriverRow({ name, status, time }: { name: string, status: string, time: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300 border border-slate-700">
          {name.charAt(0)}{name.split(' ')[1]?.charAt(0) || ''}
        </div>
        <div>
          <div className="text-sm font-medium text-slate-200">{name}</div>
          <div className="text-xs text-slate-500">{status}</div>
        </div>
      </div>
      <div className="text-xs font-medium text-slate-400 flex items-center gap-1">
        {time} <ArrowUpRight size={14} className="text-slate-500" />
      </div>
    </div>
  );
}
