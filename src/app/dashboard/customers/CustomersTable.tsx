'use client';

import { useState } from 'react';
import { Phone, MoreHorizontal, MessageCircle } from 'lucide-react';

export default function CustomersTable({ initialClientes }: { initialClientes: any[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  const filteredClientes = initialClientes.filter(c => 
    c.nombre_perfil?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.telegram_chat_id?.includes(searchTerm) ||
    c.telefono?.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="relative">
        <svg className="absolute left-3 top-2.5 text-slate-400" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        <input 
          type="text" 
          placeholder="Search customers..." 
          className="bg-slate-900 border border-slate-700 text-white rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-teal-500 w-full sm:w-80"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden mt-6">
        <div className="p-5 border-b border-slate-800 flex justify-between items-center">
          <h2 className="font-semibold text-white">Customer List</h2>
        </div>
        <div className="overflow-x-auto min-h-[300px]">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-900/50 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Telegram ID</th>
                <th className="px-5 py-3 font-medium">Account Type</th>
                <th className="px-5 py-3 font-medium">Contact</th>
                <th className="px-5 py-3 font-medium">Joined</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {filteredClientes.map((cliente: any) => (
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
                    {cliente.email_empresa ? (
                      <span className="px-2.5 py-1 text-xs font-medium border rounded-full text-indigo-400 bg-indigo-500/10 border-indigo-500/20">
                        B2B CORPORATE
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 text-xs font-medium border rounded-full text-slate-300 bg-slate-800 border-slate-700">
                        B2C RETAIL
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Phone size={14} />
                      {cliente.telefono || 'No registrado'}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-400">
                    {cliente.creado_en ? new Date(cliente.creado_en).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-5 py-4 text-right relative">
                    <button 
                      className="p-1 text-slate-500 hover:text-teal-400 transition-colors"
                      onClick={() => setOpenDropdownId(openDropdownId === cliente.id ? null : cliente.id)}
                    >
                      <MoreHorizontal size={18} />
                    </button>
                    {openDropdownId === cliente.id && (
                      <div className="absolute right-8 top-10 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden text-left">
                        <a 
                          href={`tg://user?id=${cliente.telegram_chat_id}`} 
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                        >
                          <MessageCircle size={16} className="text-blue-400" /> Telegram Chat
                        </a>
                        {cliente.telefono ? (
                           <a 
                             href={`https://wa.me/${cliente.telefono.replace(/\D/g, '')}`} 
                             target="_blank"
                             rel="noopener noreferrer"
                             className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                           >
                             <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg> 
                             WhatsApp
                           </a>
                        ) : (
                          <div className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-500 cursor-not-allowed">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg> 
                            No WhatsApp
                          </div>
                        )}
                        <div className="border-t border-slate-700 my-1"></div>
                        <button className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors w-full text-left">
                          View Order History
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {filteredClientes.length === 0 && (
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
