import React from "react";

export function PriorityBadge({ priority }) {
  const norm = typeof priority === "string" 
    ? priority.toUpperCase().trim() 
    : String(priority || "").toUpperCase().trim();
  
  if (norm === "ALTA") {
    return (
      <span className="inline-flex items-center text-xs font-extrabold text-red-400 tracking-wide uppercase">
        <span className="w-2 h-2 rounded-full bg-red-500 mr-1.5 animate-pulse"></span>
        Alta
      </span>
    );
  }
  
  if (norm === "MEDIA" || norm === "MÉDIA") {
    return (
      <span className="inline-flex items-center text-xs font-bold text-amber-400 tracking-wide uppercase">
        <span className="w-2 h-2 rounded-full bg-amber-400 mr-1.5"></span>
        Média
      </span>
    );
  }

  if (norm === "SEM_DADOS" || norm === "SEM DADOS" || !priority) {
    return (
      <span className="inline-flex items-center text-xs font-semibold text-slate-400 tracking-wide uppercase">
        <span className="w-2 h-2 rounded-full bg-slate-500 mr-1.5"></span>
        Sem Dados
      </span>
    );
  }

  return (
    <span className="inline-flex items-center text-xs font-medium text-slate-400 tracking-wide uppercase">
      <span className="w-2 h-2 rounded-full bg-[#B5FF57] mr-1.5"></span>
      Baixa
    </span>
  );
}

export function ScoreBadge({ score }) {
  const parsed = typeof score === "number" ? score : parseFloat(score);
  const numScore = isNaN(parsed) ? 0 : parsed;

  let color = "text-slate-400";
  
  if (numScore >= 75) {
    color = "text-red-400 font-bold";
  } else if (numScore >= 60) {
    color = "text-amber-400 font-semibold";
  }

  return (
    <span className={`text-xs font-mono tabular-nums ${color}`}>
      {numScore.toFixed(1)}
    </span>
  );
}
