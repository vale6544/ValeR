import React from "react";

export default function Header({ titulo, colapsado, setColapsado }) {
  return (
    <header
      style={{
        height: "60px",
        background: "#2d5a27",
        color: "white",
        display: "flex",
        alignItems: "center",
        padding: "0 24px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        zIndex: 10,
      }}
    >
      {/* Botón para colapsar lateral */}
      <button
        onClick={() => setColapsado(!colapsado)}
        style={{
          background: "transparent",
          border: "none",
          color: "white",
          cursor: "pointer",
          marginRight: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "6px",
          borderRadius: "4px",
          transition: "background 0.2s",
        }}
        title={colapsado ? "Expandir menú" : "Colapsar menú"}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>

      {/* Título de la sección actual */}
      <h1 style={{ fontSize: "1.15rem", fontWeight: "600", margin: 0 }}>
        {titulo}
      </h1>
    </header>
  );
}
