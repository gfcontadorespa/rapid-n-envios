import { Settings, Key, DollarSign, Shield, Users, Save, Bell } from "lucide-react";

export default function GlobalSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Platform Settings</h1>
        <p className="text-slate-400 text-sm mt-1">Configure global parameters and integrations for Rapidín Logistics</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Navigation/Sections */}
        <div className="lg:col-span-1 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-teal-500/10 text-teal-400 border border-teal-500/20 rounded-lg font-medium transition-colors">
            <DollarSign size={18} />
            Pricing & Tariffs
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent rounded-lg font-medium transition-colors">
            <Key size={18} />
            API Keys & Integrations
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent rounded-lg font-medium transition-colors">
            <Users size={18} />
            Global Administrators
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent rounded-lg font-medium transition-colors">
            <Bell size={18} />
            Notifications
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent rounded-lg font-medium transition-colors">
            <Shield size={18} />
            Security
          </button>
        </div>

        {/* Right Column - Active Section Content */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Tariffs Section */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-5 border-b border-slate-800">
              <h2 className="font-semibold text-white flex items-center gap-2">
                <DollarSign className="text-teal-400" size={20} /> Pricing Configuration
              </h2>
            </div>
            
            <div className="p-5 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Base Tariff ($)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-500">$</span>
                    <input 
                      type="number" 
                      defaultValue="3.50"
                      step="0.10"
                      className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg pl-8 pr-4 py-2 focus:outline-none focus:border-teal-500"
                    />
                  </div>
                  <p className="text-xs text-slate-500">Minimum delivery fee applied to all orders.</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Price per Kilometer ($)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-500">$</span>
                    <input 
                      type="number" 
                      defaultValue="0.75"
                      step="0.05"
                      className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg pl-8 pr-4 py-2 focus:outline-none focus:border-teal-500"
                    />
                  </div>
                  <p className="text-xs text-slate-500">Extra charge per km after the base distance.</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Surge Pricing Multiplier (Rain/Rush Hour)</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="range" 
                    min="1" max="3" step="0.1" defaultValue="1.0"
                    className="flex-1 accent-teal-500"
                  />
                  <span className="bg-slate-800 px-3 py-1 rounded text-teal-400 font-mono text-sm">1.0x</span>
                </div>
                <p className="text-xs text-slate-500">Current multiplier applied to all new incoming orders.</p>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end">
                <button className="flex items-center gap-2 px-6 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold rounded-lg transition-colors">
                  <Save size={18} /> Save Pricing Rules
                </button>
              </div>
            </div>
          </div>

          {/* API Keys Preview */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden opacity-50 pointer-events-none">
            <div className="p-5 border-b border-slate-800">
              <h2 className="font-semibold text-white flex items-center gap-2">
                <Key className="text-slate-400" size={20} /> Environment Variables
              </h2>
            </div>
            <div className="p-5">
              <p className="text-sm text-slate-400 mb-4">Select "API Keys & Integrations" to configure Telegram Bot Tokens and Mapbox Tokens.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
