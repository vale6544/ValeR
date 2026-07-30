import React, { useState, useEffect } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

function RegistroPoda({ camas, camaFiltro, onPodaRegistrada }) {
  const [camaId, setCamaId] = useState(camaFiltro || "");
  const [largos, setLargos] = useState("");
  const [medios, setMedios] = useState("");
  const [cortos, setCortos] = useState("");
  const [obs, setObs] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  useEffect(() => {
    if (camaFiltro) setCamaId(camaFiltro);
  }, [camaFiltro]);

  const guardar = () => {
    if (!camaId) return setMensaje({ tipo: "error", texto: "Selecciona una cama" });
    const total = (parseInt(largos) || 0) + (parseInt(medios) || 0) + (parseInt(cortos) || 0);
    if (total === 0) return setMensaje({ tipo: "error", texto: "Ingresa al menos un tallo podado" });
    
    setGuardando(true);
    axios
      .post(`${API}/podas/`, {
        cama_id: parseInt(camaId),
        tallos_largos: parseInt(largos) || 0,
        tallos_medios: parseInt(medios) || 0,
        tallos_cortos: parseInt(cortos) || 0,
        observaciones: obs || null,
      })
      .then((r) => {
        setMensaje({ tipo: "ok", texto: `Poda registrada - ${r.data.total_podados} tallos en ${r.data.cama}` });
        setLargos("");
        setMedios("");
        setCortos("");
        setObs("");
        onPodaRegistrada(camaId);
      })
      .catch(() => {
        setMensaje({ tipo: "error", texto: "Error al guardar la poda" });
      })
      .finally(() => setGuardando(false));
  };

  return (
    <div className="grafico-card" style={{ marginBottom: "24px" }}>
      <h2>Registrar Cosecha / Poda del día</h2>
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "flex-end" }}>
        <div>
          <div style={{ fontSize: "0.82rem", color: "#666", marginBottom: "4px" }}>Cama</div>
          <select
            value={camaId}
            onChange={(e) => setCamaId(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid #aac9a0", fontSize: "0.9rem" }}
          >
            <option value="">Seleccionar...</option>
            {camas.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>
        {[
          { label: "Tallos largos", val: largos, set: setLargos },
          { label: "Tallos medios", val: medios, set: setMedios },
          { label: "Tallos cortos", val: cortos, set: setCortos },
        ].map((f) => (
          <div key={f.label}>
            <div style={{ fontSize: "0.82rem", color: "#666", marginBottom: "4px" }}>{f.label}</div>
            <input
              type="number"
              min="0"
              value={f.val}
              onChange={(e) => f.set(e.target.value)}
              style={{ width: "90px", padding: "8px 10px", borderRadius: "8px", border: "1px solid #aac9a0", fontSize: "0.9rem" }}
              placeholder="0"
            />
          </div>
        ))}
        <div style={{ flex: 1, minWidth: "150px" }}>
          <div style={{ fontSize: "0.82rem", color: "#666", marginBottom: "4px" }}>Observaciones</div>
          <input
            type="text"
            value={obs}
            onChange={(e) => setObs(e.target.value)}
            style={{ width: "100%", padding: "8px 10px", borderRadius: "8px", border: "1px solid #aac9a0", fontSize: "0.9rem" }}
            placeholder="Opcional"
          />
        </div>
        <button
          onClick={guardar}
          disabled={guardando}
          style={{ padding: "9px 18px", background: "#2d5a27", color: "white", border: "none", borderRadius: "8px", fontWeight: "700", cursor: "pointer", fontSize: "0.9rem" }}
        >
          {guardando ? "Guardando..." : "Registrar"}
        </button>
      </div>

      {mensaje && (
        <div
          style={{
            marginTop: "12px",
            padding: "8px 12px",
            borderRadius: "6px",
            fontSize: "0.85rem",
            background: mensaje.tipo === "ok" ? "#d1fae5" : "#fee2e2",
            color: mensaje.tipo === "ok" ? "#065f46" : "#991b1b",
          }}
        >
          {mensaje.texto}
        </div>
      )}
    </div>
  );
}

export default function Cosecha({
  camas,
  camaFiltro,
  listaPodas,
  cargandoPodas,
  precisionPodas,
  setRecargarProyecciones,
  setListaPodas,
  setCargandoPodas,
}) {
  return (
    <div>
      <RegistroPoda
        camas={camas}
        camaFiltro={camaFiltro}
        onPodaRegistrada={(camaId) => {
          setRecargarProyecciones((r) => r + 1);
          if (camaId) {
            setCargandoPodas(true);
            axios
              .get(`${API}/podas/${camaId}`)
              .then((r) => setListaPodas(r.data))
              .finally(() => setCargandoPodas(false));
          }
        }}
      />
      <div className="grafico-card">
        <h2>Registros de cosecha</h2>
        {!camaFiltro && (
          <p style={{ color: "#999", textAlign: "center", padding: "20px" }}>
            Selecciona una cama en el filtro superior para ver el historial
          </p>
        )}
        {camaFiltro && cargandoPodas && <div className="cargando">Cargando podas...</div>}
        {camaFiltro && !cargandoPodas && listaPodas.length === 0 && (
          <p style={{ color: "#999", textAlign: "center", padding: "20px" }}>
            No hay podas registradas para esta cama
          </p>
        )}
        {camaFiltro && !cargandoPodas && listaPodas.length > 0 && (
          <>
            <div style={{ display: "flex", gap: "12px", marginBottom: "16px", flexWrap: "wrap" }}>
              {[
                { label: "Total registros", valor: listaPodas.length, color: "#f0f4f0", text: "#2d5a27" },
                { label: "Total largos", valor: listaPodas.reduce((s, p) => s + p.tallos_largos, 0), color: "#d1fae5", text: "#065f46" },
                { label: "Total medios", valor: listaPodas.reduce((s, p) => s + p.tallos_medios, 0), color: "#dbeafe", text: "#1e40af" },
                { label: "Total cortos", valor: listaPodas.reduce((s, p) => s + p.tallos_cortos, 0), color: "#fef3c7", text: "#92400e" },
                { label: "Total podados", valor: listaPodas.reduce((s, p) => s + p.total_podados, 0), color: "#f0fdf4", text: "#2d5a27" },
              ].map((t) => (
                <div
                  key={t.label}
                  style={{ background: t.color, padding: "10px 16px", borderRadius: "10px", textAlign: "center", minWidth: "110px" }}
                >
                  <div style={{ fontSize: "1.3rem", fontWeight: "700", color: t.text }}>{t.valor}</div>
                  <div style={{ fontSize: "0.78rem", color: t.text }}>{t.label}</div>
                </div>
              ))}
            </div>
            <table className="tabla">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th style={{ textAlign: "center", background: "#d1fae544" }}>Largos</th>
                  <th style={{ textAlign: "center", background: "#dbeafe44" }}>Medios</th>
                  <th style={{ textAlign: "center", background: "#fef3c744" }}>Cortos</th>
                  <th style={{ textAlign: "center", background: "#f0fdf444" }}>Total podados</th>
                  <th style={{ textAlign: "center" }}>Proyección IA</th>
                  <th style={{ textAlign: "center" }}>Desviación</th>
                  <th>Observaciones</th>
                </tr>
              </thead>
              <tbody>
                {listaPodas.map((p, i) => {
                  const comparacion = precisionPodas[p.fecha.split(" ")[0]];
                  return (
                    <tr key={i}>
                      <td>{p.fecha}</td>
                      <td style={{ textAlign: "center", background: "#d1fae522" }}>{p.tallos_largos}</td>
                      <td style={{ textAlign: "center", background: "#dbeafe22" }}>{p.tallos_medios}</td>
                      <td style={{ textAlign: "center", background: "#fef3c722" }}>{p.tallos_cortos}</td>
                      <td style={{ textAlign: "center", background: "#f0fdf422", fontWeight: "700" }}>{p.total_podados}</td>
                      <td style={{ textAlign: "center" }}>{comparacion ? comparacion.proyectado : "-"}</td>
                      <td style={{ textAlign: "center" }}>
                        {comparacion ? (
                          <span
                            style={{
                              color: Math.abs(p.total_podados - comparacion.proyectado) > 10 ? "#dc2626" : "#166534",
                              fontWeight: "700",
                            }}
                          >
                            {p.total_podados - comparacion.proyectado >= 0 ? "+" : ""}
                            {p.total_podados - comparacion.proyectado} ({comparacion.error_porcentual}%)
                          </span>
                        ) : (
                          <span style={{ color: "#ddd" }}>-</span>
                        )}
                      </td>
                      <td style={{ color: "#666", fontSize: "0.85rem" }}>{p.observaciones || "-"}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{ background: "#f0f4f0", fontWeight: "700" }}>
                  <td>Total</td>
                  <td style={{ textAlign: "center", color: "#065f46" }}>{listaPodas.reduce((s, p) => s + p.tallos_largos, 0)}</td>
                  <td style={{ textAlign: "center", color: "#1e40af" }}>{listaPodas.reduce((s, p) => s + p.tallos_medios, 0)}</td>
                  <td style={{ textAlign: "center", color: "#92400e" }}>{listaPodas.reduce((s, p) => s + p.tallos_cortos, 0)}</td>
                  <td style={{ textAlign: "center", color: "#2d5a27", fontSize: "1.1rem" }}>{listaPodas.reduce((s, p) => s + p.total_podados, 0)}</td>
                  <td></td>
                  <td></td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </>
        )}
      </div>
    </div>
  );
}
export { RegistroPoda };
