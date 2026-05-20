"use client";

import { useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { Lock, ArrowRight, ShieldCheck } from "lucide-react";

export function LoginScreen() {
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const login = useAuthStore((state) => state.login);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(code);
    if (!success) {
      setError(true);
      setTimeout(() => setError(false), 3000);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-zinc-950 text-white selection:bg-indigo-500/30 font-sans">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-zinc-950 to-zinc-950"></div>
      </div>
      
      <div className="relative z-10 w-full max-w-md p-8 sm:p-12">
        <div className="mb-10 text-center">
          <div className="mx-auto bg-indigo-500/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border border-indigo-500/20 shadow-[0_0_40px_-10px_rgba(99,102,241,0.4)]">
            <ShieldCheck className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-3xl font-light tracking-tight text-zinc-100 mb-2">
            Mudra<span className="font-semibold text-indigo-400">POS</span>
          </h1>
          <p className="text-zinc-400 text-sm">Enter your access code to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2 relative">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-zinc-500 group-focus-within:text-indigo-400 transition-colors">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type="password"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Access Code"
                className={`w-full bg-zinc-900/50 border ${
                  error ? "border-red-500/50 focus:border-red-500" : "border-zinc-800 focus:border-indigo-500/50"
                } rounded-xl py-4 pl-12 pr-4 text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-4 ${
                  error ? "focus:ring-red-500/10" : "focus:ring-indigo-500/10"
                } transition-all backdrop-blur-xl`}
                autoFocus
              />
            </div>
            {error && (
              <p className="text-red-400 text-xs pl-2 absolute -bottom-6 left-0">
                Invalid access code. Please try again.
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl py-4 font-medium transition-all active:scale-[0.98] flex items-center justify-center gap-2 group shadow-[0_0_20px_-5px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_-5px_rgba(99,102,241,0.6)] mt-2"
          >
            <span>Unlock Access</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>
        
        <div className="mt-12 text-center">
          <p className="text-xs text-zinc-600">
            Secure Retail POS System &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </div>
  );
}
