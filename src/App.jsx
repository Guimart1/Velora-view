import React, { useState, useEffect, useCallback } from "react";
import { ThemeProvider } from "./context/ThemeContext";
import {
  fetchHealth,
  fetchDashboardResumo,
  fetchDashboardMapa,
  fetchRelatorioVegetacao,
  fetchRelatorioManutencao,
  fetchUltimasPredicoes,
} from "./api/client";

import { Header } from "./components/Header";
import { Sidebar } from "./components/Sidebar";
import { SummaryCards } from "./components/SummaryCards";
import { DecisionPanelCard } from "./components/DecisionPanelCard";
import { RankingTable } from "./components/RankingTable";
import { InteractiveMap } from "./components/InteractiveMap";
import { VegetationTable } from "./components/VegetationTable";
import { HistoricalChartP5 } from "./components/HistoricalChartP5";
import { CortesView } from "./components/CortesView";
import { MaintenanceModal } from "./components/MaintenanceModal";
import { RefreshCw, AlertCircle } from "lucide-react";

function AppContent() {
  const [activeTab, setActiveTab] = useState("ranking"); // "ranking" | "historico" | "vegetacao" | "manutencoes"
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [apiOnline, setApiOnline] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados dos dados da API
  const [resumoData, setResumoData] = useState(null);
  const [mapaData, setMapaData] = useState(null);
  const [vegetacaoData, setVegetacaoData] = useState(null);
  const [manutencaoData, setManutencaoData] = useState(null);
  const [predicoesData, setPredicoesData] = useState([]);

  // Estado do Modal de Manutenção
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTrechoForCut, setSelectedTrechoForCut] = useState(null);

  const loadAllData = useCallback(async () => {
    setIsRefreshing(true);
    setError(null);
    try {
      try {
        await fetchHealth();
        setApiOnline(true);
      } catch {
        setApiOnline(false);
      }

      const [resumoRes, mapaRes, vegetacaoRes, manutencaoRes, predicoesRes] = await Promise.allSettled([
        fetchDashboardResumo(),
        fetchDashboardMapa(),
        fetchRelatorioVegetacao(),
        fetchRelatorioManutencao(),
        fetchUltimasPredicoes(),
      ]);

      const resumo = resumoRes.status === "fulfilled" ? resumoRes.value : null;
      const mapa = mapaRes.status === "fulfilled" ? mapaRes.value : null;
      const vegetacao = vegetacaoRes.status === "fulfilled" ? vegetacaoRes.value : null;
      const manutencao = manutencaoRes.status === "fulfilled" ? manutencaoRes.value : null;
      const predicoes = predicoesRes.status === "fulfilled" ? predicoesRes.value : [];

      if (resumoRes.status === "rejected" && mapaRes.status === "rejected" && vegetacaoRes.status === "rejected") {
        const firstError = resumoRes.reason || mapaRes.reason || vegetacaoRes.reason;
        setError(firstError?.message || "Impossível conectar à API FastAPI em http://127.0.0.1:8000.");
      }

      setResumoData(resumo);
      setMapaData(mapa);
      setVegetacaoData(vegetacao);
      setManutencaoData(manutencao);

      let safePreds = [];
      if (Array.isArray(predicoes)) {
        safePreds = predicoes;
      } else if (predicoes && Array.isArray(predicoes.value)) {
        safePreds = predicoes.value;
      } else if (predicoes && Array.isArray(predicoes.predicoes)) {
        safePreds = predicoes.predicoes;
      }
      setPredicoesData(safePreds);
    } catch (err) {
      console.error("Erro ao carregar dados da API VELÖRA:", err);
      setError(err?.message || "Impossível se conectar com a API FastAPI em http://127.0.0.1:8000.");
    } finally {
      setIsRefreshing(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const handleOpenMaintenanceModal = (trecho = null) => {
    setSelectedTrechoForCut(trecho);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#0B0F14] text-slate-100 flex flex-col font-sans transition-colors">
      
      {/* Header Fixo no Topo */}
      <Header
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        onRefresh={loadAllData}
        isRefreshing={isRefreshing}
        apiOnline={apiOnline}
        onOpenMaintenanceModal={handleOpenMaintenanceModal}
      />

      {/* Container Principal com Menu Lateral Fixo & Área de Conteúdo */}
      <div className="flex-1 flex min-h-0 relative">
        
        {/* Menu Lateral Fixo na Tela (position: fixed) */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isOpen={sidebarOpen}
          setIsOpen={setSidebarOpen}
        />

        {/* Área de Conteúdo ajustada com margem esquerda para a Sidebar fixa */}
        <main className={`flex-1 min-w-0 p-4 sm:p-6 lg:p-8 space-y-6 transition-all duration-300 ${
          sidebarOpen ? "ml-56" : "ml-16"
        }`}>
          
          {/* Banner de Erro de Conexão */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-300 text-xs flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" strokeWidth={1.75} />
              <div className="space-y-1">
                <h3 className="font-bold">Falha de Conexão com o Backend FastAPI</h3>
                <p>{error}</p>
                <button
                  onClick={loadAllData}
                  className="px-2.5 py-1 rounded bg-red-600 text-white text-[11px] font-semibold transition inline-flex items-center space-x-1 mt-1"
                >
                  <RefreshCw className="w-3 h-3 mr-1" strokeWidth={1.75} />
                  <span>Reconectar</span>
                </button>
              </div>
            </div>
          )}

          {/* Loading Indicator */}
          {loading ? (
            <div className="py-24 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-[#B5FF57] animate-spin mx-auto" strokeWidth={1.75} />
              <p className="text-xs font-medium text-slate-400 font-mono">
                Carregando dados do VELÖRA...
              </p>
            </div>
          ) : (
            <>
              {/* TAB 1: PAINEL DE CONTROLE & RANKING */}
              {activeTab === "ranking" && (
                <div className="space-y-6">
                  
                  {/* 1. PAINEL DE CONTROLE MOTIVA */}
                  <DecisionPanelCard
                    resumoData={resumoData}
                    onOpenCutModal={handleOpenMaintenanceModal}
                  />

                  {/* 2. TABELA DE RANKING DE PRIORIDADE */}
                  {resumoData && (
                    <RankingTable
                      trechos={Array.isArray(resumoData?.todos_os_trechos) ? resumoData.todos_os_trechos : (Array.isArray(resumoData?.trechos_prioritarios) ? resumoData.trechos_prioritarios : [])}
                      manutencoes={Array.isArray(manutencaoData?.linhas) ? manutencaoData.linhas : []}
                      onRegisterCutForTrecho={handleOpenMaintenanceModal}
                    />
                  )}

                  {/* 3. MÉTRICAS EXECUTIVAS DE TELEMETRIA */}
                  {resumoData && resumoData.cards && (
                    <SummaryCards cardsData={resumoData.cards} />
                  )}

                  {/* 4. MAPA GEOGRÁFICO DOS TRECHOS RODOVIÁRIOS */}
                  <InteractiveMap pontos={Array.isArray(mapaData?.pontos) ? mapaData.pontos : []} />
                </div>
              )}

              {/* TAB 2: PROJEÇÕES DE CRESCIMENTO */}
              {activeTab === "historico" && (
                <div className="space-y-6">
                  <HistoricalChartP5
                    vegetacaoLinhas={Array.isArray(vegetacaoData?.linhas) ? vegetacaoData.linhas : []}
                    manutencoesLinhas={Array.isArray(manutencaoData?.linhas) ? manutencaoData.linhas : []}
                  />
                </div>
              )}

              {/* TAB 3: VEGETAÇÃO */}
              {activeTab === "vegetacao" && (
                <div className="space-y-6">
                  {vegetacaoData && (
                    <VegetationTable
                      relatorio={vegetacaoData}
                      onRegisterCutForTrecho={handleOpenMaintenanceModal}
                    />
                  )}
                </div>
              )}

              {/* TAB 4: CORTES AGRUPADOS POR RODOVIA */}
              {activeTab === "manutencoes" && (
                <div className="space-y-6">
                  <CortesView
                    manutencoesLinhas={Array.isArray(manutencaoData?.linhas) ? manutencaoData.linhas : []}
                  />
                </div>
              )}
            </>
          )}

        </main>
      </div>

      {/* Footer Limpo sem ícone de brilho */}
      <footer className={`border-t border-[#2A323D] bg-[#12171E] py-3.5 text-xs text-slate-400 transition-all duration-300 z-20 ${
        sidebarOpen ? "ml-56" : "ml-16"
      }`}>
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-white tracking-wide">VELÖRA</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300 font-medium">Gestão Operacional & Telemetria de Acostamentos</span>
          </div>

          <div className="flex flex-wrap items-center space-x-2 font-mono text-[11px] text-slate-400">
            <span className="text-[#B5FF57] font-extrabold">MOTIVA</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-200 font-bold">FIAP</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-300">Grupo 43</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-300 font-semibold">Turma 2 CCPX</span>
          </div>
        </div>
      </footer>

      {/* Modal de Registro de Ordem de Roçagem */}
      <MaintenanceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        trechosList={Array.isArray(resumoData?.todos_os_trechos) ? resumoData.todos_os_trechos : (Array.isArray(vegetacaoData?.linhas) ? vegetacaoData.linhas : [])}
        predicoesList={predicoesData}
        preselectedTrecho={selectedTrechoForCut}
        onSuccess={loadAllData}
      />

    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
