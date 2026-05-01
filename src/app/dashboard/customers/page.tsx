import { supabaseAdmin } from '@/utils/supabase/admin';
import { UserCircle, MessageCircle, Mail } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function CustomersPage() {
  const { data: clientes } = await supabaseAdmin.from('clientes_telegram').select('*').order('creado_en', { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Directorio de Clientes</h1>
        <p className="text-slate-400 text-sm mt-1">Administra tus usuarios de Telegram y cuentas corporativas B2B</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-slate-800">
          <h2 className="font-semibold text-white flex items-center gap-2">
            <UserCircle className="text-teal-400" size={20} /> Base de Datos de Usuarios
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900/50 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-5 py-3 font-medium">Cliente</th>
                <th className="px-5 py-3 font-medium">ID Telegram</th>
                <th className="px-5 py-3 font-medium">Tipo de Cuenta</th>
                <th className="px-5 py-3 font-medium text-right">Contacto Rápido</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {clientes?.map((c: any) => (
                <tr key={c.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-5 py-4 text-slate-300">
                    <div className="font-medium text-white">{c.nombre_perfil || 'Desconocido'}</div>
                    {c.email_empresa && (
                      <div className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                        <Mail size={12} /> {c.email_empresa}
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-4 font-mono text-xs text-slate-400">
                    <div>{c.telegram_chat_id}</div>
                    {c.telefono && (
                      <div className="text-teal-400 font-sans font-medium mt-1">📞 {c.telefono}</div>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    {c.email_empresa ? (
                      <span className="px-2.5 py-1 text-xs font-medium border rounded-full text-indigo-400 bg-indigo-500/10 border-indigo-500/20">
                        B2B CORPORATIVO
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 text-xs font-medium border rounded-full text-slate-300 bg-slate-800 border-slate-700">
                        PARTICULAR
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <a 
                        href={`tg://user?id=${c.telegram_chat_id}`} 
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-lg transition-colors text-xs font-medium"
                        title="Abrir en Telegram"
                      >
                        <MessageCircle size={14} /> Telegram
                      </a>
                      
                      {c.telefono ? (
                        <a 
                          href={`https://wa.me/${c.telefono.replace(/\\D/g, '')}`} 
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 rounded-lg transition-colors text-xs font-medium"
                          title="Abrir en WhatsApp"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg> 
                          WhatsApp
                        </a>
                      ) : (
                        <button 
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-slate-500 border border-slate-700 rounded-lg text-xs font-medium cursor-not-allowed"
                          title="Falta número de teléfono"
                          disabled
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg> 
                          Sin WA
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {(!clientes || clientes.length === 0) && (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-slate-500">No hay clientes registrados aún</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
