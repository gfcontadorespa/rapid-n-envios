import { UserCircle, Search, Mail, Phone, MapPin, MoreHorizontal } from "lucide-react";
import { supabaseAdmin } from '@/utils/supabase/admin';

// Forced dynamic to avoid caching stale data on the dashboard
export const dynamic = 'force-dynamic';

export default async function CustomersPage() {
  const { data: clientes } = await supabaseAdmin.from('clientes_telegram').select('*').order('creado_en', { ascending: false });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-white">Customers</h1>
          <p className="text-slate-400 text-sm mt-1">Manage B2B and B2C clients</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search customers..." 
            className="bg-slate-900 border border-slate-700 text-white rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-teal-500"
          />
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Total Customers" value={(clientes?.length || 0).toString()} icon={<UserCircle className="text-teal-400" />} />
        <StatCard title="Active (30 days)" value="--" icon={<MapPin className="text-blue-400" />} />
        <StatCard title="New this week" value="--" icon={<UserCircle className="text-purple-400" />} />
      </div>

      {/* Customers Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden mt-6">
        <div className="p-5 border-b border-slate-800 flex justify-between items-center">
          <h2 className="font-semibold text-white">Customer List</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900/50 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Telegram ID</th>
                <th className="px-5 py-3 font-medium">Contact</th>
                <th className="px-5 py-3 font-medium">Joined</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {clientes?.map((cliente: any) => (
                <tr key={cliente.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300 border border-slate-700">
                        {cliente.nombre_perfil?.charAt(0) || 'U'}
                      </div>
                      <div className="font-medium text-slate-200">{cliente.nombre_perfil || 'Usuario Desconocido'}</div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-400 font-mono text-xs">{cliente.telegram_chat_id}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Phone size={14} />
                      {cliente.telefono || 'No registrado'}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-400">
                    {cliente.creado_en ? new Date(cliente.creado_en).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button className="p-1 text-slate-500 hover:text-teal-400 transition-colors">
                      <MoreHorizontal size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {(!clientes || clientes.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-slate-500">No customers found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string, value: string, icon: React.ReactNode }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center justify-between">
      <div>
        <h3 className="text-slate-400 font-medium text-sm mb-1">{title}</h3>
        <div className="text-2xl font-bold text-white">{value}</div>
      </div>
      <div className="p-3 bg-slate-800/50 rounded-lg">
        {icon}
      </div>
    </div>
  );
}
