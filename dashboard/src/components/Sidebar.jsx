import React from "react";

export default function Sidebar({ seccion, setSeccion, colapsado, setColapsado }) {
  const MENU = [
    { key: "configuracion", label: "Configuración", icon: <BedsIcon /> },
    { key: "cama_completa", label: "Ingreso de Datos", icon: <UploadIcon /> },
    { key: "consolidado", label: "Datos Consolidados", icon: <ConsolidatedIcon /> },
    { key: "proyecciones", label: "Proyección Cama", icon: <ProjectionIcon /> },
    { key: "proyeccion_global", label: "Proyección Global", icon: <GlobalIcon /> },
    { key: "podas", label: "Cosecha / Poda", icon: <PruningIcon /> },
  ];

  return (
    <div
      style={{
        width: colapsado ? "70px" : "240px",
        background: "#1e3f1a",
        color: "white",
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        transition: "width 0.3s ease",
        borderRight: "1px solid #163013",
        position: "sticky",
        top: "0",
        height: "100vh",
        overflowY: "auto",
      }}
    >
      {/* Logo / Header del Sidebar */}
      <div
        style={{
          padding: "20px 16px",
          borderBottom: "1px solid #2d5a27",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "60px",
          boxSizing: "border-box"
        }}
      >
        {colapsado ? (
          <span style={{ fontWeight: "800", fontSize: "1.1rem", color: "#86efac" }}>RM</span>
        ) : (
          <span style={{ fontWeight: "700", fontSize: "1.1rem", color: "white", letterSpacing: "0.5px" }}>
            ROSAS MONITOR
          </span>
        )}
      </div>

      {/* Menú de Navegación */}
      <nav style={{ padding: "16px 0", flex: 1 }}>
        {MENU.map((item) => {
          const isActive = seccion === item.key;
          return (
            <button
              key={item.key}
              onClick={() => setSeccion(item.key)}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "12px 16px",
                background: isActive ? "#2d5a27" : "transparent",
                color: "white",
                border: "none",
                cursor: "pointer",
                borderLeft: isActive ? "4px solid #86efac" : "4px solid transparent",
                fontSize: "0.9rem",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                fontWeight: isActive ? "600" : "400",
                transition: "all 0.2s ease",
              }}
              title={colapsado ? item.label : ""}
            >
              <div style={{ color: isActive ? "#86efac" : "#a3bca0" }}>{item.icon}</div>
              {!colapsado && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

// Botón contenedor clickable personalizado para React Web
function TouchableOpacitySidebar({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: "transparent",
        border: "none",
        color: "white",
        cursor: "pointer",
        padding: "4px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {children}
    </button>
  );
}

// Iconos SVG
function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12"></line>
      <line x1="3" y1="6" x2="21" y2="6"></line>
      <line x1="3" y1="18" x2="21" y2="18"></line>
    </svg>
  );
}

function BedsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9"></rect>
      <rect x="14" y="3" width="7" height="5"></rect>
      <rect x="14" y="12" width="7" height="9"></rect>
      <rect x="3" y="16" width="7" height="5"></rect>
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
      <circle cx="12" cy="13" r="4"></circle>
    </svg>
  );
}

function ConsolidatedIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6"></line>
      <line x1="8" y1="12" x2="21" y2="12"></line>
      <line x1="8" y1="18" x2="21" y2="18"></line>
      <line x1="3" y1="6" x2="3.01" y2="6"></line>
      <line x1="3" y1="12" x2="3.01" y2="12"></line>
      <line x1="3" y1="18" x2="3.01" y2="18"></line>
    </svg>
  );
}

function ProjectionIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
      <polyline points="17 6 23 6 23 12"></polyline>
    </svg>
  );
}

function GlobalIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="2" y1="12" x2="22" y2="12"></line>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
    </svg>
  );
}

function PruningIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
    </svg>
  );
}
