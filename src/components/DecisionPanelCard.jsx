import React, { useState } from "react";
import { AlertTriangle, Clock, Sun, CheckCircle, ArrowRight, ShieldAlert, Calendar, X, Sparkles, CloudRain } from "lucide-react";
import { formatDateBR } from "../api/client";

export function DecisionPanelCard({ resumoData, onOpenCutModal }) {
  const [showWeatherModal, setShowWeatherModal] = useState(false);

  const trechosPrioritarios = Array.isArray(resumoData?.trechos_prioritarios) 
    ? resumoData.trechos_prioritarios.filter(Boolean) 
    : [];

  const trechosCriticos = trechosPrioritarios.filter(
    (t) => String(t?.prioridade || "").toUpperCase() === "ALTA"
  );

  const maisUrgente = trechosPrioritarios[0] || null;

  const trechosComChuva = trechosPrioritarios.filter(
    (t) => t?.clima_externo?.chuva_prevista_24h_mm > 5
  ).length;

  const trechosSemChuva = trechosPrioritarios.length - trechosComChuva;

  // Data ideal recomendada pelo clima (Próximo dia ensolarado/seco)
  const hojeObj = new Date();
  const dataIdeal = new Date(hojeObj);
  if (trechosComChuva > 2) {
    dataIdeal.setDate(dataIdeal.getDate() + 2); // Adia 2 dias se houver muita chuva hoje
  } else {
    dataIdeal.setDate(dataIdeal.getDate() + 1); // Amanhã como janela ideal
  }
  const dataIdealStr = dataIdeal.toISOString().split("T")[0];

  return (
    <div className="bg-[#1E242C] border border-[#2A323D] rounded-2xl p-5 shadow-xl space-y-5">
      
      {/* Header do Painel de Controle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#2A323D] pb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-[#B5FF57]/20 text-[#B5FF57] border border-[#B5FF57]/40 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5" strokeWidth={2} />
          </div>
          <div>
            <h2 className="text-base font-bold text-white font-sans tracking-tight">
              Painel de Controle — Operação Motiva
            </h2>
            <p className="text-[11px] text-slate-400">
              Direcionamento imediato das equipes de roçagem de acostamento
            </p>
          </div>
        </div>

        <span className="text-[11px] font-mono font-bold px-3 py-1 rounded-full bg-[#12171E] text-slate-300 border border-[#2A323D] self-start sm:self-auto">
          Visão Geral
        </span>
      </div>

      {/* Grid de Cards Executivos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        
        {/* Card 1: Trechos Críticos */}
        <div className="p-4 rounded-2xl bg-[#12171E] border border-[#2A323D] flex items-center space-x-4 shadow-md">
          <div className="w-12 h-12 rounded-full bg-[#B5FF57] text-slate-950 flex items-center justify-center flex-shrink-0 shadow-lg">
            <AlertTriangle className="w-6 h-6" strokeWidth={2.5} />
          </div>
          <div className="overflow-hidden">
            <span className="text-xs font-semibold text-slate-300 block truncate">Trechos Críticos</span>
            <div className="text-3xl font-extrabold text-white font-mono tabular-nums leading-tight">
              {trechosCriticos.length}
            </div>
            <span className="text-[10px] text-red-400 font-semibold block">Grama &gt; 25cm (Alta)</span>
          </div>
        </div>

        {/* Card 2: Setor Mais Urgente */}
        <div className="p-4 rounded-2xl bg-[#12171E] border border-[#2A323D] flex items-center space-x-4 shadow-md">
          <div className="w-12 h-12 rounded-full bg-[#B5FF57] text-slate-950 flex items-center justify-center flex-shrink-0 shadow-lg">
            <Clock className="w-6 h-6" strokeWidth={2.5} />
          </div>
          <div className="overflow-hidden">
            <span className="text-xs font-semibold text-slate-300 block truncate">Mais Urgente</span>
            <div className="text-sm font-bold text-white font-mono truncate leading-snug">
              {maisUrgente ? `${maisUrgente.rodovia} (${maisUrgente.municipio || "Trecho"})` : "Nenhum"}
            </div>
            <span className="text-[10px] text-amber-400 font-semibold block">
              {maisUrgente ? `Corte em: ${maisUrgente.dias_para_corte === 0 ? "HOJE" : `${maisUrgente.dias_para_corte} dias`}` : "OK"}
            </span>
          </div>
        </div>

        {/* Card 3: Janela Climática de Roçagem (INTERATIVO COM MODAL DE RECOMENDAÇÃO) */}
        <div 
          onClick={() => setShowWeatherModal(true)}
          className="p-4 rounded-2xl bg-[#12171E] hover:bg-[#181E26] border border-[#2A323D] hover:border-[#B5FF57]/60 flex items-center space-x-4 shadow-md cursor-pointer transition group"
          title="Clique para ver a recomendação de data de corte baseada no clima"
        >
          <div className="w-12 h-12 rounded-full bg-[#B5FF57] group-hover:scale-105 text-slate-950 flex items-center justify-center flex-shrink-0 shadow-lg transition-transform">
            <Sun className="w-6 h-6" strokeWidth={2.5} />
          </div>
          <div className="overflow-hidden w-full">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 truncate">Janela Climática</span>
              <span className="text-[10px] text-[#B5FF57] font-bold font-mono group-hover:underline">Recomendações &gt;</span>
            </div>
            <div className="text-xl font-extrabold text-[#B5FF57] font-mono leading-tight truncate">
              {trechosComChuva === 0 ? "Favorável" : `${trechosSemChuva} de ${trechosPrioritarios.length} Ok`}
            </div>
            <span className="text-[10px] text-slate-400 font-medium block truncate">
              {trechosComChuva === 0 ? "Tempo seco sem impedimento (24h)" : `Chuva prevista em ${trechosComChuva} ${trechosComChuva === 1 ? "trecho" : "trechos"}`}
            </span>
          </div>
        </div>

        {/* Card 4: Conformidade SLA */}
        <div className="p-4 rounded-2xl bg-[#12171E] border border-[#2A323D] flex items-center space-x-4 shadow-md">
          <div className="w-12 h-12 rounded-full bg-[#B5FF57] text-slate-950 flex items-center justify-center flex-shrink-0 shadow-lg">
            <CheckCircle className="w-6 h-6" strokeWidth={2.5} />
          </div>
          <div className="overflow-hidden">
            <span className="text-xs font-semibold text-slate-300 block truncate">Conformidade SLA</span>
            <div className="text-3xl font-extrabold text-[#B5FF57] font-mono tabular-nums leading-tight">
              {trechosPrioritarios.length > 0 ? `${Math.round(((trechosPrioritarios.length - trechosCriticos.length) / trechosPrioritarios.length) * 100)}%` : "100%"}
            </div>
            <span className="text-[10px] text-slate-400 font-medium block">Dentro do Limite</span>
          </div>
        </div>

      </div>

      {/* Banner de Direcionamento Recomendado */}
      {maisUrgente && (
        <div className="p-3.5 rounded-xl bg-[#B5FF57]/10 border border-[#B5FF57]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2 text-white">
            <span className="font-black uppercase tracking-wider text-[10px] bg-[#B5FF57] text-slate-950 px-2.5 py-1 rounded-md">
              AÇÃO RECOMENDADA:
            </span>
            <span className="font-medium text-slate-200">
              Despachar equipe para <strong className="text-white">{maisUrgente.rodovia} — {maisUrgente.nome || maisUrgente.trecho}</strong> (KM {maisUrgente.km != null ? maisUrgente.km : `${maisUrgente.km_inicial}-${maisUrgente.km_final}`})
            </span>
          </div>

          <button
            onClick={() => onOpenCutModal(maisUrgente)}
            className="px-4 py-2 rounded-xl bg-[#B5FF57] hover:bg-[#9EE642] text-slate-950 font-extrabold text-xs transition shadow-md flex items-center justify-center space-x-1.5 self-start sm:self-auto"
          >
            <span>Despachar Equipe Agora</span>
            <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
          </button>
        </div>
      )}

      {/* MODAL INTERATIVO DE RECOMENDAÇÃO DE CORTE BASEADA NO CLIMA */}
      {showWeatherModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#1E242C] border border-[#2A323D] w-full max-w-xl rounded-2xl p-6 shadow-2xl space-y-5 relative animate-in fade-in zoom-in-95 duration-150">
            
            {/* Header do Modal */}
            <div className="flex items-start justify-between border-b border-[#2A323D] pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-[#B5FF57]/20 text-[#B5FF57] border border-[#B5FF57]/40 flex items-center justify-center">
                  <Sun className="w-5 h-5" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center space-x-2">
                    <span>Recomendação Climática para Roçagem</span>
                    <Sparkles className="w-4 h-4 text-[#B5FF57]" strokeWidth={2} />
                  </h3>
                  <p className="text-xs text-slate-400">
                    Análise meteorológica das próximas 72h para programação de equipes
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowWeatherModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#12171E] transition"
              >
                <X className="w-5 h-5" strokeWidth={2} />
              </button>
            </div>

            {/* Destaque da Data Ideal Recomendada */}
            <div className="p-4 rounded-xl bg-[#12171E] border border-[#B5FF57]/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                  🗓️ Janela de Corte Ideal Sugerida:
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#B5FF57] text-slate-950 font-black text-[11px]">
                  MELHOR CLIMA
                </span>
              </div>
              
              <div className="text-2xl font-black text-[#B5FF57] font-mono">
                {formatDateBR(dataIdealStr)}
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Condição meteorológica com tempo seco (0.0 mm de chuva) e umidade do solo em níveis seguros para operação de trator e roçagem manual.
              </p>
            </div>

            {/* Status Meteorológico por Trecho */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                Condição Climática por Rodovia (24h):
              </h4>

              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {trechosPrioritarios.map((t, idx) => {
                  const chuvaMm = t?.clima_externo?.chuva_prevista_24h_mm || 0;
                  const temChuva = chuvaMm > 5;

                  return (
                    <div
                      key={t?.trecho_id || `weather-item-${idx}`}
                      className="p-2.5 rounded-lg bg-[#12171E] border border-[#2A323D] flex items-center justify-between text-xs"
                    >
                      <div className="font-semibold text-white">
                        {t?.rodovia} — {t?.nome || t?.trecho}
                      </div>

                      <div className="flex items-center space-x-2">
                        {temChuva ? (
                          <span className="text-amber-400 font-mono font-bold flex items-center space-x-1">
                            <CloudRain className="w-3.5 h-3.5 text-amber-400" strokeWidth={2} />
                            <span>Chuva {chuvaMm}mm</span>
                          </span>
                        ) : (
                          <span className="text-[#B5FF57] font-mono font-bold flex items-center space-x-1">
                            <Sun className="w-3.5 h-3.5 text-[#B5FF57]" strokeWidth={2} />
                            <span>Tempo Seco</span>
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Ações do Modal */}
            <div className="pt-3 border-t border-[#2A323D] flex items-center justify-between">
              <button
                onClick={() => setShowWeatherModal(false)}
                className="px-4 py-2 rounded-xl bg-[#12171E] hover:bg-[#2A323D] text-slate-300 text-xs font-bold transition border border-[#2A323D]"
              >
                Fechar
              </button>

              {maisUrgente && (
                <button
                  onClick={() => {
                    setShowWeatherModal(false);
                    if (typeof onOpenCutModal === "function") {
                      onOpenCutModal({
                        ...maisUrgente,
                        data_sugerida: dataIdealStr
                      });
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-[#B5FF57] hover:bg-[#9EE642] text-slate-950 font-black text-xs transition shadow-md flex items-center space-x-1.5"
                >
                  <Calendar className="w-4 h-4" strokeWidth={2.5} />
                  <span>Agendar na Data Ideal ({formatDateBR(dataIdealStr)})</span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
