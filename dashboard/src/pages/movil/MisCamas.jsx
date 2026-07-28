import { useState } from "react";
import { Link } from "react-router-dom";

export default function MisCamas() {
  const [camasAsignadas] = useState([
    { id: 1, nombre: "Cama 1", galpon: "Galpón Norte", estado: "Pendiente" },
    { id: 2, nombre: "Cama 2", galpon: "Galpón Norte", estado: "Sincronizado" }
  ]);

  const [camaSeleccionada, setCamaSeleccionada] = useState(null);

  return (
    <div style={{ minHeight: "100vh", background: "#f0f4f0", fontFamily: "sans-serif", paddingBottom: "80px", position: "relative" }}>
      {/* Header Móvil */}
      <div style={{ background: "#2d5a27", color: "white", padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ margin: 0, fontSize: "1.2rem" }}>Mis Camas</h2>
        <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "0.8rem", background: "rgba(255,255,255,0.2)", padding: "5px 10px", borderRadius: "20px" }}>
          <CloudOfflineIcon /> Offline Mode
        </div>
      </div>

      <div style={{ padding: "20px" }}>
        {!camaSeleccionada ? (
          <>
            <h3 style={{ color: "#1a2e1a", marginBottom: "15px" }}>Rutas Asignadas Hoy</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              {camasAsignadas.map(cama => (
                <div key={cama.id} onClick={() => setCamaSeleccionada(cama)} style={{ background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 2px 5px rgba(0,0,0,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", borderLeft: cama.estado === "Pendiente" ? "5px solid #f59e0b" : "5px solid #10b981" }}>
                  <div>
                    <h4 style={{ margin: "0 0 5px 0", fontSize: "1.1rem", color: "#1a2e1a" }}>{cama.nombre}</h4>
                    <span style={{ color: "#666", fontSize: "0.85rem" }}>{cama.galpon}</span>
                  </div>
                  <ChevronRightIcon />
                </div>
              ))}
            </div>
          </>
        ) : (
          <div style={{ background: "white", padding: "20px", borderRadius: "12px" }}>
            <button onClick={() => setCamaSeleccionada(null)} style={{ background: "none", border: "none", color: "#2d5a27", fontWeight: "bold", padding: "0 0 20px 0", fontSize: "1rem", display: "flex", alignItems: "center", gap: "5px" }}>
              ← Volver
            </button>
            <h3 style={{ color: "#1a2e1a", marginBottom: "20px", borderBottom: "1px solid #eee", paddingBottom: "10px" }}>Capturar: {camaSeleccionada.nombre}</h3>
            
            <p style={{ fontSize: "0.9rem", color: "#666", marginBottom: "15px" }}>Selecciona el método de captura para Lado A y Lado B. Las tomas se guardarán en el teléfono hasta detectar WiFi.</p>

            <Link to="/movil/prueba-camara" style={{ textDecoration: "none", width: "100%", padding: "20px", background: "#2d5a27", color: "white", border: "none", borderRadius: "10px", fontSize: "1.1rem", fontWeight: "bold", marginBottom: "15px", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", boxSizing: "border-box" }}>
              <VideoIcon /> Grabar Recorrido (Recomendado)
            </Link>

            <button style={{ width: "100%", padding: "20px", background: "white", color: "#2d5a27", border: "2px solid #2d5a27", borderRadius: "10px", fontSize: "1.1rem", fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
              <CameraIcon /> Tomar Foto (Solo camas cortas)
            </button>
          </div>
        )}
      </div>

      {/* Navegación Inferior (Tabs) */}
      <BottomNav active="camas" />
    </div>
  );
}

// Subcomponente de Menú Inferior (Para usar en las 3 vistas móviles)
export function BottomNav({ active }) {
  return (
    <div style={{ position: "fixed", bottom: 0, width: "100%", background: "white", display: "flex", justifyContent: "space-around", padding: "15px 0", borderTop: "1px solid #e2e8f0", boxShadow: "0 -2px 10px rgba(0,0,0,0.05)" }}>
      <Link to="/movil/mis-camas" style={{ color: active === "camas" ? "#2d5a27" : "#94a3b8", textDecoration: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: "5px", fontWeight: "bold", fontSize: "0.8rem" }}>
        <CameraIcon /> Camas
      </Link>
      <Link to="/movil/cosechas" style={{ color: active === "cosechas" ? "#2d5a27" : "#94a3b8", textDecoration: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: "5px", fontWeight: "bold", fontSize: "0.8rem" }}>
        <ScissorsIcon /> Cosechas
      </Link>
      <Link to="/movil/plagas" style={{ color: active === "plagas" ? "#2d5a27" : "#94a3b8", textDecoration: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: "5px", fontWeight: "bold", fontSize: "0.8rem" }}>
        <BugIcon /> Sanidad
      </Link>
    </div>
  );
}

// Iconos SVG
function CloudOfflineIcon() { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22.61 16.95A5 5 0 0 0 18 10h-1.26a8 8 0 0 0-7.05-6M5 5a8 8 0 0 0 4 15h9a5 5 0 0 0 1.7-.3"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>; }
function ChevronRightIcon() { return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg>; }
function VideoIcon() { return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>; }
function CameraIcon() { return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>; }
function ScissorsIcon() { return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="6" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><line x1="20" y1="4" x2="8.12" y2="15.88"></line><line x1="14.47" y1="14.48" x2="20" y2="20"></line><line x1="8.12" y1="8.12" x2="12" y2="12"></line></svg>; }
function BugIcon() { return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="8" y="6" width="8" height="14" rx="4"></rect><path d="M12 2v4"></path><path d="M6 10h2"></path><path d="M16 10h2"></path><path d="M6 14h2"></path><path d="M16 14h2"></path><path d="M6 18h2"></path><path d="M16 18h2"></path></svg>; }
