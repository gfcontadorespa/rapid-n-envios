'use client';

import { useState } from 'react';
import { Settings, Key, DollarSign, Shield, Users, Save, Bell } from "lucide-react";

export default function GlobalSettingsPage() {
  const [activeTab, setActiveTab] = useState('pricing');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Platform Settings</h1>
        <p className="text-slate-400 text-sm mt-1">Configure global parameters and integrations for Rapidín Logistics</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column - Navigation/Sections */}
        <div className="lg:col-span-1 space-y-2">
          <button 
            onClick={() => setActiveTab('pricing')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'pricing' ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent'}`}
          >
            <DollarSign size={18} />
            Pricing & Tariffs
          </button>
          <button 
            onClick={() => setActiveTab('api')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'api' ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent'}`}
          >
            <Key size={18} />
            API Keys & Integrations
          </button>
          <button 
            onClick={() => setActiveTab('admins')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'admins' ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent'}`}
          >
            <Users size={18} />
            Global Administrators
          </button>
          <button 
            onClick={() => setActiveTab('notifications')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeTab === 'notifications' ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-transparent'}`}
          >
            <Bell size={18} />
            Notifications
          </button>
        </div>

        {/* Right Column - Active Section Content */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Tariffs Section */}
          {activeTab === 'pricing' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden animate-in fade-in duration-300">
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
          )}

          {/* API Keys Placeholder */}
          {activeTab === 'api' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden animate-in fade-in duration-300">
              <div className="p-5 border-b border-slate-800">
                <h2 className="font-semibold text-white flex items-center gap-2">
                  <Key className="text-teal-400" size={20} /> Environment Variables
                </h2>
              </div>
              <div className="p-5 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Mapbox Token</label>
                  <input type="password" defaultValue="pk.eyJ1Ijoiam9zbHU..." className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-4 py-2" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Telegram Bot Token</label>
                  <input type="password" defaultValue="759493..." className="w-full bg-slate-950 border border-slate-700 text-white rounded-lg px-4 py-2" />
                </div>
                <div className="pt-4 flex justify-end">
                  <button className="flex items-center gap-2 px-6 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold rounded-lg transition-colors">
                    <Save size={18} /> Save Keys
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Admins Placeholder */}
          {activeTab === 'admins' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden animate-in fade-in duration-300">
              <div className="p-5 border-b border-slate-800">
                <h2 className="font-semibold text-white flex items-center gap-2">
                  <Users className="text-teal-400" size={20} /> Global Administrators
                </h2>
              </div>
              <div className="p-5">
                <p className="text-slate-400 text-sm">You are the only Global Administrator registered.</p>
              </div>
            </div>
          )}

          {/* Notifications Placeholder */}
          {activeTab === 'notifications' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden animate-in fade-in duration-300">
              <div className="p-5 border-b border-slate-800">
                <h2 className="font-semibold text-white flex items-center gap-2">
                  <Bell className="text-teal-400" size={20} /> Notification Settings
                </h2>
              </div>
              <div className="p-5">
                <p className="text-slate-400 text-sm">Configure your Slack or Telegram Webhook alerts here.</p>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
