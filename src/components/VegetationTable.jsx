import React, { useState } from "react";
import { PriorityBadge, ScoreBadge } from "./Badge";
import { formatDateBR } from "../api/client";
import { Filter, Scissors, MapPin, Search } from "lucide-react";

export function VegetationTable({ relatorio, onRegisterCutForTrecho }) {
  const [rodoviaFilter, setRodoviaFilter] = useState("TODAS");
  const [prioridadeFilter, setPrioridadeFilter] = useState("TODAS");
  const [searchTerm, setSearchTerm] = useState("");

  const safeRelatorio = relatorio || {};
  const linhas = Array.isArray(safeRelatorio.linhas) ? safeRelatorio.linhas.filter(Boolean) : [];

  const rodoviasDisponiveis = Array.from(
    new Set(linhas.map((l) => l?.rodovia).filter(Boolean))
  );

  const linhasFiltradas = linhas.filter((linha) => {
    if (!linha) return false;
    const matchesRodovia =
      rodoviaFilter === "TODAS" ||
      String(linha.rodovia).toUpperCase() === String(rodoviaFilter).toUpperCase();

    const normPrio = String(linha.prioridade || "").toUpperCase().trim();
    let matchesPrioridade = prioridadeFilter === "TODAS";
    if (prioridadeFilter === "MEDIA") {
      matchesPrioridade = normPrio === "MEDIA" || normPrio === "MÉDIA";
    } else if (!matchesPrioridade) {
      matchesPrioridade = normPrio === prioridadeFilter;
    }

    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      String(linha.rodovia || "").toLowerCase().includes(searchLower) ||
      String(linha.trecho || "").toLowerCase().includes(searchLower) ||
      String(linha.municipio || "").toLowerCase().includes(searchLower);

    return matchesRodovia && matchesPrioridade && matchesSearch;
  });

  return (
    <div className="bg-[#1E242C] border border-[#2A323D] rounded-2xl shadow-xl overflow-hidden space-y-4">
      
      {/* Header com Filtros */}
      <div className="p-4 border-b border-[#2A323D] bg-[#12171E] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white font-sans tracking-tight">
            Relatório Consolidado de Vegetação & Telemetria
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Cadastro rodoviário, leituras de telemetria de campo, estimativa de corte e histórico operacional
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* Busca por texto */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" strokeWidth={2} />
            <input
              type="text"
              placeholder="Buscar trecho ou município..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#1E242C] text-slate-200 text-xs rounded-xl pl-8 pr-3 py-1.5 border border-[#2A323D] focus:outline-none focus:border-[#B5FF57] w-full sm:w-44"
            />
          </div>

          {/* Filtro por Rodovia */}
          <div className="flex items-center space-x-1.5 bg-[#1E242C] px-3 py-1.5 rounded-xl border border-[#2A323D]">
            <Filter className="w-3.5 h-3.5 text-[#B5FF57]" strokeWidth={2} />
            <select
              value={rodoviaFilter}
              onChange={(e) => setRodoviaFilter(e.target.value)}
              className="bg-transparent text-slate-200 text-xs font-bold rounded focus:outline-none"
            >
              <option value="TODAS" className="bg-[#12171E] text-slate-100">Todas Rodovias</option>
              {rodoviasDisponiveis.map((rod) => (
                <option key={rod} value={rod} className="bg-[#12171E] text-slate-100">
                  {rod}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por Prioridade */}
          <div className="flex items-center space-x-1.5 bg-[#1E242C] px-3 py-1.5 rounded-xl border border-[#2A323D]">
            <span className="text-xs text-slate-300 font-bold">Prioridade:</span>
            <select
              value={prioridadeFilter}
              onChange={(e) => setPrioridadeFilter(e.target.value)}
              className="bg-transparent text-slate-200 text-xs font-bold rounded focus:outline-none"
            >
              <option value="TODAS" className="bg-[#12171E] text-slate-100">Todas Prioridades</option>
              <option value="ALTA" className="bg-[#12171E] text-red-400 font-bold">🔴 Alta</option>
              <option value="MEDIA" className="bg-[#12171E] text-amber-400 font-bold">🟡 Média</option>
              <option value="BAIXA" className="bg-[#12171E] text-slate-300 font-bold">🟢 Baixa</option>
            </select>
          </div>

        </div>
      </div>

      {/* Tabela com Barra Lateral por Prioridade (SEM PINTAR O FUNDO DA LINHA) */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#0B0F14] text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider border-b border-[#2A323D]">
              <th className="py-3 px-3 text-center"># ID</th>
              <th className="py-3 px-4">Rodovia & Trecho</th>
              <th className="py-3 px-3 text-center">Altura Medida</th>
              <th className="py-3 px-3 text-center">Altura Limite</th>
              <th className="py-3 px-3 text-center">Umidade Solo</th>
              <th className="py-3 px-3 text-center">Chuva (24h)</th>
              <th className="py-3 px-3 text-center">Previsão</th>
              <th className="py-3 px-4 text-center">Prioridade</th>
              <th className="py-3 px-3 text-center">Score Risco</th>
              <th className="py-3 px-4">Último Corte</th>
              <th className="py-3 px-3 text-center">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2A323D]/60 text-xs">
            {linhasFiltradas.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-8 text-center text-slate-400 italic">
                  Nenhum trecho atende aos critérios de busca.
                </td>
              </tr>
            ) : (
              linhasFiltradas.map((linha, index) => {
                const normPriority = String(linha?.prioridade || "").toUpperCase().trim();
                const isAlta = normPriority === "ALTA";
                const isMedia = normPriority === "MEDIA" || normPriority === "MÉDIA";

                // BARRA LATERAL COLORIDA DE DESTAQUE — SEM PINTAR O FUNDO DA LINHA
                const rowHighlightClass = isAlta
                  ? "border-l-4 border-l-red-500 hover:bg-[#12171E]/80 transition-colors"
                  : isMedia
                  ? "border-l-4 border-l-amber-400 hover:bg-[#12171E]/80 transition-colors"
                  : "border-l-4 border-l-transparent hover:bg-[#12171E]/60 transition-colors";

                return (
                  <tr key={linha?.trecho_id || `veg-${index}`} className={rowHighlightClass}>
                    
                    <td className="py-3 px-3 text-center font-mono text-slate-400 tabular-nums">
                      #{linha?.trecho_id || index + 1}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-white">
                        {linha?.rodovia || "Rodovia"} — {linha?.trecho || "Trecho"}
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center mt-0.5">
                        <MapPin className="w-3 h-3 mr-1 text-slate-500" strokeWidth={1.75} />
                        KM {linha?.km_inicial != null ? `${linha.km_inicial}-${linha.km_final}` : "-"} ({linha?.municipio || ""})
                      </div>
                    </td>

                    <td className="py-3 px-3 text-center font-mono font-bold text-white tabular-nums">
                      {linha?.altura_atual_cm != null ? `${linha.altura_atual_cm} cm` : "-"}
                    </td>

                    <td className="py-3 px-3 text-center font-mono text-slate-300 tabular-nums">
                      {linha?.altura_limite_cm != null ? `${linha.altura_limite_cm} cm` : "-"}
                    </td>

                    <td className="py-3 px-3 text-center font-mono text-slate-300 tabular-nums">
                      {linha?.umidade_solo != null ? `${linha.umidade_solo}%` : "-"}
                    </td>

                    <td className="py-3 px-3 text-center font-mono text-slate-300 tabular-nums">
                      {linha?.chuva_24h_mm != null ? `${linha.chuva_24h_mm} mm` : "-"}
                    </td>

                    <td className="py-3 px-3 text-center font-mono tabular-nums font-bold">
                      {linha?.dias_para_corte != null ? (
                        linha.dias_para_corte === 0 ? (
                          <span className="text-red-400 font-extrabold">HOJE</span>
                        ) : (
                          <span className="text-slate-200">{linha.dias_para_corte}d</span>
                        )
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Não estimada</span>
                      )}
                    </td>

                    {/* Prioridade em texto limpo com o ponto colorido */}
                    <td className="py-3 px-4 text-center">
                      <PriorityBadge priority={linha?.prioridade} />
                    </td>

                    <td className="py-3 px-3 text-center">
                      <ScoreBadge score={linha?.score_risco} />
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-300 text-[11px] tabular-nums">
                      {linha?.ultimo_corte ? formatDateBR(linha.ultimo_corte) : "Sem registro"}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => {
                          if (typeof onRegisterCutForTrecho === "function") {
                            onRegisterCutForTrecho(linha);
                          }
                        }}
                        className="p-1.5 rounded-lg bg-[#12171E] hover:bg-[#2A323D] text-[#B5FF57] border border-[#2A323D] transition shadow-sm"
                        title="Agendar roçagem neste trecho"
                      >
                        <Scissors className="w-3.5 h-3.5" strokeWidth={2} />
                      </button>
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
