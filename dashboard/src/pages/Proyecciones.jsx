import React, { useState, useEffect } from "react";
import axios from "axios";
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from "recharts";

const API = "http://127.0.0.1:8000";

const COLORES = {
  cosecha: "#166534",
  estrella: "#22c55e",
  rayando: "#eab308",
  garbanzo: "#f97316",
  alberja: "#a855f7",
  arroz: "#ef4444",
};

const ETIQUETAS = {
  cosecha: "Cosecha",
  estrella: "Estrella",
  rayando: "Rayando color",
  garbanzo: "Garbanzo",
  alberja: "Alberja",
  arroz: "Arroz",
};

function ProyeccionCama({ camaId, camaNombre, recargar }) {
  const [datos, setDatos] = useState(null);
  const [precision, setPrecision] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!camaId) return;
    setDatos(null);
    setError(null);
    axios
      .get(`${API}/reportes/proyeccion-diaria/${camaId}?dias=14`)
      .then((r) => setDatos(r.data))
      .catch((e) => setError(e.response?.data?.detail || "Error al cargar la proyección"));

    axios
      .get(`${API}/reportes/precision-proyeccion/${camaId}`)
      .then((r) => setPrecision(r.data.historial))
      .catch(() => setPrecision([]));
  }, [camaId, recargar]);

  if (error) {
    return (
      <div className="grafico-card">
        <h2>{camaNombre}</h2>
        <p style={{ color: "#999" }}>{error} - sube al menos una foto o video para esta cama</p>
      </div>
    );
  }

  if (!datos) return <div className="cargando">Cargando proyección...</div>;

  const totalProyectado = datos.dias.reduce((s, d) => s + d.botones_proyectados, 0);

  return (
    <div className="grafico-card" style={{ marginBottom: "24px" }}>
      <h2>{camaNombre} - Proyección diaria (próximos 14 días)</h2>

      <p style={{ color: "#666", fontSize: "0.85rem", marginBottom: "4px" }}>
        Día consolidado: {datos.dia_consolidado} • {datos.total_registros_consolidados} videos analizados
      </p>
      <p style={{ color: "#999", fontSize: "0.78rem", marginBottom: "12px" }}>
        Botones actuales por etapa: Cosecha {datos.botones_actuales_por_etapa?.cosecha} • Estrella {datos.botones_actuales_por_etapa?.estrella} • Rayando {datos.botones_actuales_por_etapa?.rayando} • Garbanzo {datos.botones_actuales_por_etapa?.garbanzo} • Alberja {datos.botones_actuales_por_etapa?.alberja} • Arroz {datos.botones_actuales_por_etapa?.arroz}
      </p>

      <div style={{ background: "#f0fdf4", borderRadius: "10px", padding: "12px 16px", marginBottom: "16px" }}>
        <div style={{ fontWeight: "600", color: "#2d5a27", marginBottom: "8px", fontSize: "0.88rem" }}>
          Ciclo aprendido de esta cama (días hasta cosecha)
        </div>
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
          {[
            { label: "Arroz", val: datos.ciclo_actual.arroz },
            { label: "Alberja", val: datos.ciclo_actual.alberja },
            { label: "Garbanzo", val: datos.ciclo_actual.garbanzo },
            { label: "Rayando color", val: datos.ciclo_actual.rayando },
            { label: "Estrella", val: datos.ciclo_actual.estrella },
          ].map((c) => (
            <div key={c.label} style={{ textAlign: "center" }}>
              <div style={{ fontWeight: "700", fontSize: "1.1rem", color: "#2d5a27" }}>{c.val}</div>
              <div style={{ fontSize: "0.75rem", color: "#666" }}>{c.label}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: "0.75rem", color: "#999", marginTop: "8px" }}>
          Última actualización: {datos.ultima_actualizacion_ciclo} • Se ajusta automáticamente con cada poda registrada
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={datos.dias} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e8f0e8" />
          <XAxis dataKey="fecha" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={60} />
          <YAxis />
          <Tooltip />
          <Bar dataKey="botones_proyectados" name="Botones proyectados" fill="#86efac" />
        </BarChart>
      </ResponsiveContainer>

      <div style={{ textAlign: "center", margin: "12px 0", fontWeight: "700", color: "#2d5a27" }}>
        Total proyectado próximos 14 días: {totalProyectado} botones
      </div>

      <table className="tabla">
        <thead>
          <tr>
            <th>Fecha</th>
            <th style={{ textAlign: "center" }}>Botones proyectados</th>
            <th>Origen (etapa actual)</th>
          </tr>
        </thead>
        <tbody>
          {datos.dias
            .filter((d) => d.botones_proyectados > 0 || d.es_hoy)
            .map((d, i) => (
              <tr key={i} style={{ background: d.es_hoy ? "#f0fdf4" : "white", fontWeight: d.es_hoy ? "700" : "400" }}>
                <td>
                  {d.fecha} {d.es_hoy && <span style={{ color: "#2d5a27", fontSize: "0.75rem" }}>(hoy)</span>}
                </td>
                <td style={{ textAlign: "center" }}>
                  {d.botones_proyectados > 0 ? (
                    <span
                      style={{
                        display: "inline-block",
                        padding: "3px 12px",
                        borderRadius: "20px",
                        background: d.es_hoy ? "#2d5a27" : "#d1fae5",
                        color: d.es_hoy ? "white" : "#065f46",
                        fontWeight: "700",
                      }}
                    >
                      {d.botones_proyectados}
                    </span>
                  ) : (
                    <span style={{ color: "#ddd" }}>-</span>
                  )}
                </td>
                <td style={{ fontSize: "0.82rem", color: "#666" }}>
                  {Object.entries(d.origen_etapas).map(([etapa, cant]) => (
                    <span
                      key={etapa}
                      style={{
                        display: "inline-block",
                        marginRight: "4px",
                        padding: "1px 7px",
                        borderRadius: "10px",
                        background: COLORES[etapa] ? COLORES[etapa] + "44" : "#f3f4f6",
                        fontSize: "0.76rem",
                      }}
                    >
                      {ETIQUETAS[etapa] || etapa}: {cant}
                    </span>
                  ))}
                </td>
              </tr>
            ))}
        </tbody>
      </table>

      {precision && precision.length > 0 && (
        <div style={{ marginTop: "24px" }}>
          <h2 style={{ fontSize: "0.95rem", color: "#2d5a27", marginBottom: "12px" }}>Comparación Visual: Proyección vs Cosecha Real</h2>

          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={precision.slice().reverse()} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8f0e8" />
              <XAxis dataKey="fecha" tick={{ fontSize: 10 }} />
              <YAxis />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="proyectado" fill="#86efac" name="Proyectado (IA)" />
              <Bar dataKey="real" fill="#2d5a27" name="Real (Cosechado)" />
            </BarChart>
          </ResponsiveContainer>

          <h2 style={{ fontSize: "0.95rem", marginTop: "16px", marginBottom: "8px" }}>Desglose Detallado de Precisión</h2>
          <table className="tabla">
            <thead>
              <tr>
                <th>Fecha</th>
                <th style={{ textAlign: "center" }}>Proyectado (IA)</th>
                <th style={{ textAlign: "center" }}>Real (Cosechado)</th>
                <th style={{ textAlign: "center" }}>Desviación / Error</th>
              </tr>
            </thead>
            <tbody>
              {precision.map((p, i) => (
                <tr key={i}>
                  <td>{p.fecha}</td>
                  <td style={{ textAlign: "center" }}>{p.proyectado}</td>
                  <td style={{ textAlign: "center", fontWeight: "700" }}>{p.real ?? "-"}</td>
                  <td style={{ textAlign: "center", color: p.error_porcentual > 30 ? "#dc2626" : "#166534", fontWeight: "600" }}>
                    {p.error_porcentual !== null ? `${p.error_porcentual}%` : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function Proyecciones({ camasFiltradas, recargarProyecciones }) {
  return (
    <div>
      {camasFiltradas.map((c) => (
        <ProyeccionCama key={c.id} camaId={c.id} camaNombre={c.nombre} recargar={recargarProyecciones} />
      ))}
    </div>
  );
}
export { ProyeccionCama };
