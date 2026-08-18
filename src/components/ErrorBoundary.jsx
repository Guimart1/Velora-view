import React from "react";
import { AlertOctagon, RefreshCw, RotateCcw, ChevronDown, ChevronUp } from "lucide-react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[Vellöra ErrorBoundary] Erro capturado na árvore de componentes:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  toggleDetails = () => {
    this.setState((prev) => ({ showDetails: !prev.showDetails }));
  };

  render() {
    if (this.state.hasError) {
      const { error, errorInfo, showDetails } = this.state;
      const errorMessage = error?.message || (typeof error === "string" ? error : "Erro desconhecido na interface.");
      const errorStack = error?.stack || errorInfo?.componentStack || "Nenhum stack trace disponível.";

      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 selection:bg-red-500 selection:text-white">
          <div className="max-w-2xl w-full bg-slate-900 border border-red-500/40 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6">
            
            {/* Header com Ícone */}
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-red-500/20 text-red-400 border border-red-500/40 rounded-xl flex-shrink-0">
                <AlertOctagon className="w-8 h-8" />
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-mono font-bold">
                    REACT ERROR SHIELD
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Ops! Ocorreu um erro na renderização
                </h1>
                <p className="text-xs sm:text-sm text-slate-400">
                  O Vellöra capturou uma exceção não tratada e impediu que a tela ficasse em branco.
                </p>
              </div>
            </div>

            {/* Mensagem do Erro */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
                Mensagem da Exceção:
              </div>
              <div className="text-sm font-mono text-red-400 break-words">
                {errorMessage}
              </div>
            </div>

            {/* Detalhes Técnicos / Stack Trace (Colapsável) */}
            <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60">
              <button
                type="button"
                onClick={this.toggleDetails}
                className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-semibold text-slate-400 hover:text-slate-200 transition bg-slate-950/80"
              >
                <span>Detalhes Técnicos & Stack Trace</span>
                {showDetails ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              {showDetails && (
                <div className="p-4 border-t border-slate-800 max-h-64 overflow-y-auto font-mono text-xs text-slate-400 space-y-3">
                  <div>
                    <span className="text-slate-300 font-bold block mb-1">Stack Trace do Erro:</span>
                    <pre className="whitespace-pre-wrap break-all text-slate-400 bg-slate-950 p-2.5 rounded-lg border border-slate-900 text-[11px] leading-relaxed">
                      {errorStack}
                    </pre>
                  </div>
                  {errorInfo?.componentStack && (
                    <div>
                      <span className="text-slate-300 font-bold block mb-1">Component Stack:</span>
                      <pre className="whitespace-pre-wrap break-all text-slate-400 bg-slate-950 p-2.5 rounded-lg border border-slate-900 text-[11px] leading-relaxed">
                        {errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Botões de Ação */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition flex items-center justify-center space-x-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Tentar Novamente</span>
              </button>
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-lg shadow-emerald-950/60 flex items-center justify-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Recarregar Página</span>
              </button>
            </div>

          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
