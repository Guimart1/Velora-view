import React, { useState, useEffect } from "react";
import { registrarManutencao } from "../api/client";
import { Scissors, X, CheckCircle2, ShieldAlert, Cpu, Users, Lock, MapPin } from "lucide-react";

export function MaintenanceModal({
  isOpen,
  onClose,
  trechosList = [],
  predicoesList = [],
  preselectedTrecho = null,
  onSuccess,
}) {
  const safeTrechosList = Array.isArray(trechosList) ? trechosList.filter(Boolean) : [];
  const safePredicoesList = Array.isArray(predicoesList) ? predicoesList.filter(Boolean) : [];

  // Lista padronizada de equipes operacionais da Motiva
  const EQUIPES_PADRAO = [
    "Equipe A - Motiva (Vale do Ribeira)",
    "Equipe B - Motiva (Serra do Mar)",
    "Equipe C - Motiva (Sorocaba / Leste)",
    "Equipe D - Motiva (Roçagem Pesada)",
    "Equipe E - Motiva (Acostamentos Sul)",
  ];

  const [trechoId, setTrechoId] = useState("");
  const [dataCorte, setDataCorte] = useState(() => new Date().toISOString().split("T")[0]);
  const [equipe, setEquipe] = useState(EQUIPES_PADRAO[0]);
  const [observacao, setObservacao] = useState("Corte de rotina e poda de acostamento.");
  const [alturaGrama, setAlturaGrama] = useState("24.0");

  const [autoPredicao, setAutoPredicao] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [errorCode, setErrorCode] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Efeito ao abrir o modal com um trecho pré-selecionado
  useEffect(() => {
    if (preselectedTrecho) {
      const selectedId = preselectedTrecho.trecho_id || preselectedTrecho.id;
      setTrechoId(selectedId != null ? String(selectedId) : "");
      
      const altVal = preselectedTrecho.altura_grama_cm ?? preselectedTrecho.altura_atual_cm;
      if (altVal != null) {
        setAlturaGrama(String(Math.max(0, altVal)));
      }
    } else {
      setTrechoId("");
    }
  }, [preselectedTrecho, isOpen]);

  // Efeito para vincular automaticamente a predição quando o Trecho muda
  useEffect(() => {
    if (!trechoId) {
      setAutoPredicao(null);
      return;
    }

    const matchingPred = safePredicoesList.find(
      (p) => p && String(p.trecho_id) === String(trechoId)
    );
    setAutoPredicao(matchingPred || null);
  }, [trechoId, safePredicoesList]);

  if (!isOpen) return null;

  const isTrechoLocked = !!preselectedTrecho;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    setErrorCode(null);
    setSuccessMsg(null);

    const numAltura = parseFloat(alturaGrama);
    if (!isNaN(numAltura) && numAltura < 0) {
      setErrorMsg("A altura da grama não pode ser um número negativo.");
      setIsLoading(false);
      return;
    }

    if (!trechoId) {
      setErrorMsg("Por favor, selecione um trecho rodoviário válido.");
      setIsLoading(false);
      return;
    }

    const payload = {
      trecho_id: Number(trechoId),
      data_corte: dataCorte,
      equipe: equipe.trim(),
    };

    if (observacao && observacao.trim()) {
      payload.observacao = observacao.trim();
    }
    if (!isNaN(numAltura) && numAltura >= 0) {
      payload.altura_grama_no_corte_cm = numAltura;
    }

    if (autoPredicao && autoPredicao.id != null) {
      payload.predicao_id = Number(autoPredicao.id);
    }

    try {
      const response = await registrarManutencao(payload);
      setSuccessMsg(`Ordem de Roçagem #${response?.manutencao_id || response?.id || ""} registrada com sucesso!`);
      setTimeout(() => {
        if (typeof onSuccess === "function") onSuccess();
        if (typeof onClose === "function") onClose();
      }, 1200);
    } catch (err) {
      setErrorCode(err?.status || 500);
      
      if (err?.status === 409) {
        try {
          delete payload.predicao_id;
          const retryRes = await registrarManutencao(payload);
          setSuccessMsg(`Ordem de Roçagem #${retryRes?.manutencao_id || retryRes?.id || ""} registrada com sucesso!`);
          setTimeout(() => {
            if (typeof onSuccess === "function") onSuccess();
            if (typeof onClose === "function") onClose();
          }, 1200);
          return;
        } catch (retryErr) {
          setErrorMsg(retryErr?.message || "Conflito ao registrar manutenção.");
        }
      } else {
        setErrorMsg(err?.message || "Ocorreu um erro ao registrar a ordem de roçagem.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-fadeIn">
      <div className="bg-[#1E242C] border border-[#2A323D] rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4 text-slate-100">
        
        {/* Fechar modal */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg bg-[#12171E] transition border border-[#2A323D]"
        >
          <X className="w-4 h-4" strokeWidth={2} />
        </button>

        {/* Header do Form */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-[#B5FF57]/20 text-[#B5FF57] border border-[#B5FF57]/40 flex items-center justify-center">
            <Scissors className="w-5 h-5" strokeWidth={2.5} />
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-sans">
              Registrar Ordem de Roçagem
            </h3>
            <p className="text-[11px] text-slate-400">
              {isTrechoLocked 
                ? "Agendamento exclusivo para o trecho selecionado na tabela" 
                : "Ingestão de dados operacionais Motiva"}
            </p>
          </div>
        </div>

        {/* Alerta de Sucesso */}
        {successMsg && (
          <div className="p-3 rounded-xl bg-[#B5FF57]/20 border border-[#B5FF57]/40 text-[#B5FF57] text-xs flex items-center space-x-2 font-bold">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" strokeWidth={2.5} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Alerta de Erro */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs space-y-1 font-semibold">
            <div className="flex items-center space-x-1.5">
              <ShieldAlert className="w-4 h-4 flex-shrink-0 text-red-400" strokeWidth={2} />
              <span>Aviso do Sistema:</span>
            </div>
            <p className="pl-5 text-red-200">{errorMsg}</p>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          
          {/* SELEÇÃO DO TRECHO */}
          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1 flex items-center justify-between">
              <span>Trecho Rodoviário <span className="text-red-400">*</span></span>
              {isTrechoLocked && (
                <span className="text-[10px] text-[#B5FF57] font-mono flex items-center">
                  <Lock className="w-3 h-3 mr-1" strokeWidth={2} />
                  Trecho Selecionado na Tabela
                </span>
              )}
            </label>

            {isTrechoLocked ? (
              <div className="w-full bg-[#12171E] border border-[#B5FF57]/40 rounded-xl px-3 py-2.5 text-white font-bold flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-[#B5FF57] flex-shrink-0" strokeWidth={2} />
                <span className="truncate">
                  {preselectedTrecho?.rodovia || "Rodovia"} — {preselectedTrecho?.nome || preselectedTrecho?.trecho || "Trecho"} {preselectedTrecho?.municipio ? `(${preselectedTrecho.municipio})` : ""}
                </span>
              </div>
            ) : (
              <select
                required
                value={trechoId}
                onChange={(e) => setTrechoId(e.target.value)}
                className="w-full bg-[#12171E] border border-[#2A323D] rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-[#B5FF57] font-semibold"
              >
                <option value="">Selecione o trecho...</option>
                {safeTrechosList.map((t, idx) => {
                  const idVal = t?.trecho_id || t?.id || `trecho-opt-${idx}`;
                  return (
                    <option key={idVal} value={t?.trecho_id || t?.id}>
                      {t?.rodovia || t?.nome || "Rodovia"} — {t?.nome || t?.trecho || "Trecho"} {t?.municipio ? `(${t.municipio})` : ""}
                    </option>
                  );
                })}
              </select>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Data do Corte */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1">
                Data da Execução <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                required
                value={dataCorte}
                onChange={(e) => setDataCorte(e.target.value)}
                className="w-full bg-[#12171E] border border-[#2A323D] rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-[#B5FF57] font-mono tabular-nums"
              />
            </div>

            {/* Equipe Responsável */}
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1 flex items-center space-x-1">
                <Users className="w-3 h-3 text-[#B5FF57]" strokeWidth={2} />
                <span>Equipe Responsável <span className="text-red-400">*</span></span>
              </label>
              <select
                required
                value={equipe}
                onChange={(e) => setEquipe(e.target.value)}
                className="w-full bg-[#12171E] border border-[#2A323D] rounded-xl px-2.5 py-2 text-slate-200 focus:outline-none focus:border-[#B5FF57] font-semibold truncate"
              >
                {EQUIPES_PADRAO.map((eq) => (
                  <option key={eq} value={eq}>
                    {eq}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Altura Pré-Corte */}
          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">
              Altura Pré-Corte (cm)
            </label>
            <input
              type="number"
              min="0"
              step="0.1"
              placeholder="Ex: 24.0"
              value={alturaGrama}
              onChange={(e) => {
                const val = e.target.value;
                if (val !== "" && parseFloat(val) < 0) return;
                setAlturaGrama(val);
              }}
              className="w-full bg-[#12171E] border border-[#2A323D] rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-[#B5FF57] font-mono tabular-nums font-bold"
            />
          </div>

          {/* VÍNCULO DO TRECHO */}
          <div className="p-3 rounded-xl bg-[#12171E] border border-[#2A323D] space-y-1">
            <div className="flex items-center space-x-1.5 text-xs text-slate-300 font-bold">
              <Cpu className="w-4 h-4 text-[#B5FF57]" strokeWidth={2} />
              <span>Vínculo de Ordem do Trecho</span>
            </div>
            {autoPredicao ? (
              <div className="text-[11px] text-slate-400 font-mono">
                Status do Trecho:{" "}
                <span className={`font-bold ${String(autoPredicao.prioridade).toUpperCase() === 'ALTA' ? 'text-red-400' : 'text-[#B5FF57]'}`}>
                  Prioridade {autoPredicao.prioridade || "OK"}
                </span>
              </div>
            ) : (
              <p className="text-[10px] text-slate-500 italic">
                Ordem associada automaticamente ao trecho rodoviário.
              </p>
            )}
          </div>

          {/* Observação Operacional */}
          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1">
              Observações Operacionais
            </label>
            <textarea
              rows={2}
              placeholder="Detalhes ou observações da rodovia..."
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              className="w-full bg-[#12171E] border border-[#2A323D] rounded-xl px-3 py-1.5 text-slate-200 focus:outline-none focus:border-[#B5FF57]"
            />
          </div>

          {/* Botões do Rodapé */}
          <div className="flex justify-end space-x-2.5 pt-3 border-t border-[#2A323D]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#12171E] text-slate-300 hover:bg-[#2A323D] font-bold transition border border-[#2A323D]"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2 rounded-xl bg-[#B5FF57] hover:bg-[#9EE642] text-slate-950 font-extrabold text-xs transition shadow-md disabled:opacity-50 flex items-center space-x-1.5"
            >
              {isLoading ? (
                <span>Gravando...</span>
              ) : (
                <>
                  <Scissors className="w-4 h-4" strokeWidth={2.5} />
                  <span>Confirmar Corte</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
