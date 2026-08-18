import React, { useState } from "react";
import { Scissors, Filter, Calendar, MapPin, CheckCircle, Search, Users, RotateCcw } from "lucide-react";
import { formatDateBR } from "../api/client";

export function CortesView({ manutencoesLinhas = [] }) {
  const [selectedRodovia, setSelectedRodovia] = useState("TODAS");
  const [selectedEquipe, setSelectedEquipe] = useState("TODAS");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const safeLinhas = Array.isArray(manutencoesLinhas) ? manutencoesLinhas.filter(Boolean) : [];

  // Extrai lista única de rodovias com a contagem de cortes
  const rodoviasMap = safeLinhas.reduce((acc, item) => {
    const rod = item?.rodovia || "Outras Rodovias";
    acc[rod] = (acc[rod] || 0) + 1;
    return acc;
  }, {});

  const listaRodovias = Object.keys(rodoviasMap).sort();

  // Extrai lista única de equipes para o filtro
  const listaEquipes = Array.from(
    new Set(safeLinhas.map((item) => item?.equipe).filter(Boolean))
  ).sort();

  // Resetar todos os filtros
  const handleResetFilters = () => {
    setSelectedRodovia("TODAS");
    setSelectedEquipe("TODAS");
    setDataInicio("");
    setDataFim("");
    setSearchTerm("");
  };

  // Filtragem dos cortes por Rodovia, Equipe, Período de Data e Busca por Texto
  const cortesFiltrados = safeLinhas.filter((item) => {
    // 1. Filtro de Rodovia
    const rod = item?.rodovia || "Outras Rodovias";
    const matchesRodovia = selectedRodovia === "TODOS" || selectedRodovia === "TODAS" || rod === selectedRodovia;

    // 2. Filtro de Equipe
    const eq = item?.equipe || "Não Informada";
    const matchesEquipe = selectedEquipe === "TODAS" || eq === selectedEquipe;

    // 3. Filtro de Período de Data (dataInicio e dataFim)
    const itemData = item?.data_corte ? String(item.data_corte).split("T")[0] : "";
    let matchesData = true;
    if (dataInicio && itemData) {
      matchesData = matchesData && itemData >= dataInicio;
    }
    if (dataFim && itemData) {
      matchesData = matchesData && itemData <= dataFim;
    }

    // 4. Busca por texto livre
    const searchLower = String(searchTerm || "").toLowerCase().trim();
    const rodoviaStr = String(item?.rodovia || "").toLowerCase();
    const trechoStr = String(item?.trecho || item?.nome || "").toLowerCase();
    const equipeStr = String(item?.equipe || "").toLowerCase();
    const obsStr = String(item?.observacao || "").toLowerCase();

    const matchesSearch =
      !searchLower ||
      rodoviaStr.includes(searchLower) ||
      trechoStr.includes(searchLower) ||
      equipeStr.includes(searchLower) ||
      obsStr.includes(searchLower);

    return matchesRodovia && matchesEquipe && matchesData && matchesSearch;
  });

  // Agrupar cortes filtrados por Rodovia para exibição organizada em blocos
  const cortesAgrupadosPorRodovia = cortesFiltrados.reduce((acc, item) => {
    const rod = item?.rodovia || "Outras Rodovias";
    if (!acc[rod]) acc[rod] = [];
    acc[rod].push(item);
    return acc;
  }, {});

  const hasActiveFilters = selectedRodovia !== "TODAS" || selectedEquipe !== "TODAS" || dataInicio || dataFim || searchTerm;

  return (
    <div className="space-y-6">
      
      {/* Header da Tela & Painel de Filtros */}
      <div className="bg-[#1E242C] border border-[#2A323D] rounded-2xl p-5 shadow-xl space-y-4">
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-[#2A323D] pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-[#B5FF57]/20 text-[#B5FF57] border border-[#B5FF57]/40 flex items-center justify-center">
              <Scissors className="w-5 h-5" strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-sans tracking-tight">
                Histórico de Cortes Realizados
              </h2>
              <p className="text-[11px] text-slate-400">
                Filtros combinados por rodovia, equipe responsável, período de execução e busca por texto
              </p>
            </div>
          </div>

          {/* Campo de Busca Rápida */}
          <div className="relative w-full lg:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" strokeWidth={2} />
            <input
              type="text"
              placeholder="Buscar equipe, trecho, obs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#12171E] border border-[#2A323D] text-slate-200 text-xs rounded-xl pl-9 pr-3 py-1.5 focus:outline-none focus:border-[#B5FF57]"
            />
          </div>
        </div>

        {/* Seleção de Rodovia */}
        <div className="space-y-2">
          <div className="flex items-center space-x-1.5 text-xs text-slate-300 font-bold">
            <Filter className="w-3.5 h-3.5 text-[#B5FF57]" strokeWidth={2} />
            <span>Rodovia:</span>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedRodovia("TODAS")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                selectedRodovia === "TODOS" || selectedRodovia === "TODAS"
                  ? "bg-[#B5FF57] text-slate-950 font-black"
                  : "bg-[#12171E] text-slate-300 hover:bg-[#2A323D] border border-[#2A323D]"
              }`}
            >
              Todas as Rodovias ({safeLinhas.length})
            </button>

            {listaRodovias.map((rod) => {
              const count = rodoviasMap[rod] || 0;
              const isSelected = selectedRodovia === rod;
              return (
                <button
                  key={rod}
                  onClick={() => setSelectedRodovia(rod)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                    isSelected
                      ? "bg-[#B5FF57] text-slate-950 font-black"
                      : "bg-[#12171E] text-slate-300 hover:bg-[#2A323D] border border-[#2A323D]"
                  }`}
                >
                  <MapPin className={`w-3 h-3 ${isSelected ? "text-slate-950" : "text-[#B5FF57]"}`} strokeWidth={2} />
                  <span>{rod}</span>
                  <span className={`px-1.5 py-0.2 rounded text-[10px] ${isSelected ? "bg-slate-950 text-[#B5FF57]" : "bg-[#2A323D] text-slate-300"}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* FILTROS AVANÇADOS: EQUIPE E PERÍODO DE DATA */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-[#2A323D]/60 text-xs">
          
          {/* Filtro por Equipe */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-300 flex items-center space-x-1">
              <Users className="w-3.5 h-3.5 text-[#B5FF57]" strokeWidth={2} />
              <span>Equipe Responsável:</span>
            </label>
            <select
              value={selectedEquipe}
              onChange={(e) => setSelectedEquipe(e.target.value)}
              className="w-full bg-[#12171E] border border-[#2A323D] rounded-xl px-3 py-1.5 text-slate-200 focus:outline-none focus:border-[#B5FF57] font-semibold truncate"
            >
              <option value="TODAS">Todas as Equipes</option>
              {listaEquipes.map((eq) => (
                <option key={eq} value={eq}>
                  {eq}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro por Data (Início) */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-300 flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-[#B5FF57]" strokeWidth={2} />
              <span>Data Inicial:</span>
            </label>
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="w-full bg-[#12171E] border border-[#2A323D] rounded-xl px-3 py-1.5 text-slate-200 focus:outline-none focus:border-[#B5FF57] font-mono tabular-nums"
            />
          </div>

          {/* Filtro por Data (Fim) */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-300 flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-[#B5FF57]" strokeWidth={2} />
              <span>Data Final:</span>
            </label>
            <input
              type="date"
              value={dataFim}
              onChange={(e) => setDataFim(e.target.value)}
              className="w-full bg-[#12171E] border border-[#2A323D] rounded-xl px-3 py-1.5 text-slate-200 focus:outline-none focus:border-[#B5FF57] font-mono tabular-nums"
            />
          </div>

          {/* Botão de Limpar Filtros */}
          <div className="flex items-end">
            {hasActiveFilters ? (
              <button
                onClick={handleResetFilters}
                className="w-full py-1.5 px-3 rounded-xl bg-[#12171E] hover:bg-[#2A323D] text-slate-300 font-bold border border-[#2A323D] transition flex items-center justify-center space-x-1.5"
                title="Limpar todos os filtros selecionados"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-400" strokeWidth={2} />
                <span>Limpar Filtros</span>
              </button>
            ) : (
              <div className="w-full text-[11px] text-slate-500 font-mono text-center py-2 italic">
                {cortesFiltrados.length} cortes encontrados
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Exibição Agrupada Bloco por Bloco de Cada Rodovia */}
      {Object.keys(cortesAgrupadosPorRodovia).length === 0 ? (
        <div className="bg-[#1E242C] border border-[#2A323D] rounded-2xl p-8 text-center text-slate-400 text-xs">
          Nenhum registro de corte encontrado para os filtros selecionados.
        </div>
      ) : (
        Object.keys(cortesAgrupadosPorRodovia).map((rodoviaName) => {
          const manutencoesDaRodovia = cortesAgrupadosPorRodovia[rodoviaName] || [];

          return (
            <div
              key={rodoviaName}
              className="bg-[#1E242C] border border-[#2A323D] rounded-2xl shadow-xl overflow-hidden space-y-0"
            >
              {/* Header do Card da Rodovia */}
              <div className="p-4 bg-[#12171E] border-b border-[#2A323D] flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#B5FF57]/20 text-[#B5FF57] border border-[#B5FF57]/40 flex items-center justify-center font-bold">
                    <MapPin className="w-4 h-4" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white font-sans flex items-center space-x-2">
                      <span>Rodovia {rodoviaName}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#B5FF57]/10 text-[#B5FF57] border border-[#B5FF57]/30">
                        {manutencoesDaRodovia.length} {manutencoesDaRodovia.length === 1 ? "corte registrado" : "cortes registrados"}
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Histórico de intervenções de roçagem de acostamento
                    </p>
                  </div>
                </div>

                <span className="text-[11px] font-mono text-slate-400 bg-[#0B0F14] px-3 py-1 rounded-md border border-[#2A323D] hidden sm:inline">
                  Acostamento Motiva
                </span>
              </div>

              {/* Tabela Específica da Rodovia */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#0B0F14] text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider border-b border-[#2A323D]">
                      <th className="py-2.5 px-3 text-center w-14"># ID</th>
                      <th className="py-2.5 px-4">Data do Corte</th>
                      <th className="py-2.5 px-4">Trecho / Quilometragem</th>
                      <th className="py-2.5 px-4">Equipe Responsável</th>
                      <th className="py-2.5 px-3 text-center">Altura no Corte</th>
                      <th className="py-2.5 px-4">Observação Operacional</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2A323D]/60 text-xs">
                    {manutencoesDaRodovia.map((m, idx) => (
                      <tr key={m?.manutencao_id || `man-rod-${idx}`} className="hover:bg-[#12171E] transition">
                        
                        {/* ID da Manutenção */}
                        <td className="py-3 px-3 text-center font-mono text-slate-400 tabular-nums">
                          #{m?.manutencao_id || idx + 1}
                        </td>

                        {/* Data do Corte */}
                        <td className="py-3 px-4 font-bold text-[#B5FF57] font-mono tabular-nums">
                          <div className="flex items-center space-x-1.5">
                            <Calendar className="w-3.5 h-3.5 text-[#B5FF57]" strokeWidth={2} />
                            <span>{formatDateBR(m?.data_corte)}</span>
                          </div>
                        </td>

                        {/* Trecho / KM */}
                        <td className="py-3 px-4 font-semibold text-white">
                          <div>{m?.trecho || m?.nome || "Trecho Rodoviário"}</div>
                          <div className="text-[11px] font-mono text-slate-400 font-normal">
                            {m?.km_inicial != null && m?.km_final != null 
                              ? `KM ${m.km_inicial} ao ${m.km_final}` 
                              : (m?.km != null ? `KM ${m.km}` : (m?.municipio || ""))}
                          </div>
                        </td>

                        {/* Equipe Responsável */}
                        <td className="py-3 px-4 text-slate-200 font-medium">
                          {m?.equipe || "Equipe Não Informada"}
                        </td>

                        {/* Altura no Corte (cm) */}
                        <td className="py-3 px-3 text-center font-mono tabular-nums">
                          {m?.altura_grama_no_corte_cm != null ? (
                            <span className="font-bold text-slate-200">{m.altura_grama_no_corte_cm} cm</span>
                          ) : (
                            <span className="text-slate-500 italic text-[11px]">-</span>
                          )}
                        </td>

                        {/* Observação Operacional */}
                        <td className="py-3 px-4 text-[11px] text-slate-400 max-w-xs truncate">
                          {m?.observacao || "Sem observações"}
                        </td>

                        {/* Status Concluído em Texto + Ícone (SEM PÍLULAS CÁPSULAS) */}
                        <td className="py-3 px-3 text-center">
                          <span className="inline-flex items-center space-x-1 font-mono text-xs font-bold text-[#B5FF57]">
                            <CheckCircle className="w-3.5 h-3.5 text-[#B5FF57]" strokeWidth={2} />
                            <span>Concluído</span>
                          </span>
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })
      )}

    </div>
  );
}
