import { Building2, Users, Mail, Plus, Shield, UserX, UserCheck } from 'lucide-react';

export default function B2BSettingsPage() {
  // Datos mockeados para el diseño inicial
  const companyInfo = {
    name: 'Logística Avanzada S.A.',
    ruc: '15568945-2-2023',
    email: 'contacto@logisticaavanzada.com',
    phone: '+507 6000-0000',
    address: 'Costa del Este, MMG Tower, Piso 10'
  };

  const teamMembers = [
    { id: 1, name: 'Carlos Gerente', email: 'carlos@logisticaavanzada.com', role: 'admin', status: 'activo' },
    { id: 2, name: 'Ana Despacho', email: 'ana@logisticaavanzada.com', role: 'dispatcher', status: 'activo' },
    { id: 3, name: 'Pedro Bodega', email: 'pedro@logisticaavanzada.com', role: 'dispatcher', status: 'pendiente' },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white">Configuración de Empresa</h1>
        <p className="text-slate-400 text-sm mt-1">Administra el perfil de tu negocio y los accesos de tu equipo</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Columna Izquierda: Perfil de Empresa */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/80">
              <h2 className="font-semibold text-white flex items-center gap-2">
                <Building2 className="text-cyan-400" size={20} /> Perfil Corporativo
              </h2>
            </div>
            
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Nombre Comercial</label>
                <input type="text" defaultValue={companyInfo.name} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all" />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">RUC / Identificación Fiscal</label>
                <input type="text" defaultValue={companyInfo.ruc} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all" />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Correo de Facturación</label>
                <input type="email" defaultValue={companyInfo.email} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all" />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Dirección Principal</label>
                <textarea rows={3} defaultValue={companyInfo.address} className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all resize-none"></textarea>
              </div>

              <button className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-lg transition-colors border border-slate-700">
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Gestión de Usuarios */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/80">
              <h2 className="font-semibold text-white flex items-center gap-2">
                <Users className="text-cyan-400" size={20} /> Usuarios y Permisos
              </h2>
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/20 rounded-lg transition-colors text-sm font-medium">
                <Plus size={16} /> Invitar Usuario
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-950/50 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="px-5 py-4 font-medium">Usuario</th>
                    <th className="px-5 py-4 font-medium">Rol</th>
                    <th className="px-5 py-4 font-medium">Estado</th>
                    <th className="px-5 py-4 font-medium text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {teamMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-medium text-slate-200">{member.name}</div>
                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <Mail size={12} /> {member.email}
                        </div>
                      </td>
                      
                      <td className="px-5 py-4">
                        {member.role === 'admin' ? (
                          <div className="flex items-center gap-1.5 text-cyan-400">
                            <Shield size={14} /> Administrador
                          </div>
                        ) : (
                          <div className="text-slate-400">Operador / Despacho</div>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        {member.status === 'activo' ? (
                          <span className="px-2.5 py-1 text-xs font-medium border rounded-full text-teal-400 bg-teal-500/10 border-teal-500/20">
                            Activo
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 text-xs font-medium border rounded-full text-amber-400 bg-amber-500/10 border-amber-500/20">
                            Invitación Pendiente
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded transition-colors" title="Editar Permisos">
                            <UserCheck size={16} />
                          </button>
                          <button className="p-1.5 bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded transition-colors" title="Remover Acceso">
                            <UserX size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="p-5 bg-slate-900/50 border-t border-slate-800 text-xs text-slate-500">
              <p>Los <strong className="text-slate-400">Administradores</strong> pueden ver la facturación y gestionar el equipo. Los <strong className="text-slate-400">Operadores</strong> solo pueden crear y rastrear envíos.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
