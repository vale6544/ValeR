import React, { useState, useEffect } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export default function ConfiguracionCamas({ onCambio }) {
  const [camas, setCamas] = useState([]);
  const [camaActiva, setCamaActiva] = useState(null);
  const [nuevaCama, setNuevaCama] = useState({
    nombre: "",
    descripcion: "",
    variedad: "",
    filas_por_cama: 1,
    largo: "",
    ancho: "",
    responsable: "",
  });
  const [editando, setEditando] = useState(null);
  const [mensaje, setMensaje] = useState(null);

  const cargar = () => {
    axios
      .get(`${API}/configuracion/camas/`)
      .then((r) => {
        setCamas(r.data);
        if (camaActiva) {
          const actualizada = r.data.find((c) => c.id === camaActiva.id);
          if (actualizada) setCamaActiva(actualizada);
        }
      })
      .catch((err) => console.error("Error al cargar camas", err));
  };

  useEffect(() => {
    cargar();
  }, []);

  const mostrarMensaje = (tipo, texto) => {
    setMensaje({ tipo, texto });
    setTimeout(() => setMensaje(null), 4000);
  };

  const crearCama = (e) => {
    e.preventDefault();
    if (!nuevaCama.nombre) return mostrarMensaje("error", "El nombre es obligatorio");
    
    const payload = {
      nombre: nuevaCama.nombre,
      descripcion: nuevaCama.descripcion || "",
      variedad: nuevaCama.variedad || "",
      filas_por_cama: nuevaCama.filas_por_cama,
      largo: nuevaCama.largo ? parseFloat(nuevaCama.largo) : null,
      ancho: nuevaCama.ancho ? parseFloat(nuevaCama.ancho) : null,
      responsable: nuevaCama.responsable || "",
    };

    axios
      .post(`${API}/configuracion/camas/`, payload)
      .then((r) => {
        setNuevaCama({
          nombre: "",
          descripcion: "",
          variedad: "",
          filas_por_cama: 1,
          largo: "",
          ancho: "",
          responsable: "",
        });
        mostrarMensaje("ok", `Cama "${r.data.nombre}" creada con éxito.`);
        cargar();
        if (onCambio) onCambio();
      })
      .catch(() => mostrarMensaje("error", "Error al crear la cama"));
  };

  const guardarEdicion = (e) => {
    e.preventDefault();
    if (!editando.nombre) return mostrarMensaje("error", "El nombre es obligatorio");
    
    const payload = {
      nombre: editando.nombre,
      descripcion: editando.descripcion || "",
      variedad: editando.variedad || "",
      filas_por_cama: editando.filas_por_cama || 1,
      largo: editando.largo ? parseFloat(editando.largo) : null,
      ancho: editando.ancho ? parseFloat(editando.ancho) : null,
      responsable: editando.responsable || "",
    };

    axios
      .put(`${API}/configuracion/camas/${editando.id}`, payload)
      .then(() => {
        mostrarMensaje("ok", "Cama actualizada con éxito.");
        setEditando(null);
        cargar();
        if (onCambio) onCambio();
      })
      .catch(() => mostrarMensaje("error", "Error al actualizar la cama"));
  };

  const eliminarCama = (cama) => {
    if (!window.confirm(`¿Eliminar "${cama.nombre}"? Esta acción no se puede deshacer.`)) return;
    axios
      .delete(`${API}/configuracion/camas/${cama.id}`)
      .then(() => {
        mostrarMensaje("ok", `Cama "${cama.nombre}" eliminada correctamente.`);
        if (camaActiva?.id === cama.id) setCamaActiva(null);
        cargar();
        if (onCambio) onCambio();
      })
      .catch((e) =>
        mostrarMensaje("error", e.response?.data?.detail || "Error al eliminar la cama.")
      );
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
            boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
          }}
        >
          {mensaje.texto}
        </div>
      )}

      {/* TOP SECTON: Formulario de Creación Horizontal */}
      <div className="grafico-card" style={{ padding: "20px" }}>
        <h2 style={{ fontSize: "1rem", color: "#2d5a27", marginBottom: "16px", fontWeight: "700" }}>
          Nueva Cama de Cultivo
        </h2>
        <form
          onSubmit={crearCama}
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "12px",
            alignItems: "flex-end",
          }}
        >
          <div style={{ flex: "1 1 150px" }}>
            <label style={styles.inputLabel}>Nombre *</label>
            <input
              type="text"
              placeholder="Ej: Cama 9"
              value={nuevaCama.nombre}
              onChange={(e) => setNuevaCama((p) => ({ ...p, nombre: e.target.value }))}
              style={styles.textInput}
              required
            />
          </div>
          <div style={{ flex: "1.5 1 200px" }}>
            <label style={styles.inputLabel}>Descripción</label>
            <input
              type="text"
              placeholder="Ubicación, notas, etc."
              value={nuevaCama.descripcion}
              onChange={(e) => setNuevaCama((p) => ({ ...p, descripcion: e.target.value }))}
              style={styles.textInput}
            />
          </div>
          <div style={{ flex: "1 1 140px" }}>
            <label style={styles.inputLabel}>Variedad</label>
            <input
              type="text"
              placeholder="Ej: Freedom"
              value={nuevaCama.variedad}
              onChange={(e) => setNuevaCama((p) => ({ ...p, variedad: e.target.value }))}
              style={styles.textInput}
            />
          </div>
          <div style={{ width: "90px" }}>
            <label style={styles.inputLabel}>Largo (m)</label>
            <input
              type="number"
              step="0.1"
              placeholder="m"
              value={nuevaCama.largo}
              onChange={(e) => setNuevaCama((p) => ({ ...p, largo: e.target.value }))}
              style={styles.textInput}
            />
          </div>
          <div style={{ width: "90px" }}>
            <label style={styles.inputLabel}>Ancho (m)</label>
            <input
              type="number"
              step="0.1"
              placeholder="m"
              value={nuevaCama.ancho}
              onChange={(e) => setNuevaCama((p) => ({ ...p, ancho: e.target.value }))}
              style={styles.textInput}
            />
          </div>
          <div style={{ flex: "1 1 150px" }}>
            <label style={styles.inputLabel}>Responsable</label>
            <input
              type="text"
              placeholder="Ej: Juan Pérez"
              value={nuevaCama.responsable}
              onChange={(e) => setNuevaCama((p) => ({ ...p, responsable: e.target.value }))}
              style={styles.textInput}
            />
          </div>
          <div style={{ width: "90px" }}>
            <label style={styles.inputLabel}>Filas</label>
            <input
              type="number"
              min="1"
              max="5"
              value={nuevaCama.filas_por_cama}
              onChange={(e) =>
                setNuevaCama((p) => ({ ...p, filas_por_cama: parseInt(e.target.value) || 1 }))
              }
              style={styles.textInput}
            />
          </div>
          <button type="submit" style={styles.btnPrimary}>
            Crear Cama
          </button>
        </form>
      </div>

      {/* BOTTOM SECTION: Dos Columnas */}
      <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
        
        {/* Camas registradas (Tabla con Scroll) */}
        <div style={{ flex: "1.2 1 450px", minWidth: "300px" }}>
          <div
            className="grafico-card"
            style={{
              padding: 0,
              display: "flex",
              flexDirection: "column",
              maxHeight: "500px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "16px 20px",
                background: "#f0f4f0",
                fontWeight: "700",
                color: "#2d5a27",
                fontSize: "0.95rem",
                borderBottom: "1px solid #e2eae2",
              }}
            >
              Camas Registradas ({camas.length})
            </div>
            
            <div style={{ overflowY: "auto", flex: 1 }}>
              {camas.length === 0 ? (
                <div style={{ padding: "30px", color: "#999", textAlign: "center" }}>
                  No hay camas registradas en el sistema.
                </div>
              ) : (
                <table className="tabla" style={{ margin: 0, width: "100%" }}>
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Variedad</th>
                      <th>Dimensión</th>
                      <th>Responsable</th>
                      <th style={{ width: "90px" }}>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {camas.map((c) => (
                      <tr
                        key={c.id}
                        onClick={() => {
                          setCamaActiva(c);
                          setEditando(null); // Resetea edición
                        }}
                        style={{
                          cursor: "pointer",
                          background: camaActiva?.id === c.id ? "#f0fdf4" : "white",
                          fontWeight: camaActiva?.id === c.id ? "600" : "400",
                        }}
                      >
                        <td style={{ color: "#2d5a27" }}>{c.nombre}</td>
                        <td>{c.variedad || "-"}</td>
                        <td style={{ fontSize: "0.82rem", color: "#666" }}>
                          {c.largo ? `${c.largo}x${c.ancho || "-"} m` : "-"}
                        </td>
                        <td>{c.responsable || "-"}</td>
                        <td>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              eliminarCama(c);
                            }}
                            style={{
                              background: "none",
                              border: "none",
                              color: "#dc2626",
                              cursor: "pointer",
                              fontSize: "0.82rem",
                              fontWeight: "600",
                            }}
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Editar cama (Detalle a la derecha) */}
        <div style={{ flex: "0.8 1 300px", minWidth: "280px" }}>
          {!camaActiva ? (
            <div
              style={{
                background: "white",
                borderRadius: "12px",
                padding: "40px 20px",
                textAlign: "center",
                color: "#999",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                border: "2px dashed #cbd5e1",
              }}
            >
              <span style={{ fontSize: "2rem" }}></span>
              <p style={{ marginTop: "12px", fontSize: "0.92rem", fontWeight: "500" }}>
                Selecciona una cama del listado para ver su detalle o editar su información.
              </p>
            </div>
          ) : (
            <div className="grafico-card">
              <h2 style={{ fontSize: "1rem", color: "#2d5a27", marginBottom: "16px", fontWeight: "700" }}>
                {editando ? "Editar Cama" : "Detalle de Cama"}
              </h2>

              {editando ? (
                <form onSubmit={guardarEdicion} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div>
                    <label style={styles.inputLabel}>Nombre</label>
                    <input
                      type="text"
                      value={editando.nombre}
                      onChange={(e) => setEditando((p) => ({ ...p, nombre: e.target.value }))}
                      style={styles.textInput}
                      required
                    />
                  </div>
                  <div>
                    <label style={styles.inputLabel}>Descripción</label>
                    <input
                      type="text"
                      value={editando.descripcion || ""}
                      onChange={(e) => setEditando((p) => ({ ...p, descripcion: e.target.value }))}
                      style={styles.textInput}
                    />
                  </div>
                  <div>
                    <label style={styles.inputLabel}>Variedad</label>
                    <input
                      type="text"
                      value={editando.variedad || ""}
                      onChange={(e) => setEditando((p) => ({ ...p, variedad: e.target.value }))}
                      style={styles.textInput}
                    />
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <div style={{ flex: 1 }}>
                      <label style={styles.inputLabel}>Largo (m)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={editando.largo || ""}
                        onChange={(e) => setEditando((p) => ({ ...p, largo: e.target.value }))}
                        style={styles.textInput}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={styles.inputLabel}>Ancho (m)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={editando.ancho || ""}
                        onChange={(e) => setEditando((p) => ({ ...p, ancho: e.target.value }))}
                        style={styles.textInput}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={styles.inputLabel}>Responsable</label>
                    <input
                      type="text"
                      value={editando.responsable || ""}
                      onChange={(e) => setEditando((p) => ({ ...p, responsable: e.target.value }))}
                      style={styles.textInput}
                    />
                  </div>
                  <div>
                    <label style={styles.inputLabel}>Filas de plantas</label>
                    <input
                      type="number"
                      min="1"
                      value={editando.filas_por_cama || 1}
                      onChange={(e) =>
                        setEditando((p) => ({ ...p, filas_por_cama: parseInt(e.target.value) || 1 }))
                      }
                      style={styles.textInput}
                    />
                  </div>
                  <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                    <button type="submit" style={styles.btnPrimary}>
                      Guardar Cambios
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditando(null)}
                      style={styles.btnSecondary}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Nombre:</span>
                    <span style={styles.detailVal}>{camaActiva.nombre}</span>
                  </div>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Descripción:</span>
                    <span style={styles.detailVal}>{camaActiva.descripcion || "Sin descripción"}</span>
                  </div>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Variedad:</span>
                    <span style={styles.detailVal}>{camaActiva.variedad || "-"}</span>
                  </div>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Dimensiones:</span>
                    <span style={styles.detailVal}>
                      {camaActiva.largo ? `${camaActiva.largo} m (Largo) x ${camaActiva.ancho || "-"} m (Ancho)` : "-"}
                    </span>
                  </div>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Responsable:</span>
                    <span style={styles.detailVal}>{camaActiva.responsable || "-"}</span>
                  </div>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Filas por Lado:</span>
                    <span style={styles.detailVal}>{camaActiva.filas_por_cama || 1}</span>
                  </div>
                  <div style={styles.detailItem}>
                    <span style={styles.detailLabel}>Fecha Registro:</span>
                    <span style={styles.detailVal} style={{ fontSize: "0.8rem", color: "#888" }}>
                      {camaActiva.fecha_creacion}
                    </span>
                  </div>

                  <button
                    onClick={() => setEditando({ ...camaActiva })}
                    style={{
                      marginTop: "12px",
                      padding: "10px",
                      background: "#dbeafe",
                      color: "#1e40af",
                      border: "none",
                      borderRadius: "8px",
                      fontWeight: "700",
                      cursor: "pointer",
                      fontSize: "0.9rem",
                    }}
                  >
                    Editar Información
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

const styles = {
  inputLabel: {
    display: "block",
    fontSize: "0.78rem",
    fontWeight: "600",
    color: "#4a5568",
    marginBottom: "4px",
  },
  textInput: {
    width: "100%",
    padding: "8px 10px",
    borderRadius: "8px",
    border: "1px solid #aac9a0",
    fontSize: "0.88rem",
    boxSizing: "border-box",
  },
  btnPrimary: {
    padding: "9px 16px",
    background: "#2d5a27",
    color: "white",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "0.9rem",
  },
  btnSecondary: {
    padding: "9px 16px",
    background: "#f3f4f6",
    color: "#4a5568",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "0.9rem",
  },
  detailItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottom: "1px solid #f0f3f0",
    paddingBottom: "8px",
    marginBottom: "4px",
    display: "flex",
  },
  detailLabel: {
    fontSize: "0.85rem",
    fontWeight: "600",
    color: "#666",
  },
  detailVal: {
    fontSize: "0.88rem",
    color: "#2c3e2b",
    fontWeight: "700",
  },
};
