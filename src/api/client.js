function getApiBaseUrl() {
  // 1. Se foi definida a variável de ambiente VITE_API_URL (ex: na Vercel ou .env), usa ela
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/$/, "");
  }

  // 2. Se estiver rodando localmente no computador em desenvolvimento (localhost ou 127.0.0.1)
  if (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")) {
    return "http://127.0.0.1:8000";
  }

  // 3. Se estiver hospedado na Vercel em produção e nenhuma URL externa foi passada, tenta usar rotas relativas
  return "";
}

const API_BASE_URL = getApiBaseUrl();

/**
 * Converte strings de data da API em um objeto Date Javascript correto.
 * Para datas puras "YYYY-MM-DD", interpreta como data local sem offset UTC para evitar recuo de 1 dia em UTC-3.
 */
export function parseUTCDate(dateString) {
  if (!dateString) return null;
  try {
    if (typeof dateString !== "string") {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? null : date;
    }

    const str = dateString.trim();

    // Data pura "YYYY-MM-DD" -> parse como data local sem shift de fuso horário
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
      const [year, month, day] = str.split("-").map(Number);
      return new Date(year, month - 1, day);
    }

    // Se tiver indicação de offset (+00:00 ou Z) ou T, usa direto
    const formatted = str.endsWith("Z") || str.includes("+") || str.includes("T")
      ? str 
      : str + "Z";

    const date = new Date(formatted);
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
}

/**
 * Formata datas ISO para exibição legível em Português (Brasil).
 */
export function formatDateBR(dateString, includeTime = false) {
  try {
    const date = parseUTCDate(dateString);
    if (!date) return "Data não informada";
    
    if (includeTime) {
      return date.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return typeof dateString === "string" ? dateString : "Data não informada";
  }
}

async function handleResponse(response) {
  if (!response || !response.ok) {
    const status = response ? response.status : 500;
    let errorMessage = `Erro na requisição (Status ${status})`;
    try {
      if (response && typeof response.json === "function") {
        const errorData = await response.json();
        if (errorData && errorData.detail) {
          if (typeof errorData.detail === "string") {
            errorMessage = errorData.detail;
          } else if (Array.isArray(errorData.detail)) {
            errorMessage = errorData.detail
              .map((e) => (e && (e.msg || e.message)) || JSON.stringify(e))
              .join(", ");
          }
        }
      }
    } catch {
      // Falha ao interpretar JSON de erro
    }

    const error = new Error(errorMessage);
    error.status = status;
    throw error;
  }
  try {
    return await response.json();
  } catch {
    return {};
  }
}

export async function fetchHealth() {
  const res = await fetch(`${API_BASE_URL}/health`);
  return handleResponse(res);
}

export async function fetchDashboardResumo() {
  const res = await fetch(`${API_BASE_URL}/dashboard/resumo`);
  return handleResponse(res);
}

export async function fetchDashboardMapa() {
  const res = await fetch(`${API_BASE_URL}/dashboard/mapa`);
  return handleResponse(res);
}

export async function fetchRelatorioVegetacao() {
  const res = await fetch(`${API_BASE_URL}/relatorios/vegetacao`);
  return handleResponse(res);
}

export async function fetchRelatorioManutencao() {
  const res = await fetch(`${API_BASE_URL}/relatorios/manutencao`);
  return handleResponse(res);
}

export async function fetchUltimasPredicoes() {
  const res = await fetch(`${API_BASE_URL}/predicoes/ultimas`);
  return handleResponse(res);
}

export async function registrarManutencao(payload) {
  const res = await fetch(`${API_BASE_URL}/manutencoes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}
