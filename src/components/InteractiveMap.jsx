import React, { useState, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useTheme } from "../context/ThemeContext";
import { MapPin, AlertCircle, Maximize2, Minimize2 } from "lucide-react";

function getPriorityBadgeHtml(priority) {
  const norm = typeof priority === "string" ? priority.toUpperCase().trim() : String(priority || "").toUpperCase().trim();
  if (norm === "ALTA") {
    return `<span style="background-color: rgba(239, 68, 68, 0.15); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; text-transform: uppercase;">ALTA</span>`;
  }
  if (norm === "MEDIA" || norm === "MÉDIA") {
    return `<span style="background-color: rgba(245, 158, 11, 0.15); color: #f59e0b; border: 1px solid rgba(245, 158, 11, 0.3); font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; text-transform: uppercase;">MÉDIA</span>`;
  }
  if (norm === "SEM_DADOS" || norm === "SEM DADOS" || !priority) {
    return `<span style="background-color: rgba(100, 116, 139, 0.15); color: #94a3b8; border: 1px solid rgba(100, 116, 139, 0.3); font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; text-transform: uppercase;">SEM DADOS</span>`;
  }
  return `<span style="background-color: rgba(181, 255, 87, 0.15); color: #b5ff57; border: 1px solid rgba(181, 255, 87, 0.3); font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; text-transform: uppercase;">BAIXA</span>`;
}

function createCustomPin(priority) {
  try {
    const norm = typeof priority === "string" ? priority.toUpperCase().trim() : String(priority || "").toUpperCase().trim();
    let bg = "#B5FF57"; // Verde Limão Velöra (BAIXA)
    
    if (norm === "ALTA") {
      bg = "#EF4444"; // Vermelho
    } else if (norm === "MEDIA" || norm === "MÉDIA") {
      bg = "#F59E0B"; // Âmbar
    } else if (norm === "SEM_DADOS" || norm === "SEM DADOS" || !priority) {
      bg = "#64748B"; // Slate Neutro
    }

    const iconColor = bg === "#B5FF57" ? "#0B0F14" : "#FFFFFF";

    return L.divIcon({
      className: "custom-industrial-marker",
      html: `
        <div style="
          background-color: ${bg};
          width: 26px;
          height: 26px;
          border-radius: 50%;
          border: 2px solid #1E242C;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${iconColor};
        ">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
        </div>
      `,
      iconSize: [26, 26],
      iconAnchor: [13, 26],
      popupAnchor: [0, -26],
    });
  } catch {
    return undefined;
  }
}

