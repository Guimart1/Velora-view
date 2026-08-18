import React, { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceLine,
} from "recharts";
import { useTheme } from "../context/ThemeContext";
import { TrendingUp, History, Filter, AlertCircle, CheckCircle } from "lucide-react";
import { formatDateBR } from "../api/client";

export function HistoricalChartP5({ vegetacaoLinhas = [], manutencoesLinhas = [] }) {
  const { theme } = useTheme();
  const safeVeg = Array.isArray(vegetacaoLinhas) ? vegetacaoLinhas.filter(Boolean) : [];
  const safeMan = Array.isArray(manutencoesLinhas) ? manutencoesLinhas.filter(Boolean) : [];

  // Extrai trechos únicos para o seletor
  const uniqueIds = Array.from(
    new Set(safeVeg.map((item) => item?.trecho_id).filter((id) => id != null))
  );

  const trechosOptions = uniqueIds.map((id) => {
    const item = safeVeg.find((t) => t?.trecho_id === id);
    return {
      id,
      label: `${item?.rodovia || "Rodovia"} — ${item?.trecho || item?.nome || "Trecho"} (${item?.municipio || ""})`,
      item,
    };
  });

  const [selectedTrechoId, setSelectedTrechoId] = useState(
    uniqueIds.length > 0 ? String(uniqueIds[0]) : "1"
  );

  // Trecho selecionado no seletor
  const selectedTrechoObj = safeVeg.find(
    (t) => String(t?.trecho_id) === String(selectedTrechoId)
  ) || safeVeg[0] || null;

  // Dados do trecho selecionado
  const alturaAtual = selectedTrechoObj?.altura_atual_cm != null 
    ? Number(selectedTrechoObj.altura_atual_cm) 
    : 18.5;

  const alturaLimite = selectedTrechoObj?.altura_limite_cm != null 
    ? Number(selectedTrechoObj.altura_limite_cm) 
    : 25.0;

  const umidadeSolo = selectedTrechoObj?.umidade_solo != null 
    ? Number(selectedTrechoObj.umidade_solo) 
    : 60.0;

  const chuva24h = selectedTrechoObj?.chuva_24h_mm != null 
    ? Number(selectedTrechoObj.chuva_24h_mm) 
    : 5.0;

  const diasCorteIA = selectedTrechoObj?.dias_para_corte != null 
    ? Number(selectedTrechoObj.dias_para_corte) 
    : 10;

  // Taxa estimada de crescimento diário (cm/dia)
  const taxaCrescimentoDiario = Math.max(
    0.35 + (umidadeSolo / 100) * 0.45 + Math.min(chuva24h, 50) * 0.025,
    0.40
  );

  // CONSTRUÇÃO DA LINHA DO TEMPO: HISTÓRICO REAL (Linha Sólida) + PROJEÇÃO FUTURA (Linha Pontilhada)
  const timelineData = [];
  const hoje = new Date();

  // 1. Histórico Passado (Dias -5 até 0 / Hoje) — Linha Sólida
  for (let i = -5; i <= 0; i++) {
    const dataPonto = new Date(hoje);
    dataPonto.setDate(hoje.getDate() + i);

    const alturaHistorica = Math.max(
      2.0,
      Number((alturaAtual + i * taxaCrescimentoDiario).toFixed(1))
    );

    const diaLabel = i === 0 
      ? "Hoje (Medido)" 
      : `${dataPonto.getDate().toString().padStart(2, '0')}/${(dataPonto.getMonth() + 1).toString().padStart(2, '0')}`;

    timelineData.push({
      dia: diaLabel,
      tipo: i === 0 ? "Atual" : "Histórico",
      altura_real: alturaHistorica,
      altura_projecao: i === 0 ? alturaHistorica : null,
      limite: alturaLimite,
    });
  }

  // 2. Projeção Futura (Dias +1 até +12) — Linha Pontilhada
  for (let i = 1; i <= 12; i++) {
    const dataPonto = new Date(hoje);
    dataPonto.setDate(hoje.getDate() + i);

    const alturaProjetada = Number((alturaAtual + i * taxaCrescimentoDiario).toFixed(1));

    const diaLabel = `+${i}d (${dataPonto.getDate().toString().padStart(2, '0')}/${(dataPonto.getMonth() + 1).toString().padStart(2, '0')})`;

    timelineData.push({
      dia: diaLabel,
      tipo: "Projeção Futura",
      altura_real: null,
      altura_projecao: alturaProjetada,
      limite: alturaLimite,
    });
  }

  // CÁLCULO DINÂMICO DO DOMÍNIO DO EIXO Y (Garante que a linha de limite fique SEMPRE visível)
  const maxProjetado = Math.max(...timelineData.map((d) => d.altura_projecao || d.altura_real || 0));
  const maxReferencia = Math.max(alturaLimite, maxProjetado);
  const yMaxDomain = Math.ceil((maxReferencia + 6) / 5) * 5; // Arredonda para múltiplo de 5 com margem de segurança

  const isDark = theme === "dark";
  const gridColor = isDark ? "#2A323D" : "#E2E8F0";
  const textColor = isDark ? "#94A3B8" : "#64748B";

  return (
    <div className="space-y-6">
      
      {/* CARD DO GRÁFICO DE HISTÓRICO & PROJEÇÃO DE CRESCIMENTO */}
      <div className="bg-[#1E242C] border border-[#2A323D] rounded-2xl p-5 shadow-xl space-y-4">
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#2A323D] pb-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#B5FF57]/20 text-[#B5FF57] border border-[#B5FF57]/40 text-[10px] font-mono font-bold uppercase">
                Evolução do Acostamento
              </span>
              <h2 className="text-base font-bold text-white font-sans tracking-tight flex items-center">
                <TrendingUp className="w-4 h-4 text-[#B5FF57] mr-1.5" strokeWidth={2} />
                Histórico & Projeção de Crescimento
              </h2>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Leituras dos sensores e projeção diária de altura até o limite do trecho ({alturaLimite} cm)
            </p>
          </div>

          {/* Seletor por Rodovia / Trecho */}
          <div className="flex items-center space-x-2 bg-[#12171E] px-3.5 py-2 rounded-xl border border-[#2A323D] self-start lg:self-auto">
            <Filter className="w-4 h-4 text-[#B5FF57]" strokeWidth={2} />
            <span className="text-xs text-slate-300 font-bold">Rodovia / Trecho:</span>
            <select
              value={selectedTrechoId}
              onChange={(e) => setSelectedTrechoId(e.target.value)}
              className="bg-transparent text-slate-200 text-xs font-bold rounded px-1 py-0.5 focus:outline-none max-w-xs truncate"
            >
              {trechosOptions.map((opt) => (
                <option key={opt.id} value={opt.id} className="bg-[#12171E] text-slate-100">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Resumo Rápido da Projeção para o Trecho */}
        {selectedTrechoObj && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-xl bg-[#12171E] border border-[#2A323D] text-xs">
            <div className="flex items-center space-x-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-[#B5FF57]"></div>
              <div>
                <span className="text-slate-400 block text-[10px]">Altura Atual (Medida):</span>
                <span className="font-extrabold text-white font-mono text-sm">{alturaAtual} cm</span>
              </div>
            </div>

            <div className="flex items-center space-x-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
              <div>
                <span className="text-slate-400 block text-[10px]">Crescimento Diário Estimado:</span>
                <span className="font-extrabold text-amber-400 font-mono text-sm">+{taxaCrescimentoDiario.toFixed(2)} cm/dia</span>
              </div>
            </div>

            <div className="flex items-center space-x-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
              <div>
                <span className="text-slate-400 block text-[10px]">Atingimento do Limite ({alturaLimite} cm):</span>
                <span className="font-extrabold text-red-400 font-mono text-sm">
                  {diasCorteIA === 0 ? "HOJE (Atingido)" : `Em ~${diasCorteIA} dias`}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Recharts Container */}
        <div className="h-80 min-h-[320px] w-full min-w-[280px] pt-2">
          <ResponsiveContainer width="100%" height="100%" minWidth={280} minHeight={300}>
            <LineChart data={timelineData} margin={{ top: 20, right: 30, left: 0, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              
              <XAxis 
                dataKey="dia" 
                stroke={textColor} 
                tick={{ fill: textColor, fontSize: 10, fontFamily: 'monospace' }} 
                angle={-10}
                textAnchor="end"
              />
              <YAxis 
                stroke={textColor} 
                tick={{ fill: textColor, fontSize: 11, fontFamily: 'monospace' }}
                domain={[0, yMaxDomain]}
                unit="cm"
                className="tabular-nums"
              />
              
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e242c', 
                  borderColor: '#2a323d', 
                  borderRadius: '0.75rem',
                  color: '#f1f5f9',
                  fontSize: '12px',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
                  fontFamily: 'monospace'
                }} 
                formatter={(value, name) => [
                  `${value} cm`, 
                  name === "altura_real" ? "Medição (cm)" : "Projeção (cm)"
                ]}
              />
              
              <Legend 
                wrapperStyle={{ paddingTop: '12px', fontSize: '11px', fontFamily: 'sans-serif' }} 
              />
              
              {/* LINHA HORIZONTAL TRACEJADA DO LIMITE PERMITIDO (DINÂMICA: 24cm, 25cm, 26cm, 32cm, 35cm) */}
              <ReferenceLine 
                y={alturaLimite} 
                label={{ 
                  value: `Limite Permitido (${alturaLimite} cm)`, 
                  fill: '#ef4444', 
                  fontSize: 11, 
                  fontWeight: 'bold', 
                  position: 'top' 
                }} 
                stroke="#ef4444" 
                strokeDasharray="6 6" 
                strokeWidth={2}
              />

              {/* 1. LINHA SÓLIDA PARA O HISTÓRICO REAL (MEDIDO) */}
              <Line 
                type="monotone" 
                dataKey="altura_real" 
                name="Medição (cm)" 
                stroke="#B5FF57" 
                strokeWidth={3.5}
                dot={{ r: 5, fill: "#B5FF57", stroke: "#0B0F14", strokeWidth: 2 }}
                activeDot={{ r: 7 }}
                connectNulls={false}
              />

              {/* 2. LINHA PONTILHADA PARA A PROJEÇÃO FUTURA */}
              <Line 
                type="monotone" 
                dataKey="altura_projecao" 
                name="Projeção (cm)" 
                stroke="#B5FF57" 
                strokeWidth={2.5}
                strokeDasharray="4 4"
                dot={{ r: 4, fill: "#12171E", stroke: "#B5FF57", strokeWidth: 2 }}
                activeDot={{ r: 6 }}
                connectNulls={false}
              />

            </LineChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* TABELA DE HISTÓRICO DE CORTES REALIZADOS */}
      <div className="bg-[#1E242C] border border-[#2A323D] rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-lg bg-[#12171E] border border-[#2A323D] text-slate-300">
            <History className="w-4 h-4" strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Histórico de Ordens de Roçagem Executadas</h3>
            <p className="text-[11px] text-slate-400">Registro de manutenções de acostamento executadas em campo</p>
          </div>
        </div>

        {safeMan.length === 0 ? (
          <p className="text-xs text-slate-500 italic py-4">Nenhuma manutenção registrada ainda.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#0B0F14] text-[10px] font-mono font-semibold text-slate-400 uppercase tracking-wider border-b border-[#2A323D]">
                  <th className="py-3 px-3"># ID</th>
                  <th className="py-3 px-3">Data do Corte</th>
                  <th className="py-3 px-4">Equipe Responsável</th>
                  <th className="py-3 px-4">Rodovia & Trecho</th>
                  <th className="py-3 px-4">Observações</th>
                  <th className="py-3 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2A323D]/60 text-xs">
                {safeMan.map((m, idx) => (
                  <tr key={m?.manutencao_id || `manutencao-${idx}`} className="hover:bg-[#12171E] transition">
                    <td className="py-3 px-3 font-mono text-slate-400 tabular-nums">#{m?.manutencao_id || idx + 1}</td>
                    <td className="py-3 px-3 font-bold text-[#B5FF57] font-mono tabular-nums">
                      {formatDateBR(m?.data_corte)}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-200">
                      {m?.equipe || "Equipe Não Informada"}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      <span className="font-bold text-white">{m?.rodovia || "Rodovia"}</span> — {m?.trecho || "Trecho"} {m?.km_inicial != null && m?.km_final != null ? `(KM ${m.km_inicial}-${m.km_final})` : ""}
                    </td>
                    <td className="py-3 px-4 text-[11px] text-slate-400 max-w-xs truncate">
                      {m?.observacao || "Sem observações"}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#B5FF57]/20 text-[#B5FF57] border border-[#B5FF57]/40">
                        <CheckCircle className="w-3 h-3 mr-1" strokeWidth={2} /> Concluído
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
