import React, { useState } from "react";
import { PriorityBadge } from "./Badge";
import { AlertTriangle, Clock, Scissors, MapPin, Filter, Calendar, AlertCircle } from "lucide-react";
import { formatDateBR } from "../api/client";

// Função para renderizar o status de agendamento SEM pílulas/cápsulas
function renderAgendamentoStatus(agendamento, temAgendamento) {
  if (!temAgendamento || !agendamento?.data_corte) {
    return (
      <div className="flex flex-col items-center justify-center space-y-0.5 text-center">
        <div className="flex items-center space-x-1.5 text-slate-400 text-xs font-mono font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
          <span className="uppercase tracking-wider">Sem Ordem</span>
        </div>
        <span className="text-[10px] font-mono text-slate-500">Pendente</span>
      </div>
    );
  }

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const rawDateStr = String(agendamento.data_corte).split("T")[0];
  const parts = rawDateStr.split("-");
  
  if (parts.length < 3) {
    return (
      <div className="flex flex-col items-center justify-center space-y-0.5 text-center">
        <div className="flex items-center space-x-1.5 text-[#B5FF57] font-bold text-xs font-mono">
          <Calendar className="w-3.5 h-3.5 text-[#B5FF57]" strokeWidth={2} />
          <span className="uppercase tracking-wider">Agendado</span>
        </div>
      </div>
    );
  }

  const dataCorteObj = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
  dataCorteObj.setHours(0, 0, 0, 0);

  const diffTime = hoje.getTime() - dataCorteObj.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  // 1. Vencido Crítico (Atrasado por 7 dias ou mais sem corte realizado)
  if (diffDays >= 7) {
    return (
      <div className="flex flex-col items-center justify-center space-y-0.5 text-center">
        <div className="flex items-center space-x-1 text-red-400 font-extrabold text-xs font-mono">
          <AlertTriangle className="w-3.5 h-3.5 text-red-500 animate-pulse" strokeWidth={2.5} />
          <span className="uppercase tracking-wider">Vencido +{diffDays}d</span>
        </div>
        <span className="text-[10px] font-mono text-red-400/90 font-bold">
          Data: {formatDateBR(agendamento.data_corte)}
        </span>
      </div>
    );
  }

  // 2. Atrasado Leve (Atrasado de 1 a 6 dias)
  if (diffDays >= 1) {
    return (
      <div className="flex flex-col items-center justify-center space-y-0.5 text-center">
        <div className="flex items-center space-x-1 text-amber-400 font-bold text-xs font-mono">
          <Clock className="w-3.5 h-3.5 text-amber-400" strokeWidth={2} />
          <span className="uppercase tracking-wider">Atrasado +{diffDays}d</span>
        </div>
        <span className="text-[10px] font-mono text-amber-400/90 font-bold">
          Data: {formatDateBR(agendamento.data_corte)}
        </span>
      </div>
    );
  }

  // 3. Em Dia / Hoje / Futuro
  return (
    <div className="flex flex-col items-center justify-center space-y-0.5 text-center">
      <div className="flex items-center space-x-1 text-[#B5FF57] font-bold text-xs font-mono">
        <Calendar className="w-3.5 h-3.5 text-[#B5FF57]" strokeWidth={2} />
        <span className="uppercase tracking-wider">Agendado</span>
      </div>
      <span className="text-[10px] font-mono text-[#B5FF57]/90 font-bold">
        Data: {formatDateBR(agendamento.data_corte)}
      </span>
    </div>
  );
}