export function InteractiveMap({ pontos = [] }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { theme } = useTheme();
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerGroupRef = useRef(null);
  const tileLayerRef = useRef(null);

  const defaultCenter = [-24.4979, -47.8449];

  const safePontos = Array.isArray(pontos) ? pontos.filter(Boolean) : [];
  const validPontos = safePontos.filter(
    (p) =>
      p &&
      typeof p.latitude === "number" &&
      typeof p.longitude === "number" &&
      !isNaN(p.latitude) &&
      !isNaN(p.longitude)
  );

  // 1. Inicializa o mapa Leaflet nativo com CartoDB Dark Matter Tiles
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialCenter = validPontos.length > 0
        ? [validPontos[0].latitude, validPontos[0].longitude]
        : defaultCenter;

      const map = L.map(mapContainerRef.current, {
        center: initialCenter,
        zoom: 10,
        scrollWheelZoom: false,
      });

      // CartoDB Dark Matter Tiles (Perfeitos para dashboards industriais escuros)
      const tileUrl = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

      tileLayerRef.current = L.tileLayer(tileUrl, {
        subdomains: "abcd",
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
      }).addTo(map);

      layerGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        layerGroupRef.current = null;
      }
    };
  }, []);

  // 2. Recalcula dimensões e força redesenho dos tiles do Leaflet ao expandir/recolher
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.invalidateSize();
      const t1 = setTimeout(() => mapInstanceRef.current?.invalidateSize(), 100);
      const t2 = setTimeout(() => mapInstanceRef.current?.invalidateSize(), 300);
      const t3 = setTimeout(() => mapInstanceRef.current?.invalidateSize(), 600);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, [isExpanded]);

  // Tecla ESC para recolher o mapa expandido
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isExpanded) {
        setIsExpanded(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isExpanded]);

  // 3. Atualiza os Marcadores dinamicamente
  useEffect(() => {
    const map = mapInstanceRef.current;
    const group = layerGroupRef.current;
    if (!map || !group) return;

    group.clearLayers();

    validPontos.forEach((p) => {
      const pinIcon = createCustomPin(p.prioridade);
      const marker = L.marker([p.latitude, p.longitude], { icon: pinIcon });

      const clima = p?.clima_externo;
      const popupHtml = `
        <div style="font-family: system-ui, sans-serif; padding: 4px; min-width: 220px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <span style="font-weight: 700; color: #b5ff57; font-family: monospace; font-size: 11px;">${p.rodovia || "Rodovia"}</span>
            ${getPriorityBadgeHtml(p.prioridade)}
          </div>
          <div style="font-weight: 700; font-size: 13px; margin-bottom: 4px; color: #ffffff;">
            ${p.nome || p.trecho || "Trecho Rodoviário"}
          </div>
          <div style="font-size: 11px; opacity: 0.7; margin-bottom: 8px; color: #cbd5e1;">
            ${p.km_inicial != null && p.km_final != null ? `KM ${p.km_inicial} - ${p.km_final}` : (p.km != null ? `KM ${p.km}` : (p.municipio || ""))}
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 11px; padding-top: 8px; border-top: 1px solid rgba(148, 163, 184, 0.2); font-family: monospace; color: #e2e8f0;" class="tabular-nums">
            <div>Grama: <strong>${p.altura_grama_cm != null ? `${p.altura_grama_cm} cm` : "-"}</strong></div>
            <div>Solo: <strong>${p.umidade_solo != null ? `${p.umidade_solo}%` : "-"}</strong></div>
            <div style="grid-column: span 2; font-weight: 600;">
              Corte: <strong>${p.dias_para_corte === 0 ? "Hoje" : (p.dias_para_corte != null ? `${p.dias_para_corte} dias` : "-")}</strong>
            </div>
          </div>
          ${clima && typeof clima === "object" ? `
            <div style="font-size: 11px; opacity: 0.7; padding-top: 6px; margin-top: 6px; border-top: 1px solid rgba(148, 163, 184, 0.2); display: flex; justify-content: space-between; font-family: monospace; color: #cbd5e1;" class="tabular-nums">
              <span>Temp: <strong>${clima.temperatura_c != null ? `${clima.temperatura_c}°C` : "-"}</strong></span>
              <span>Chuva: <strong>${clima.chuva_prevista_24h_mm != null ? `${clima.chuva_prevista_24h_mm}mm` : "-"}</strong></span>
            </div>
          ` : ""}
        </div>
      `;

      marker.bindPopup(popupHtml);
      group.addLayer(marker);
    });

    if (validPontos.length > 0) {
      map.setView([validPontos[0].latitude, validPontos[0].longitude], 10);
    }
  }, [pontos]);

  return (
    <div
      className={
        isExpanded
          ? "fixed inset-0 z-50 bg-[#0B0F14]/95 backdrop-blur-md p-4 sm:p-6 flex flex-col space-y-4 animate-in fade-in zoom-in-95 duration-200"
          : "bg-[#1E242C] border border-[#2A323D] rounded-2xl p-5 shadow-xl space-y-3 transition-all"
      }
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2A323D] pb-3">
        <div>
          <h2 className="text-base font-bold text-white flex items-center font-sans tracking-tight">
            <MapPin className="w-4 h-4 text-[#B5FF57] mr-1.5" strokeWidth={2} />
            <span>Geolocalização de Setores e Rotas de Roçagem</span>
          </h2>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Rastreamento de trechos em campo marcados por nível de prioridade
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="hidden sm:flex items-center space-x-3 text-xs font-medium">
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              <span className="text-slate-300">Alta</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span className="text-slate-300">Média</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-[#B5FF57]"></span>
              <span className="text-slate-300">Baixa</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-slate-500"></span>
              <span className="text-slate-400">Sem Dados</span>
            </span>
          </div>

          {/* BOTÃO DE EXPANDIR / RECOLHER O MAPA */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="px-3 py-1.5 rounded-xl bg-[#12171E] hover:bg-[#2A323D] text-[#B5FF57] border border-[#2A323D] text-xs font-bold transition flex items-center space-x-1.5 shadow-sm"
            title={isExpanded ? "Recolher Mapa (ESC)" : "Expandir Mapa"}
          >
            {isExpanded ? (
              <>
                <Minimize2 className="w-4 h-4" strokeWidth={2} />
                <span>Recolher</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-4 h-4" strokeWidth={2} />
                <span>Expandir Mapa</span>
              </>
            )}
          </button>
        </div>
      </div>

      {validPontos.length === 0 && (
        <div className="bg-[#12171E] border border-[#2A323D] rounded-xl p-3 text-xs text-amber-400 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" strokeWidth={1.75} />
          <span>Exibindo mapa da região padrão (Vale do Ribeira / SP).</span>
        </div>
      )}

      {/* Container DOM nativo do Leaflet com altura explícita garantida e referência preservada */}
      <div 
        ref={mapContainerRef} 
        key="leaflet-map-canvas-container"
        style={{
          height: isExpanded ? "calc(100vh - 120px)" : "24rem",
        }}
        className={`w-full rounded-xl border border-[#2A323D] relative z-0 overflow-hidden shadow-inner transition-all ${
          isExpanded ? "h-[calc(100vh-120px)]" : "h-96"
        }`}
      />
    </div>
  );
}
