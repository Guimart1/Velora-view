import React from "react";
import { Navigation, AlertTriangle, Droplets, Calendar, CloudRain } from "lucide-react";

export function SummaryCards({ cardsData }) {
  if (!cardsData || typeof cardsData !== "object") return null;

  const total_trechos_monitorados = typeof cardsData.total_trechos_monitorados === "number" 
    ? cardsData.total_trechos_monitorados 
    : (Number(cardsData.total_trechos_monitorados) || 0);

  const alertas_alta_prioridade = typeof cardsData.alertas_alta_prioridade === "number" 
    ? cardsData.alertas_alta_prioridade 
    : (Number(cardsData.alertas_alta_prioridade) || 0);

  const parsedUmidade = typeof cardsData.media_umidade_solo === "number" 
    ? cardsData.media_umidade_solo 
    : parseFloat(cardsData.media_umidade_solo);
  const media_umidade_solo = isNaN(parsedUmidade) ? 0 : parsedUmidade;

  const menor_previsao_corte_dias = cardsData.menor_previsao_corte_dias != null 
    ? Number(cardsData.menor_previsao_corte_dias) 
    : null;

  const parsedChuva = typeof cardsData.media_chuva_prevista_24h_mm === "number" 
    ? cardsData.media_chuva_prevista_24h_mm 
    : parseFloat(cardsData.media_chuva_prevista_24h_mm);
  const media_chuva_prevista_24h_mm = isNaN(parsedChuva) ? 0 : parsedChuva;

  const isToday = menor_previsao_corte_dias === 0;

  const cards = [
    {
      title: "Trechos Monitorados",
      value: total_trechos_monitorados,
      unit: "setores em operação",
      icon: Navigation,
      valueColor: "text-white",
    },
    {
      title: "Alertas Críticos",
      value: alertas_alta_prioridade,
      unit: "ação imediata necessária",
      icon: AlertTriangle,
      valueColor: alertas_alta_prioridade > 0 ? "text-red-400 font-bold" : "text-[#B5FF57]",
    },
    {
      title: "Média Umidade do Solo",
      value: `${media_umidade_solo.toFixed(1)}%`,
      unit: "sensores de telemetria",
      icon: Droplets,
      valueColor: "text-white",
    },
    {
      title: "Próximo Corte Devido",
      value: menor_previsao_corte_dias == null 
        ? "N/A" 
        : (isToday ? "Hoje" : `${menor_previsao_corte_dias} dias`),
      unit: isToday ? "devido imediatamente" : "próxima janela",
      icon: Calendar,
      valueColor: isToday ? "text-amber-400 font-bold" : "text-white",
    },
    {
      title: "Volume de Chuva (24h)",
      value: `${media_chuva_prevista_24h_mm.toFixed(1)} mm`,
      unit: "clima externo",
      icon: CloudRain,
      valueColor: "text-white",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="p-4 rounded-2xl bg-[#1E242C] border border-[#2A323D] shadow-xl flex flex-col justify-between transition hover:border-slate-700"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400">
                {card.title}
              </span>
              <div className="p-1.5 rounded-lg bg-[#12171E] border border-[#2A323D] text-[#B5FF57]">
                <Icon className="w-4 h-4" strokeWidth={2} />
              </div>
            </div>
            <div className="mt-3">
              <div className={`text-xl font-bold tracking-tight font-mono tabular-nums ${card.valueColor}`}>
                {card.value}
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">{card.unit}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
