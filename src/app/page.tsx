"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Package, Lock, Mail, ArrowRight, Loader2, Wind } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        setLoading(false);
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push('/dashboard');
        }, 800);
      }
    } catch (err: any) {
      setError("Ocurrió un error inesperado al conectar.");
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Elementos decorativos de fondo (Verde azulado / Teal) */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[40rem] h-[40rem] bg-teal-600/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[40rem] h-[40rem] bg-cyan-600/10 rounded-full blur-[100px]"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md bg-slate-900/60 backdrop-blur-2xl border border-slate-700/50 rounded-3xl shadow-2xl overflow-hidden z-10"
      >
        <div className="p-8">
          <div className="flex justify-center items-center mb-8 relative h-16 w-full">
            <motion.div
              animate={{ x: [-40, 60] }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="absolute z-0 opacity-40 text-cyan-400"
            >
              <Wind className="w-8 h-8" />
            </motion.div>

            <motion.div 
              animate={{ y: [-3, 3, -3] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              className="bg-teal-500/10 p-4 rounded-2xl border border-teal-500/20 shadow-[0_0_15px_rgba(20,184,166,0.2)] z-10"
            >
              <Package className="w-10 h-10 text-teal-400" />
            </motion.div>
          </div>
          
          <h1 className="text-3xl font-bold text-center text-white mb-2 tracking-tight">
            Rapidín <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">Console</span>
          </h1>
          <p className="text-slate-400 text-center mb-6 text-sm">
            Ingresa a tu panel de control de envíos
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm text-center">
              {error === "Invalid login credentials" ? "Correo o contraseña incorrectos." : error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-teal-500/10 border border-teal-500/30 rounded-xl text-teal-400 text-sm text-center">
              ¡Bienvenido! Entrando al sistema...
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading || success}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-700/50 rounded-xl leading-5 bg-slate-950/50 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all sm:text-sm disabled:opacity-50"
                  placeholder="admin@empresa.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading || success}
                  className="block w-full pl-10 pr-3 py-3 border border-slate-700/50 rounded-xl leading-5 bg-slate-950/50 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all sm:text-sm disabled:opacity-50"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <motion.button
              whileHover={loading || success ? {} : { scale: 1.02 }}
              whileTap={loading || success ? {} : { scale: 0.98 }}
              disabled={loading || success}
              type="submit"
              className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-slate-900 bg-gradient-to-r from-teal-400 to-cyan-400 hover:from-teal-300 hover:to-cyan-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-teal-500 transition-all mt-6 disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : success ? (
                "Conectado"
              ) : (
                <>
                  Iniciar Sesión
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </main>
  );
}
