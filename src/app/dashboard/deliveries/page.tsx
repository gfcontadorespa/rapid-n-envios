import { supabaseAdmin } from '@/utils/supabase/admin';
import Link from 'next/link';
import DeliveriesTable from './DeliveriesTable';

export const dynamic = 'force-dynamic';

export default async function DeliveriesPage() {
  // Fetch orders
  const { data: pedidos } = await supabaseAdmin.from('pedidos').select('*').order('creado_en', { ascending: false });
  
  // Fetch active drivers
  const { data: conductoresActivos } = await supabaseAdmin.from('conductores').select('*').eq('estado', 'activo');

  // Fetch telegram clients to get their real names
  const { data: clientes } = await supabaseAdmin.from('clientes_telegram').select('telegram_chat_id, nombre_perfil');
  
  // Create a map to quickly look up names by telegram ID (which is also the driver's telegram_chat_id)
  const namesMap = new Map(clientes?.map((c: any) => [c.telegram_chat_id, c.nombre_perfil]) || []);
  
  // Create a map to look up names by driver's UUID
  const driverNamesRecord: Record<string, string> = {};
  conductoresActivos?.forEach((conductor: any) => {
    driverNamesRecord[conductor.id] = namesMap.get(conductor.telegram_chat_id) || `Driver ${conductor.telegram_chat_id}`;
  });

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

      <DeliveriesTable 
        initialPedidos={pedidos || []} 
        conductoresActivos={conductoresActivos || []}
        nombresConductores={driverNamesRecord}
      />
    </div>
  );
}
