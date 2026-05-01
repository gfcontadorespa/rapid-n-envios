import Link from "next/link";
import { LayoutDashboard, Truck, Users, MapPin, Settings, LogOut, Bell } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-950 flex text-slate-200 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Truck className="h-8 w-8 text-teal-400" />
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-cyan-400">
              LogisDispatch
            </span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 bg-teal-500/10 text-teal-400 rounded-lg border border-teal-500/20 transition-colors">
            <LayoutDashboard size={20} />
            <span className="font-medium">Dashboard</span>
          </Link>
          <Link href="/dashboard/deliveries" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-slate-200 rounded-lg transition-colors">
            <MapPin size={20} />
            <span className="font-medium">Deliveries</span>
          </Link>
          <Link href="/dashboard/drivers" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-slate-200 rounded-lg transition-colors">
            <Users size={20} />
            <span className="font-medium">Drivers</span>
          </Link>
          <Link href="/dashboard/settings" className="flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-slate-200 rounded-lg transition-colors">
            <Settings size={20} />
            <span className="font-medium">Settings</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button className="flex items-center gap-3 px-4 py-3 w-full text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 rounded-lg transition-colors">
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-slate-200 hidden sm:block">Logistics Center</h2>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-400 hover:text-teal-400 transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-teal-500"></span>
            </button>
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-teal-400 to-cyan-400 p-0.5">
              <div className="h-full w-full rounded-full bg-slate-900 flex items-center justify-center">
                <span className="text-xs font-bold text-teal-400">AD</span>
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
