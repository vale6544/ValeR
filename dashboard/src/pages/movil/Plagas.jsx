import { useState } from "react";
import { BottomNav } from "./MisCamas";

export default function Plagas() {
  const [reportado, setReportado] = useState(false);
  const [showSanidad, setShowSanidad] = useState(false);
  const [flippedCardId, setFlippedCardId] = useState(null);

  const handleGuardar = (e) => {
    e.preventDefault();
    setReportado(true);
    setTimeout(() => setReportado(false), 3000);
  };

  // Listado de plagas con iconos SVG y datos reales
  const plagas = [
    {
      id: 1,
      nombre: "Trips (Frankliniella)",
      icono: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="6" />
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h2M6.34 17.66l2.83-2.83M14.83 9.17l2.83-2.83" />
        </svg>
      ),
      sintoma: "Insecto de tamaño diminuto que deforma los botones florales y deja listas/marcas blancas en los pétalos.",
      clima: "Peligro: 23°C - 28°C | Humedad 70% - 80%"
    },
    {
      id: 2,
      nombre: "Araña Roja (Tetranychus)",
      icono: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v6M12 16v6M4 12h6M14 12h6" />
          <circle cx="12" cy="12" r="4" />
          <path d="M6 6l4 4M14 10l4-4M6 18l4-4M14 14l4 4" />
        </svg>
      ),
      sintoma: "Produce punteado blanco-amarillento en las hojas y telas de araña finas en el envés. Causa defoliación severa.",
      clima: "Peligro: Altas temperaturas, sequedad y baja humedad."
    },
    {
      id: 3,
      nombre: "Pulgón Verde (Macrosiphum)",
      icono: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9zM12 2v3M9 21a3 3 0 0 0 6 0" />
        </svg>
      ),
      sintoma: "Insecto verde que ataca directamente tallos jóvenes y yemas florales, dejando manchas descoloridas y hundidas.",
      clima: "Peligro: Ambientes secos sin calor extremo."
    },
    {
      id: 4,
      nombre: "Minador de la Hoja",
      icono: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 22C2 12 10 4 20 4M22 2v8M14 6l8 4-8 4" />
        </svg>
      ),
      sintoma: "Las larvas se alimentan del tejido interno creando galerías o túneles sinuosos blancos a lo largo de las hojas.",
      clima: "Peligro: Temperaturas moderadas y brotación activa."
    },
    {
      id: 5,
      nombre: "Botrytis (Moho Gris)",
      icono: (
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 11H7v-2h4V7h2z" />
        </svg>
      ),
      sintoma: "Produce vello y pudrición de color gris cenizo en pétalos, yemas y hojas debido a la excesiva humedad.",
      clima: "Peligro: Bajas temperaturas y humedad relativa muy alta."
    }
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f0f4f0", fontFamily: "sans-serif", paddingBottom: "80px", position: "relative" }}>
      {/* Header */}
      <div style={{ background: "#991b1b", color: "white", padding: "20px", textAlign: "center" }}>
        <h2 style={{ margin: 0, fontSize: "1.2rem" }}>Reporte de Sanidad / Plagas</h2>
      </div>

      <div style={{ padding: "20px" }}>
        <div style={{ background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 2px 5px rgba(0,0,0,0.05)" }}>
          {reportado && (
            <div style={{ background: "#fee2e2", color: "#991b1b", padding: "10px", borderRadius: "8px", marginBottom: "15px", textAlign: "center", fontWeight: "bold" }}>
              ¡Alerta Enviada al Supervisor!
            </div>
          )}
          
          <form onSubmit={handleGuardar} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <div>
              <label style={{ display: "block", color: "#1a2e1a", fontWeight: "bold", marginBottom: "5px" }}>Cama Afectada</label>
              <select style={{ width: "100%", padding: "15px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "1rem", background: "white" }} required>
                <option value="">Seleccione una cama...</option>
                <option value="1">Cama 1</option>
                <option value="2">Cama 2</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", color: "#1a2e1a", fontWeight: "bold", marginBottom: "5px" }}>Tipo de Plaga / Enfermedad</label>
              <select style={{ width: "100%", padding: "15px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "1rem", background: "white" }} required>
                <option value="">Seleccione problema...</option>
                <option value="trips">Trips (Frankliniella)</option>
                <option value="acaros">Ácaros (Arañita roja)</option>
                <option value="pulgon">Pulgón verde</option>
                <option value="minador">Minador de la hoja</option>
                <option value="botrytis">Botrytis (Moho gris)</option>
                <option value="otro">Otro</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", color: "#1a2e1a", fontWeight: "bold", marginBottom: "5px" }}>Nivel de Severidad</label>
              <div style={{ display: "flex", gap: "10px" }}>
                <label style={{ flex: 1, background: "#fef3c7", padding: "10px", textAlign: "center", borderRadius: "8px", border: "1px solid #f59e0b", fontWeight: "bold", color: "#d97706", cursor: "pointer" }}>
                  <input type="radio" name="severidad" value="Bajo" required /> Bajo
                </label>
                <label style={{ flex: 1, background: "#ffedd5", padding: "10px", textAlign: "center", borderRadius: "8px", border: "1px solid #f97316", fontWeight: "bold", color: "#c2410c", cursor: "pointer" }}>
                  <input type="radio" name="severidad" value="Medio" required /> Medio
                </label>
                <label style={{ flex: 1, background: "#fee2e2", padding: "10px", textAlign: "center", borderRadius: "8px", border: "1px solid #ef4444", fontWeight: "bold", color: "#b91c1c", cursor: "pointer" }}>
                  <input type="radio" name="severidad" value="Alto" required /> Alto
                </label>
              </div>
            </div>

            <div>
              <label style={{ display: "block", color: "#1a2e1a", fontWeight: "bold", marginBottom: "5px" }}>Fotografía de Evidencia</label>
              <input type="file" accept="image/*" capture="environment" style={{ width: "100%", padding: "10px", background: "#f8fafc", borderRadius: "8px", border: "1px dashed #cbd5e1" }} />
            </div>

            <button type="submit" style={{ width: "100%", padding: "15px", background: "#991b1b", color: "white", border: "none", borderRadius: "8px", fontSize: "1.2rem", fontWeight: "bold", marginTop: "10px", cursor: "pointer" }}>
              Emitir Reporte
            </button>
          </form>
        </div>
      </div>

      {/* Botón Flotante de Sanidad (FAB) */}
      <button 
        onClick={() => {
          setShowSanidad(true);
          setFlippedCardId(null);
        }}
        style={{
          position: "fixed",
          bottom: "85px",
          right: "20px",
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          backgroundColor: "#166534",
          color: "white",
          border: "none",
          boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 99,
          outline: "none",
          transition: "transform 0.2s, background-color 0.2s"
        }}
        title="Guía de Identificación"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </button>

      {/* Modal Desplegable de Fichas de Sanidad */}
      {showSanidad && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: "#f0f4f0",
            width: "100%",
            maxWidth: "500px",
            height: "85%",
            borderTopLeftRadius: "24px",
            borderTopRightRadius: "24px",
            padding: "24px 20px 20px 20px",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            boxShadow: "0 -8px 30px rgba(0,0,0,0.15)"
          }}>
            {/* Header Modal */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px", borderBottom: "2px solid #aac9a0", paddingBottom: "12px" }}>
              <h3 style={{ margin: 0, color: "#166534", fontSize: "1.25rem", fontWeight: "bold", display: "flex", alignItems: "center", gap: "8px" }}>
                Guía de Identificación
              </h3>
              <button 
                onClick={() => setShowSanidad(false)} 
                style={{ background: "none", border: "none", color: "#dc2626", fontWeight: "bold", fontSize: "1.1rem", cursor: "pointer" }}
              >
                Cerrar
              </button>
            </div>

            {/* Listado de Plagas */}
            <div style={{ flex: 1, overflowY: "auto", paddingBottom: "20px" }}>
              <p style={{ fontSize: "0.85rem", color: "#4b5563", marginBottom: "15px" }}>Toca cualquier tarjeta para girarla y leer los síntomas y las condiciones climáticas de riesgo.</p>

              {plagas.map((plaga) => {
                const isFlipped = flippedCardId === plaga.id;
                return (
                  <div 
                    key={plaga.id} 
                    onClick={() => setFlippedCardId(isFlipped ? null : plaga.id)}
                    style={{
                      width: "100%",
                      height: "170px",
                      perspective: "1000px",
                      marginBottom: "15px",
                      cursor: "pointer"
                    }}
                  >
                    <div style={{
                      position: "relative",
                      width: "100%",
                      height: "100%",
                      transition: "transform 0.6s",
                      transformStyle: "preserve-3d",
                      transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)"
                    }}>
                      
                      {/* Cara Frontal */}
                      <div style={{
                        position: "absolute",
                        width: "100%",
                        height: "100%",
                        backfaceVisibility: "hidden",
                        backgroundColor: "white",
                        border: "1px solid #aac9a0",
                        borderRadius: "12px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        padding: "15px",
                        boxSizing: "border-box",
                        boxShadow: "0 2px 6px rgba(0,0,0,0.05)"
                      }}>
                        <div style={{ color: "#166534", marginBottom: "10px" }}>{plaga.icono}</div>
                        <h4 style={{ margin: 0, color: "#166534", fontSize: "1.1rem", fontWeight: "bold" }}>{plaga.nombre}</h4>
                        <span style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: "8px" }}>Toca para ver información ⟳</span>
                      </div>

                      {/* Cara Trasera */}
                      <div style={{
                        position: "absolute",
                        width: "100%",
                        height: "100%",
                        backfaceVisibility: "hidden",
                        transform: "rotateY(180deg)",
                        backgroundColor: "#2d5a27",
                        color: "white",
                        borderRadius: "12px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        padding: "15px",
                        boxSizing: "border-box",
                        textAlign: "center",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
                      }}>
                        <div>
                          <h5 style={{ margin: "0 0 5px 0", fontSize: "0.95rem", fontWeight: "bold" }}>Síntomas</h5>
                          <p style={{ margin: 0, fontSize: "0.8rem", lineHeight: "1.3" }}>{plaga.sintoma}</p>
                        </div>
                        <div style={{ backgroundColor: "#1e3f1a", padding: "6px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: "600" }}>
                          {plaga.clima}
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Menú de navegación inferior */}
      <BottomNav active="plagas" />
    </div>
  );
}
