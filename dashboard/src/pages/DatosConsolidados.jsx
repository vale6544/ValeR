import React from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { MatrizTalloBoton } from "./IngresoDatos";

const BOTONES_LIST = [
  { key: "cosecha", label: "Cosecha", color: "#166534" },
  { key: "estrella", label: "Estrella", color: "#22c55e" },
  { key: "rayando", label: "Rayando color", color: "#eab308" },
  { key: "garbanzo", label: "Garbanzo", color: "#f97316" },
  { key: "alberja", label: "Alberja", color: "#a855f7" },
  { key: "arroz", label: "Arroz", color: "#ef4444" },
];

const TALLOS_LIST = [
  {key:"tallo_largo", label:"Tallo largo", color:"#d1fae5"},
  {key:"tallo_medio", label:"Tallo medio", color:"#dbeafe"},
  {key:"tallo_corto", label:"Tallo corto", color:"#fef3c7"}
]

function Distribucion({ datos, titulo }) {
  const pieData = BOTONES_LIST.map((b) => {
    const val = TALLOS_LIST.reduce((s, t) => s + (datos[`${t.key}_${b.key}`] || 0), 0);
    return { name: b.label, value: val, fill: b.color };
  }).filter((d) => d.value > 0);

  const total = pieData.reduce((s, d) => s + d.value, 0);

  if (total === 0) {
    return (
      <div className="grafico-card" style={{ marginBottom: "24px" }}>
        <h3 style={{ fontSize: "0.95rem", color: "#2d5a27", marginBottom: "8px", fontWeight: "700" }}>{titulo}</h3>
        <p style={{ color: "#999", fontSize: "0.88rem" }}>Sin datos de distribución para mostrar</p>
      </div>
    );
  }

  return (
    <div className="grafico-card" style={{ marginBottom: "24px" }}>
      <h3 style={{ fontSize: "0.95rem", color: "#2d5a27", marginBottom: "16px", fontWeight: "700" }}>{titulo}</h3>
      <div style={{ display: "flex", alignItems: "center", gap: "32px", flexWrap: "wrap" }}>
        <ResponsiveContainer width={260} height={260}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={110}
              dataKey="value"
              label={({ name, value }) => `${name}: ${value}`}
            >
              {pieData.map((d, i) => (
                <Cell key={i} fill={d.fill} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        <div style={{ flex: 1, minWidth: "180px" }}>
          {pieData.map((d) => (
            <div key={d.name} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <div style={{ width: "12px", height: "12px", borderRadius: "3px", background: d.fill, flexShrink: 0 }}></div>
              <div style={{ flex: 1, fontSize: "0.88rem" }}>{d.name}</div>
              <div style={{ fontWeight: "700", minWidth: "28px", textAlign: "right" }}>{d.value}</div>
              <div style={{ color: "#999", fontSize: "0.78rem", minWidth: "42px", textAlign: "right" }}>
                {((d.value / total) * 100).toFixed(1)}%
              </div>
            </div>
          ))}
          <div style={{ borderTop: "2px solid #e8f0e8", marginTop: "8px", paddingTop: "8px", display: "flex", justifyContent: "space-between", fontWeight: "700", color: "#2d5a27" }}>
            <span>Total</span>
            <span>{total}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DatosConsolidados({ consolidadoFiltrado, cargando }) {
  return (
    <div>
      {cargando && <div className="cargando">Cargando datos consolidados...</div>}
      {!cargando && consolidadoFiltrado.length === 0 && (
        <div style={{ background: "white", borderRadius: "12px", padding: "40px", textAlign: "center", color: "#999", border: "2px dashed #cbd5e1" }}>
          No hay datos consolidados para la fecha y cama seleccionada.
        </div>
      )}
      {consolidadoFiltrado.map((cama, i) => (
        <div key={i} style={{ marginBottom: "32px" }}>
          <div style={{ background: "#2d5a27", color: "white", padding: "12px 18px", borderRadius: "10px 10px 0 0", fontWeight: "700", fontSize: "1rem" }}>
            {cama.cama_nombre} — Censo consolidado ({cama.total_registros} video/s)
          </div>
          <MatrizTalloBoton datos={cama} titulo="Matriz Cruzada Consolidada - Tallos por Etapa de Botón" />
          <Distribucion datos={cama} titulo="Distribución de Botones por Etapa" />
        </div>
      ))}
    </div>
  );
}
export { Distribucion };
