import React, { useState, useEffect } from "react";
import axios from "axios";
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar, LineChart, Line } from "recharts";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";;

function ProyeccionGlobal({ camas }) {
  const [datos, setDatos] = useState([]);

  useEffect(() => {
    if (camas.length === 0) return;
    Promise.all(camas.map((c) => axios.get(`${API}/reportes/proyeccion/${c.id}`)))
      .then((resultados) => {
        const semanas = {};
        resultados.forEach((r) => {
          r.data.semanas?.forEach((s) => {
            if (!semanas[s.numero_semana]) {
              semanas[s.numero_semana] = { ...s, botones_para_cosecha: 0, detalle_etapas: {}, camas: [] };
            }
            semanas[s.numero_semana].botones_para_cosecha += s.botones_para_cosecha;
            semanas[s.numero_semana].camas.push({ nombre: r.data.cama_nombre, cantidad: s.botones_para_cosecha });
            Object.entries(s.detalle_etapas).forEach(([k, v]) => {
              semanas[s.numero_semana].detalle_etapas[k] = (semanas[s.numero_semana].detalle_etapas[k] || 0) + v;
            });
          });
        });
        setDatos(Object.values(semanas));
      })
      .catch((err) => console.error("Error cargando proyección global", err));
  }, [camas]);

  if (datos.length === 0) return <div className="cargando">Cargando proyección global...</div>;

  return (
    <div className="grafico-card" style={{ marginBottom: "24px" }}>
      <h2 style={{ fontSize: "1rem", color: "#2d5a27", marginBottom: "16px", fontWeight: "700" }}>
        Proyección Global - Todas las Camas (por Semana)
      </h2>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={datos} margin={{ top: 10, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e8f0e8" />
          <XAxis dataKey="numero_semana" tickFormatter={(v) => `Sem ${v}`} />
          <YAxis />
          <Tooltip labelFormatter={(v) => `Semana ${v}`} />
          <Bar dataKey="botones_para_cosecha" name="Botones para cosecha" fill="#2d5a27" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <table className="tabla" style={{ marginTop: "16px" }}>
        <thead>
          <tr>
            <th>Semana</th>
            <th>Mes</th>
            <th>Fecha</th>
            <th style={{ textAlign: "center" }}>Total cosecha</th>
            <th>Por Cama</th>
          </tr>
        </thead>
        <tbody>
          {datos.map((s, i) => (
            <tr key={i} style={{ background: s.es_semana_actual ? "#f0fdf4" : "white", fontWeight: s.es_semana_actual ? "700" : "400" }}>
              <td>
                <span
                  style={{
                    display: "inline-block",
                    padding: "2px 10px",
                    borderRadius: "20px",
                    background: s.es_semana_actual ? "#2d5a27" : "#e8f0e8",
                    color: s.es_semana_actual ? "white" : "#2d5a27",
                    fontSize: "0.85rem",
                  }}
                >
                  Sem {s.numero_semana}
                </span>
              </td>
              <td>{s.mes}</td>
              <td>{s.fecha}</td>
              <td style={{ textAlign: "center" }}>
                {s.botones_para_cosecha > 0 ? (
                  <span
                    style={{
                      display: "inline-block",
                      padding: "3px 12px",
                      borderRadius: "20px",
                      background: s.es_semana_actual ? "#2d5a27" : "#d1fae5",
                      color: s.es_semana_actual ? "white" : "#065f46",
                      fontWeight: "700",
                    }}
                  >
                    {s.botones_para_cosecha}
                  </span>
                ) : (
                  <span style={{ color: "#ddd" }}>-</span>
                )}
              </td>
              <td style={{ fontSize: "0.82rem", color: "#666" }}>
                {s.camas
                  ?.filter((c) => c.cantidad > 0)
                  .map((c) => `${c.nombre}: ${c.cantidad}`)
                  .join(" | ") || "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ComparativaCamas({ camas }) {
  const [datos, setDatos] = useState(null);

  useEffect(() => {
    axios
      .get(`${API}/reportes/comparativa-camas`)
      .then((r) => setDatos(r.data))
      .catch((err) => console.error("Error comparando camas", err));
  }, [camas]);

  if (!datos) return <div className="cargando">Cargando comparativa...</div>;

  const nombresCamas = Object.keys(datos);
  const COLORES_CAMAS = ["#2d5a27", "#3b82f6", "#f97316", "#a78bfa", "#ec4899", "#10b981"];

  const todasFechas = [
    ...new Set(nombresCamas.flatMap((n) => datos[n].historial.map((h) => h.fecha))),
  ].sort((a, b) => {
    const [da, ma, ya] = a.split("/");
    const [db, mb, yb] = b.split("/");
    return new Date(`${ya}-${ma}-${da}`) - new Date(`${yb}-${mb}-${db}`);
  });

  const datosLinea = todasFechas.map((fecha) => {
    const fila = { fecha };
    nombresCamas.forEach((nombre) => {
      const registro = datos[nombre].historial.find((h) => h.fecha === fecha);
      fila[nombre] = registro ? registro.total_botones : null;
    });
    return fila;
  });

  const datosBarras = nombresCamas.map((nombre) => ({
    cama: nombre,
    total: datos[nombre].ultimo_total,
    cosecha: datos[nombre].ultimo_cosecha,
  }));

  const iconoTendencia = (t) => {
    if (t === "subiendo") return { icon: "Subiendo", color: "#065f46", bg: "#d1fae5" };
    if (t === "bajando") return { icon: "Bajando", color: "#991b1b", bg: "#fee2e2" };
    if (t === "estable") return { icon: "Estable", color: "#1e40af", bg: "#dbeafe" };
    return { icon: "Sin datos", color: "#666", bg: "#f3f4f6" };
  };

  return (
    <div>
      <div style={{ display: "flex", gap: "16px", marginBottom: "24px", flexWrap: "wrap" }}>
        {nombresCamas.map((nombre, i) => {
          const cama = datos[nombre];
          const t = iconoTendencia(cama.tendencia);
          return (
            <div
              key={nombre}
              style={{
                background: "white",
                borderRadius: "12px",
                padding: "16px 20px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                flex: 1,
                minWidth: "180px",
                borderTop: `4px solid ${COLORES_CAMAS[i % COLORES_CAMAS.length]}`,
              }}
            >
              <div style={{ fontWeight: "700", color: "#2d5a27", marginBottom: "8px" }}>{nombre}</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <span style={{ fontSize: "0.82rem", color: "#666" }}>Total botones</span>
                <span style={{ fontWeight: "700", fontSize: "1.2rem" }}>{cama.ultimo_total}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <span style={{ fontSize: "0.82rem", color: "#666" }}>Cosecha</span>
                <span style={{ fontWeight: "700", fontSize: "1.1rem", color: "#ec4899" }}>{cama.ultimo_cosecha}</span>
              </div>
              <div
                style={{
                  display: "inline-block",
                  padding: "4px 8px",
                  borderRadius: "6px",
                  fontSize: "0.75rem",
                  fontWeight: "600",
                  color: t.color,
                  background: t.bg,
                }}
              >
                {t.icon}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
        {/* Gráfico de Tendencias en Línea */}
        <div className="grafico-card" style={{ flex: 1.5, minWidth: "300px" }}>
          <h3 style={{ fontSize: "0.95rem", color: "#2d5a27", marginBottom: "16px", fontWeight: "700" }}>
            Tendencia de Crecimiento de Botones
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={datosLinea}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8f0e8" />
              <XAxis dataKey="fecha" tick={{ fontSize: 10 }} />
              <YAxis />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {nombresCamas.map((nombre, i) => (
                <Line
                  key={nombre}
                  type="monotone"
                  dataKey={nombre}
                  stroke={COLORES_CAMAS[i % COLORES_CAMAS.length]}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de Barras Comparativo */}
        <div className="grafico-card" style={{ flex: 1, minWidth: "250px" }}>
          <h3 style={{ fontSize: "0.95rem", color: "#2d5a27", marginBottom: "16px", fontWeight: "700" }}>
            Comparativa Rápida por Cama
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={datosBarras}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8f0e8" />
              <XAxis dataKey="cama" />
              <YAxis />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="total" fill="#3b82f6" name="Total Botones" />
              <Bar dataKey="cosecha" fill="#ec4899" name="Para Cosechar" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default function ProyeccionGlobalPage({ camasFiltradas }) {
  return (
    <div>
      <ProyeccionGlobal camas={camasFiltradas} />
      <h2 style={{ color: "#2d5a27", margin: "32px 0 16px", fontSize: "1rem", fontWeight: "700" }}>
        Comparativa General entre Camas
      </h2>
      <ComparativaCamas camas={camasFiltradas} />
    </div>
  );
}
export { ProyeccionGlobal, ComparativaCamas };
