import { UserCircle, MapPin } from "lucide-react";
import { supabaseAdmin } from '@/utils/supabase/admin';
import CustomersTable from './CustomersTable';

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
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Total Customers" value={(clientes?.length || 0).toString()} icon={<UserCircle className="text-teal-400" />} />
        <StatCard title="Active (30 days)" value="--" icon={<MapPin className="text-blue-400" />} />
        <StatCard title="New this week" value="--" icon={<UserCircle className="text-purple-400" />} />
      </div>

      {/* Interactive Client Table */}
      <CustomersTable initialClientes={clientes || []} />
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
