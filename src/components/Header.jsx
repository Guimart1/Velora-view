import React, { useState } from "react";
import { 
  RefreshCw, 
  ExternalLink, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  PanelLeftClose, 
  PanelLeftOpen 
} from "lucide-react";
import logoImg from "../assets/logo.png";

export function Header({ 
  sidebarOpen, 
  setSidebarOpen, 
  onRefresh, 
  isRefreshing, 
  apiOnline, 
  onOpenMaintenanceModal 
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <header className="h-16 bg-[#12171E] border-b border-[#2A323D] sticky top-0 z-40 flex items-center justify-between px-4 sm:px-6 transition-colors">
      
      {/* Left Section: Sidebar Toggle & ONLY Logo Image */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg text-slate-400 hover:bg-[#1E242C] hover:text-white transition"
          title={sidebarOpen ? "Recolher Menu" : "Expandir Menu"}
        >
          {sidebarOpen ? (
            <PanelLeftClose className="w-5 h-5" strokeWidth={1.75} />
          ) : (
            <PanelLeftOpen className="w-5 h-5" strokeWidth={1.75} />
          )}
        </button>

        {/* APENAS A LOGO DO VELLÖRA NO HEADER */}
        <div className="flex items-center">
          {!imgError && logoImg ? (
            <img 
              src={logoImg} 
              alt="VELÖRA" 
              onError={() => setImgError(true)}
              className="h-9 max-h-9 w-auto object-contain"
            />
          ) : (
            <div className="px-3 py-1 rounded-lg bg-[#B5FF57] text-slate-950 font-black text-lg tracking-widest uppercase">
              VELÖRA
            </div>
          )}
        </div>
      </div>

      {/* Right Section: Status, Swagger & Action Button */}
      <div className="flex items-center space-x-2.5">
        
        {/* Telemetry Status */}
        <div
          className={`hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-mono border ${
            apiOnline
              ? "bg-[#B5FF57]/10 text-[#B5FF57] border-[#B5FF57]/30"
              : "bg-red-500/10 text-red-400 border-red-500/30"
          }`}
        >
          {apiOnline ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={1.75} />
              <span>Conectado (:8000)</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-3.5 h-3.5" strokeWidth={1.75} />
              <span>Desconectado</span>
            </>
          )}
        </div>

        {/* Refresh Data Button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="p-2 rounded-lg bg-[#1E242C] text-slate-300 hover:bg-[#2A323D] hover:text-white transition disabled:opacity-50 border border-[#2A323D]"
          title="Atualizar dados de campo"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-[#B5FF57]" : ""}`} strokeWidth={1.75} />
        </button>

        {/* External Link to Swagger */}
        <a
          href="http://127.0.0.1:8000/docs"
          target="_blank"
          rel="noreferrer"
          className="hidden sm:flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-[#1E242C] text-slate-300 hover:bg-[#2A323D] hover:text-white border border-[#2A323D] text-xs font-medium transition"
        >
          <span>Swagger</span>
          <ExternalLink className="w-3.5 h-3.5" strokeWidth={1.75} />
        </a>

        {/* Primary Action Button */}
        <button
          onClick={() => onOpenMaintenanceModal()}
          className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-[#B5FF57] hover:bg-[#9EE642] text-slate-950 font-extrabold text-xs transition shadow-sm"
        >
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          <span className="hidden sm:inline">Registrar Corte</span>
        </button>

      </div>
    </header>
  );
}
