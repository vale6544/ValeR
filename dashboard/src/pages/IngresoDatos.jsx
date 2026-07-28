import React, { useState, useEffect } from "react";
import axios from "axios";

const API = "http://127.0.0.1:8000";

const BOTONES_LIST = [
  {key:"cosecha",       label:"Cosecha",       color:"#166534"},
  {key:"estrella",      label:"Estrella",      color:"#22c55e"},
  {key:"rayando",       label:"Rayando color", color:"#eab308"},
  {key:"garbanzo",      label:"Garbanzo",      color:"#f97316"},
  {key:"alberja",       label:"Alberja",       color:"#a855f7"},
  {key:"arroz",         label:"Arroz",         color:"#ef4444"}
]

const TALLOS_LIST = [
  {key:"tallo_largo", label:"Tallo largo", color:"#d1fae5"},
  {key:"tallo_medio", label:"Tallo medio", color:"#dbeafe"},
  {key:"tallo_corto", label:"Tallo corto", color:"#fef3c7"}
]

function MatrizTalloBoton({ datos, titulo }) {
  if (!datos) return null;
  const getCampo = (tallo, boton) => {
    if (datos.matriz) {
      return datos.matriz[`${tallo}_${boton}`] || 0;
    }
    return datos[`${tallo}_${boton}`] || 0;
  };
  const totalPorBoton = {};
  const totalPorTallo = {};
  let granTotal = 0;
  BOTONES_LIST.forEach((b) => {
    totalPorBoton[b.key] = TALLOS_LIST.reduce((s, t) => s + getCampo(t.key, b.key), 0);
  });
  TALLOS_LIST.forEach((t) => {
    totalPorTallo[t.key] = BOTONES_LIST.reduce((s, b) => s + getCampo(t.key, b.key), 0);
    granTotal += totalPorTallo[t.key];
  });

  if (granTotal === 0) {
    return (
      <div className="grafico-card" style={{ marginBottom: "24px" }}>
        <h3 style={{ fontSize: "0.95rem", color: "#2d5a27", marginBottom: "8px", fontWeight: "700" }}>{titulo}</h3>
        <p style={{ color: "#999", fontSize: "0.88rem" }}>Sin datos combinados para este registro</p>
      </div>
    );
  }

  return (
    <div className="grafico-card" style={{ marginBottom: "24px" }}>
      <h3 style={{ fontSize: "0.95rem", color: "#2d5a27", marginBottom: "16px", fontWeight: "700" }}>{titulo}</h3>
      <div style={{ overflowX: "auto" }}>
        <table className="tabla">
          <thead>
            <tr>
              <th style={{ minWidth: "130px" }}>Tallo</th>
              {BOTONES_LIST.map((b) => (
                <th key={b.key} style={{ background: b.color + "44", textAlign: "center", minWidth: "75px" }}>
                  {b.label}
                </th>
              ))}
              <th style={{ textAlign: "center", background: "#f0f4f0" }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {TALLOS_LIST.map((t) => (
              <tr key={t.key}>
                <td style={{ background: t.color, fontWeight: "600" }}>{t.label}</td>
                {BOTONES_LIST.map((b) => {
                  const val = getCampo(t.key, b.key);
                  return (
                    <td key={b.key} style={{ textAlign: "center", background: val > 0 ? b.color + "33" : "white" }}>
                      {val > 0 ? <strong>{val}</strong> : <span style={{ color: "#ddd" }}>-</span>}
                    </td>
                  );
                })}
                <td style={{ textAlign: "center", fontWeight: "700", color: "#2d5a27", background: "#f0f4f0" }}>
                  {totalPorTallo[t.key]}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ background: "#f0f4f0", fontWeight: "700" }}>
              <td>Total botón</td>
              {BOTONES_LIST.map((b) => (
                <td key={b.key} style={{ textAlign: "center" }}>
                  {totalPorBoton[b.key] > 0 ? totalPorBoton[b.key] : "-"}
                </td>
              ))}
              <td style={{ textAlign: "center", color: "#2d5a27", fontSize: "1.1rem" }}>{granTotal}</td>
            </tr>
          </tfoot>
        </table>
        <div style={{ marginTop: "12px", padding: "10px 14px", background: "#f0fdf4", borderRadius: "8px", borderLeft: "4px solid #2d5a27" }}>
          <span style={{ fontWeight: "600", color: "#2d5a27" }}>Listos para cosechar: </span>
          <span style={{ fontSize: "1.2rem", fontWeight: "700", color: "#2d5a27" }}>{totalPorBoton["cosecha"] || 0}</span>
          <span style={{ color: "#666", fontSize: "0.85rem", marginLeft: "8px" }}>
            ({getCampo("tallo_largo", "cosecha")} largo • {getCampo("tallo_medio", "cosecha")} medio • {getCampo("tallo_corto", "cosecha")} corto)
          </span>
        </div>
      </div>
    </div>
  );
}

export default function IngresoDatos({ camas, onCargaExitosa }) {
  const [camaId, setCamaId] = useState("");
  const [videoA, setVideoA] = useState(null);
  const [videoB, setVideoB] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [registroActivo, setRegistroActivo] = useState(null);

  const cargarHistorial = () => {
    axios
      .get(`${API}/registros/cama-completa/`)
      .then((r) => setHistorial(r.data))
      .catch((err) => console.error("Error cargando historial", err));
  };

  useEffect(() => {
    cargarHistorial();
  }, []);

  const procesarDatos = async (e) => {
    e.preventDefault();
    if (!camaId || !videoA || !videoB) {
      alert("Por favor selecciona una cama y sube los videos de ambos lados (A y B).");
      return;
    }

    setCargando(true);
    setMensaje(null);
    setRegistroActivo(null);

    const fd = new FormData();
    fd.append("cama_id", camaId);
    fd.append("video_a", videoA);
    fd.append("video_b", videoB);

    try {
      const r = await axios.post(`${API}/registros/cargar-cama-completa/`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 600000, // 10 minutos
      });

      setMensaje({
        tipo: "ok",
        texto: "Análisis consolidado completado con éxito.",
      });
      setVideoA(null);
      setVideoB(null);
      cargarHistorial();

      axios.get(`${API}/registros/cama-completa/`).then((res) => {
        const rec = res.data.find((item) => String(item.id) === String(r.data.registro_id));
        if (rec) setRegistroActivo(rec);
      });
      onCargaExitosa();
    } catch (err) {
      console.error(err);
      setMensaje({
        tipo: "error",
        texto: err.response?.data?.detail || "Ocurrió un error al procesar el análisis.",
      });
    } finally {
      setCargando(false);
    }
  };

  const eliminarRegistro = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este registro?")) return;
    try {
      await axios.delete(`${API}/registros/${id}`);
      if (registroActivo && registroActivo.id === id) {
        setRegistroActivo(null);
      }
      cargarHistorial();
    } catch (err) {
      alert("Error al eliminar");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Alert Banner */}
      {mensaje && (
        <div
          style={{
            padding: "12px 16px",
            borderRadius: "8px",
            fontSize: "0.9rem",
            fontWeight: "500",
            background: mensaje.tipo === "ok" ? "#d1fae5" : "#fee2e2",
            color: mensaje.tipo === "ok" ? "#065f46" : "#991b1b",
            borderLeft: `4px solid ${mensaje.tipo === "ok" ? "#10b981" : "#ef4444"}`,
          }}
        >
          {mensaje.texto}
        </div>
      )}

      {/* Upload Form */}
      <div className="grafico-card">
        <h2 style={{ fontSize: "1rem", color: "#2d5a27", marginBottom: "16px", fontWeight: "700" }}>
          Procesamiento de Video
        </h2>
        <form onSubmit={procesarDatos} style={{ display: "flex", gap: "16px", alignItems: "flex-end", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: "180px" }}>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "600", marginBottom: "4px" }}>Cama *</label>
            <select
              value={camaId}
              onChange={(e) => setCamaId(e.target.value)}
              style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #aac9a0" }}
              required
            >
              <option value="">Selecciona cama...</option>
              {camas.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "600", marginBottom: "4px" }}>Video Lado A *</label>
            <input
              type="file"
              accept="video/*"
              onChange={(e) => setVideoA(e.target.files[0])}
              style={{ fontSize: "0.85rem" }}
              required
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: "600", marginBottom: "4px" }}>Video Lado B *</label>
            <input
              type="file"
              accept="video/*"
              onChange={(e) => setVideoB(e.target.files[0])}
              style={{ fontSize: "0.85rem" }}
              required
            />
          </div>
          <button type="submit" disabled={cargando} className="btn-primary" style={{ padding: "9px 18px", background: "#2d5a27", color: "white", border: "none", borderRadius: "8px", fontWeight: "700", cursor: "pointer" }}>
            {cargando ? "Procesando..." : "Procesar Cama Completa"}
          </button>
        </form>
      </div>

      {/* Split view with Historial and Matrix */}
      <div style={{ display: "flex", gap: "24px", flexWrap: "wrap", alignItems: "flex-start" }}>
        
        {/* Historial (Tabla izquierda) */}
        <div style={{ flex: "1 1 320px" }}>
          <div className="grafico-card" style={{ padding: 0, maxHeight: "500px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "14px 16px", background: "#f0f4f0", fontWeight: "600", color: "#2d5a27", fontSize: "0.9rem" }}>
              Historial de Censo Continuo
            </div>
            <div style={{ overflowY: "auto", flex: 1 }}>
              {historial.length === 0 ? (
                <div style={{ padding: "20px", color: "#999", textAlign: "center" }}>No hay análisis previos</div>
              ) : (
                <table className="tabla" style={{ margin: 0 }}>
                  <thead>
                    <tr>
                      <th>Cama</th>
                      <th>Fecha</th>
                      <th>Tallos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historial.map((h) => (
                      <tr
                        key={h.id}
                        onClick={() => setRegistroActivo(h)}
                        style={{
                          cursor: "pointer",
                          background: registroActivo?.id === h.id ? "#f0fdf4" : "white",
                        }}
                      >
                        <td style={{ fontWeight: "700", color: "#2d5a27" }}>{h.cama_nombre || `Cama ${h.cama_id}`}</td>
                        <td style={{ fontSize: "0.8rem" }}>{h.fecha}</td>
                        <td style={{ fontWeight: "700" }}>{h.total_tallos}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Detalle del Registro / Matriz Cruzada (Derecha) */}
        <div style={{ flex: "1.8 1 450px" }}>
          {!registroActivo ? (
            <div style={{ background: "white", borderRadius: "12px", padding: "40px", textAlign: "center", color: "#999", border: "2px dashed #cbd5e1" }}>
              Selecciona un censo del historial para visualizar su matriz detallada.
            </div>
          ) : (
            <div>
              <div style={{ background: "white", borderRadius: "12px", padding: "14px 16px", marginBottom: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap" }}>
                <div>
                  <span style={{ color: "#666", fontSize: "0.78rem" }}>Cama</span>
                  <div style={{ fontWeight: "700", color: "#2d5a27" }}>{registroActivo.cama_nombre || `Cama ${registroActivo.cama_id}`}</div>
                </div>
                <div>
                  <span style={{ color: "#666", fontSize: "0.78rem" }}>Fecha</span>
                  <div style={{ fontWeight: "600" }}>{registroActivo.fecha}</div>
                </div>
                <div>
                  <span style={{ color: "#666", fontSize: "0.78rem" }}>Confianza</span>
                  <div style={{ fontWeight: "700", color: registroActivo.confianza >= 0.7 ? "#166534" : "#b45309" }}>
                    {registroActivo.confianza}
                  </div>
                </div>
                <button onClick={() => eliminarRegistro(registroActivo.id)} style={{ marginLeft: "auto", padding: "6px 12px", background: "#fee2e2", color: "#991b1b", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "0.8rem" }}>
                  Eliminar
                </button>
              </div>

              <MatrizTalloBoton datos={registroActivo} titulo="Matriz Cruzada - Tallos por Etapa de Botón (Consolidado)" />
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
export { MatrizTalloBoton };