export function RankingTable({ trechos = [], manutencoes = [], onRegisterCutForTrecho }) {
  const [prioridadeFilter, setPrioridadeFilter] = useState("TODAS"); // "TODAS" | "ALTA" | "MEDIA" | "BAIXA"

  const safeTrechos = Array.isArray(trechos) ? trechos.filter(Boolean) : [];
  const safeManutencoes = Array.isArray(manutencoes) ? manutencoes.filter(Boolean) : [];

  // Mapeia agendamentos por ID do trecho
  const agendamentoPorTrecho = safeManutencoes.reduce((acc, man) => {
    const tId = man?.trecho_id;
    if (tId != null) {
      const key = String(tId);
      if (!acc[key] || new Date(man.data_corte) > new Date(acc[key].data_corte)) {
        acc[key] = man;
      }
    }
    return acc;
  }, {});

  // Enriquece a lista de trechos com a sinalização dinâmica de agendamento
  const trechosEnriquecidos = safeTrechos.map((t) => {
    const tId = t?.trecho_id || t?.id;
    
    let agendamento = tId != null ? agendamentoPorTrecho[String(tId)] : null;
    
    if (!agendamento && (t?.rodovia || t?.nome)) {
      agendamento = safeManutencoes.find(
        (m) =>
          String(m?.rodovia || "").trim().toLowerCase() === String(t?.rodovia || "").trim().toLowerCase() &&
          (
            String(m?.trecho || "").trim().toLowerCase().includes(String(t?.nome || t?.trecho || "").trim().toLowerCase()) ||
            String(t?.nome || t?.trecho || "").trim().toLowerCase().includes(String(m?.trecho || "").trim().toLowerCase())
          )
      );
    }

    if (!agendamento && t?.ultimo_corte) {
      agendamento = { data_corte: t.ultimo_corte, equipe: t.equipe_corte };
    }

    const temAgendamento = !!agendamento;

    // Calcula dias de atraso se houver agendamento
    let diffDays = 0;
    if (agendamento?.data_corte) {
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      const parts = String(agendamento.data_corte).split("T")[0].split("-");
      if (parts.length >= 3) {
        const dObj = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
        dObj.setHours(0, 0, 0, 0);
        diffDays = Math.floor((hoje.getTime() - dObj.getTime()) / (1000 * 60 * 60 * 24));
      }
    }

    const isVencido = temAgendamento && diffDays >= 7;

    return {
      ...t,
      agendamento,
      temAgendamento,
      diffDays,
      isVencido,
    };
  });

  // RANKING DINÂMICO
  const trechosOrdenadosDinamicos = [...trechosEnriquecidos].sort((a, b) => {
    const urgentA = a.prioridade === "ALTA" || a.isVencido;
    const urgentB = b.prioridade === "ALTA" || b.isVencido;

    if (urgentA && !urgentB) return -1;
    if (urgentB && !urgentA) return 1;

    const diasA = a.dias_para_corte ?? 999;
    const diasB = b.dias_para_corte ?? 999;
    if (diasA !== diasB) return diasA - diasB;

    const scoreA = a.score_risco ?? 0;
    const scoreB = b.score_risco ?? 0;
    return scoreB - scoreA;
  });

  // FILTRO POR PRIORIDADE
  const trechosFiltrados = trechosOrdenadosDinamicos.filter((t) => {
    if (prioridadeFilter === "TODAS") return true;
    const norm = String(t?.prioridade || "").toUpperCase().trim();
    if (prioridadeFilter === "MEDIA") {
      return norm === "MEDIA" || norm === "MÉDIA";
    }
    return norm === prioridadeFilter;
  });

  if (safeTrechos.length === 0) {
    return (
      <div className="bg-[#1E242C] border border-[#2A323D] rounded-2xl p-8 text-center text-slate-400">
        <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" strokeWidth={2} />
        <p className="text-xs font-medium">Nenhum trecho retornado no momento.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#1E242C] border border-[#2A323D] rounded-2xl shadow-xl overflow-hidden">
      
      {/* Header do Card com Filtro por Prioridade */}
      <div className="p-4 border-b border-[#2A323D] bg-[#12171E] flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#B5FF57] animate-pulse"></span>
            <h2 className="text-base font-bold text-white font-sans tracking-tight">
              Ranking de Prioridade de Roçagem
            </h2>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Trechos rodoviários ordenados por nível de urgência e acompanhamento de ordens de serviço
          </p>
        </div>
        
        {/* PÍLULAS DE FILTRO POR PRIORIDADE */}
        <div className="flex items-center space-x-1 bg-[#0B0F14] p-1 rounded-xl border border-[#2A323D] self-start md:self-auto">
          <span className="text-[10px] font-mono font-bold text-slate-400 px-2 flex items-center">
            <Filter className="w-3 h-3 mr-1 text-[#B5FF57]" strokeWidth={2} /> Prioridade:
          </span>
          {[
            { id: "TODAS", label: "Todas" },
            { id: "ALTA", label: "Alta" },
            { id: "MEDIA", label: "Média" },
            { id: "BAIXA", label: "Baixa" },
          ].map((item) => {
            const isActive = prioridadeFilter === item.id;
            let activeColor = "bg-[#B5FF57] text-slate-950 font-black";
            if (item.id === "ALTA") activeColor = "bg-red-500 text-white font-black";
            if (item.id === "MEDIA") activeColor = "bg-amber-400 text-slate-950 font-black";
            if (item.id === "BAIXA") activeColor = "bg-slate-700 text-white font-black";

            return (
              <button
                key={item.id}
                onClick={() => setPrioridadeFilter(item.id)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  isActive ? activeColor : "text-slate-400 hover:text-white hover:bg-[#1E242C]"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tabela com Estrutura Limpa */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#0B0F14] text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider border-b border-[#2A323D]">
              <th className="py-3 px-3 text-center w-12">#</th>
              <th className="py-3 px-4">Rodovia & Trecho</th>
              <th className="py-3 px-3 text-center">Altura / Umidade</th>
              <th className="py-3 px-3 text-center">Previsão Corte</th>
              <th className="py-3 px-4 text-center">Prioridade</th>
              <th className="py-3 px-4 text-center">Status Agendamento</th>
              <th className="py-3 px-3 text-center">Ação Imediata</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2A323D]/60 text-xs">
            {trechosFiltrados.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400 italic font-mono">
                  Nenhum trecho encontrado para o filtro de prioridade selecionado ({prioridadeFilter}).
                </td>
              </tr>
            ) : (
              trechosFiltrados.map((trecho, index) => {
                const dias = trecho?.dias_para_corte;
                const isToday = dias === 0;
                const temAgendamento = trecho.temAgendamento;
                const agendamento = trecho.agendamento;

                const normPriority = String(trecho?.prioridade || "").toUpperCase().trim();
                const isAlta = normPriority === "ALTA" || trecho.isVencido;
                const isMedia = normPriority === "MEDIA" || normPriority === "MÉDIA";

                // Barra lateral discreta de indicação visual
                const rowHighlightClass = isAlta
                  ? "border-l-4 border-l-red-500 hover:bg-[#12171E]/80 transition-colors"
                  : isMedia
                  ? "border-l-4 border-l-amber-400 hover:bg-[#12171E]/80 transition-colors"
                  : "border-l-4 border-l-transparent hover:bg-[#12171E]/60 transition-colors";

                return (
                  <tr 
                    key={trecho?.trecho_id || `trecho-rank-${index}`}
                    className={rowHighlightClass}
                  >
                    {/* Posicional Rank Dinâmico */}
                    <td className="py-3.5 px-3 text-center font-bold font-mono">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-md text-[11px] tabular-nums ${
                        isAlta ? "bg-red-500 text-white font-black shadow-sm" :
                        isMedia ? "bg-amber-400 text-slate-950 font-extrabold shadow-sm" :
                        index === 0 ? "bg-[#B5FF57] text-slate-950 font-black" :
                        "bg-[#12171E] text-slate-400 border border-[#2A323D]"
                      }`}>
                        {index + 1}
                      </span>
                    </td>

                    {/* Rodovia & Nome do Trecho */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white flex items-center space-x-2">
                        <span>{trecho?.rodovia || "Rodovia"} — {trecho?.nome || trecho?.trecho || "Trecho"}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center mt-0.5">
                        <MapPin className="w-3 h-3 mr-1 text-slate-500" strokeWidth={1.75} />
                        KM {trecho?.km != null ? trecho.km : (trecho?.km_inicial != null ? `${trecho.km_inicial}-${trecho.km_final}` : "-")} ({trecho?.municipio || ""})
                      </div>
                    </td>

                    {/* Altura Grama / Umidade Solo */}
                    <td className="py-3.5 px-3 text-center font-mono tabular-nums">
                      <div className="text-slate-200">
                        <span className="font-bold text-white">{trecho?.altura_grama_cm != null ? `${trecho.altura_grama_cm} cm` : (trecho?.altura_atual_cm != null ? `${trecho.altura_atual_cm} cm` : "-")}</span>
                        <span className="text-[10px] text-slate-400 ml-1">({trecho?.umidade_solo != null ? `${trecho.umidade_solo}% umid.` : "N/A"})</span>
                      </div>
                    </td>

                    {/* Previsão de Corte */}
                    <td className="py-3.5 px-3 text-center font-mono tabular-nums">
                      {dias == null ? (
                        <span className="text-slate-500 text-[11px] italic">Sem previsão</span>
                      ) : isToday ? (
                        <span className="text-red-400 font-extrabold text-xs inline-flex items-center">
                          <Clock className="w-3.5 h-3.5 mr-1" strokeWidth={2} />
                          Hoje (Devido)
                        </span>
                      ) : (
                        <span className="text-slate-200 font-bold">
                          {dias} {dias === 1 ? "dia" : "dias"}
                        </span>
                      )}
                    </td>

                    {/* Prioridade em texto limpo */}
                    <td className="py-3.5 px-4 text-center">
                      <PriorityBadge priority={trecho?.prioridade} />
                    </td>

                    {/* STATUS DE AGENDAMENTO ESTRUTURADO EM TEXTO + ÍCONE */}
                    <td className="py-3.5 px-4 text-center">
                      {renderAgendamentoStatus(agendamento, temAgendamento)}
                    </td>

                    {/* BOTÃO DE AÇÃO */}
                    <td className="py-3.5 px-3 text-center">
                      {temAgendamento ? (
                        <button
                          onClick={() => {
                            if (typeof onRegisterCutForTrecho === "function") {
                              onRegisterCutForTrecho(trecho);
                            }
                          }}
                          className={`px-3.5 py-1.5 rounded-lg border font-bold text-xs transition flex items-center justify-center space-x-1.5 mx-auto shadow-sm ${
                            trecho.isVencido 
                              ? "bg-red-500 hover:bg-red-600 text-white border-red-500 font-black" 
                              : "bg-[#12171E] hover:bg-[#2A323D] text-slate-200 border-[#2A323D]"
                          }`}
                          title="Reagendar ou atualizar ordem de corte"
                        >
                          <Scissors className="w-3.5 h-3.5" strokeWidth={2} />
                          <span>{trecho.isVencido ? "Reagendar" : "Atualizar"}</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            if (typeof onRegisterCutForTrecho === "function") {
                              onRegisterCutForTrecho(trecho);
                            }
                          }}
                          className="px-3.5 py-1.5 rounded-lg bg-[#B5FF57] hover:bg-[#9EE642] text-slate-950 font-extrabold text-xs transition shadow-md flex items-center justify-center space-x-1.5 mx-auto"
                          title="Criar agendamento de corte imediato"
                        >
                          <Scissors className="w-3.5 h-3.5" strokeWidth={2.5} />
                          <span>+ Agendar Corte</span>
                        </button>
                      )}
                    </td>

                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
