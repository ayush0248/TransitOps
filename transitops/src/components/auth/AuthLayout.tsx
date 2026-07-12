"use client";

import React from "react";
import { Truck } from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  isRegister?: boolean;
}

export function AuthLayout({ children, title, subtitle, isRegister = false }: AuthLayoutProps) {
  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-black font-sans selection:bg-amber-500/30">
      
      {/* Animated Mesh Gradient Background */}
      <div className="absolute inset-0 w-full h-full">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-amber-600/30 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-purple-600/20 rounded-full blur-[100px] mix-blend-screen animate-pulse" style={{ animationDelay: '4s' }} />
        
        {/* subtle grid overlay for texture */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]" />
      </div>

      {/* Main Glassmorphism Card */}
      <div className="relative z-10 w-full max-w-[1000px] grid grid-cols-1 md:grid-cols-2 bg-zinc-900/40 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Left Side: Branding (Hidden on very small screens) */}
        <div className="hidden md:flex flex-col justify-between p-12 bg-gradient-to-br from-black/60 to-transparent border-r border-white/5 relative">
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                <Truck className="w-6 h-6 text-black stroke-[2.5]" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight">TransitOps</h1>
                <p className="text-xs text-amber-500/80 uppercase tracking-widest font-bold mt-0.5">OS Platform</p>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-white leading-tight">
                Streamline your<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">
                  entire fleet operation.
                </span>
              </h2>
              <p className="text-zinc-400 text-sm leading-relaxed max-w-sm">
                Secure access powered by strict Role-Based Access Control. Each user role connects to a specialized dashboard environment.
              </p>
            </div>
          </div>

          <div className="mt-20 relative z-10">
            <p className="text-xs text-zinc-600 font-mono">© 2026 TransitOps. All rights reserved.</p>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="p-8 sm:p-12 flex flex-col justify-center relative">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
            <p className="text-sm text-zinc-400">{subtitle}</p>
          </div>
          
          {children}
        </div>
      </div>
    </div>
  );
}
