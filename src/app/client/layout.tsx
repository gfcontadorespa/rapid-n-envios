import Link from "next/link";
import { LayoutDashboard, Truck, MapPin, Settings, LogOut, Bell, PlusCircle } from "lucide-react";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 flex text-slate-200 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Truck className="h-8 w-8 text-cyan-400" />
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-400">
              Rapidín Empresas
            </span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Link href="/client" className="flex items-center gap-3 px-4 py-3 bg-cyan-500/10 text-cyan-400 rounded-lg border border-cyan-500/20 transition-colors">
            <LayoutDashboard size={20} />
            <span className="font-medium">Mi Panel</span>
          </Link>
          <Link href="/client/new" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-slate-200 rounded-lg transition-colors">
            <PlusCircle size={20} />
            <span className="font-medium">Nuevo Envío</span>
          </Link>
          <Link href="/client/deliveries" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-slate-200 rounded-lg transition-colors">
            <MapPin size={20} />
            <span className="font-medium">Mis Envíos</span>
          </Link>
          <Link href="/client/settings" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-slate-200 rounded-lg transition-colors">
            <Settings size={20} />
            <span className="font-medium">Configuración</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <Link href="/" className="flex items-center gap-3 px-4 py-3 w-full text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 rounded-lg transition-colors">
            <LogOut size={20} />
            <span className="font-medium">Cerrar Sesión</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-slate-200 hidden sm:block">Portal de Clientes</h2>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-cyan-400 transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-cyan-500"></span>
            </button>
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-400 p-0.5">
              <div className="h-full w-full rounded-full bg-slate-900 flex items-center justify-center">
                <span className="text-xs font-bold text-cyan-400">EM</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6 flex-1 overflow-auto bg-slate-950/50">
          {children}
        </div>
      </main>
    </div>
  );
}
