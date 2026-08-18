import React from "react";
import { 
  ShieldAlert, 
  TrendingUp, 
  FileText, 
  Scissors, 
  ShieldCheck 
} from "lucide-react";

export function Sidebar({ activeTab, setActiveTab, isOpen, setIsOpen }) {
  const menuItems = [
    {
      id: "ranking",
      label: "Geral",
      icon: ShieldAlert,
    },
    {
      id: "historico",
      label: "Projeções",
      icon: TrendingUp,
    },
    {
      id: "vegetacao",
      label: "Vegetação",
      icon: FileText,
    },
    {
      id: "manutencoes",
      label: "Cortes",
      icon: Scissors,
    },
  ];

  return (
    <aside
      className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-[#12171E] border-r border-[#2A323D] transition-all duration-300 flex flex-col justify-between z-30 flex-shrink-0 ${
        isOpen ? "w-56" : "w-16"
      }`}
    >
      <div className="py-4 space-y-6 overflow-y-auto">
        
        {/* Section Title when Open */}
        {isOpen && (
          <div className="px-4">
            <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400">
              Navegação
            </span>
          </div>
        )}

        {/* Navigation Item Buttons */}
        <nav className="space-y-1.5 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-full text-xs font-bold transition-all ${
                  isActive
                    ? "bg-[#B5FF57] text-slate-950 shadow-md font-black"
                    : "text-slate-300 hover:bg-[#1E242C] hover:text-white"
                }`}
                title={!isOpen ? item.label : undefined}
              >
                <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-slate-950" : "text-slate-400"}`} strokeWidth={2} />
                
                {isOpen && (
                  <span className="truncate text-sm font-bold tracking-tight">
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info inside Sidebar (Citação VELÖRA, Motiva, FIAP, Grupo 43, Turma 2 CCPX) */}
      {isOpen && (
        <div className="p-4 border-t border-[#2A323D] bg-[#0B0F14] text-[11px] text-slate-400 space-y-1 flex-shrink-0">
          <div className="flex items-center space-x-1.5 font-mono text-slate-200 font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-[#B5FF57]" strokeWidth={2} />
            <span>VELÖRA — MOTIVA</span>
          </div>
          <p className="text-[10px] font-mono text-slate-400">
            FIAP • Grupo 43 • 2 CCPX
          </p>
        </div>
      )}
    </aside>
  );
}
