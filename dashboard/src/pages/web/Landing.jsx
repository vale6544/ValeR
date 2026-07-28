import { Link } from "react-router-dom";

export default function Landing() {
  return (
    <div style={{ minHeight: "100vh", background: "#f0f4f0", fontFamily: "sans-serif" }}>
      {/* Navbar */}
      <nav style={{ background: "#2d5a27", padding: "15px 30px", display: "flex", justifyContent: "space-between", alignItems: "center", color: "white" }}>
        <h2 style={{ margin: 0, fontSize: "1.5rem" }}>Rosas Monitor</h2>
        <div>
          <Link to="/login" style={{ color: "white", textDecoration: "none", marginRight: "20px", fontWeight: "600" }}>Iniciar Sesión</Link>
          <Link to="/web/registro" style={{ background: "white", color: "#2d5a27", padding: "8px 16px", borderRadius: "5px", textDecoration: "none", fontWeight: "bold" }}>Prueba Gratuita</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div style={{ textAlign: "center", padding: "80px 20px" }}>
        <h1 style={{ color: "#1a2e1a", fontSize: "3rem", marginBottom: "20px" }}>Monitoreo Inteligente para Floricultura</h1>
        <p style={{ color: "#4a5568", fontSize: "1.2rem", maxWidth: "600px", margin: "0 auto 40px" }}>
          Convierte un simple video de tu celular en proyecciones de cosecha exactas. Usa Inteligencia Artificial para contar, clasificar y proyectar tu producción de rosas.
        </p>
        <Link to="/web/registro" style={{ background: "#2d5a27", color: "white", padding: "15px 30px", fontSize: "1.2rem", borderRadius: "8px", textDecoration: "none", fontWeight: "bold" }}>
          Comenzar a automatizar mi finca
        </Link>
      </div>

      {/* Características */}
      <div style={{ display: "flex", justifyContent: "center", gap: "30px", padding: "40px", flexWrap: "wrap" }}>
        <FeatureCard 
          icono={
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#2d5a27" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto" }}>
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
              <circle cx="12" cy="13" r="4"></circle>
            </svg>
          } 
          titulo="Captura en Campo" 
          texto="Graba desde tu móvil sin internet. El sistema te guía para la toma perfecta." 
        />
        <FeatureCard 
          icono={
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#2d5a27" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto" }}>
              <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
              <rect x="9" y="9" width="6" height="6"></rect>
              <line x1="9" y1="1" x2="9" y2="4"></line>
              <line x1="15" y1="1" x2="15" y2="4"></line>
              <line x1="9" y1="20" x2="9" y2="23"></line>
              <line x1="15" y1="20" x2="15" y2="23"></line>
              <line x1="20" y1="9" x2="23" y2="9"></line>
              <line x1="20" y1="15" x2="23" y2="15"></line>
              <line x1="1" y1="9" x2="4" y2="9"></line>
              <line x1="1" y1="15" x2="4" y2="15"></line>
            </svg>
          } 
          titulo="Análisis con IA" 
          texto="Detecta estados fenológicos (arroz, garbanzo, estrella) con visión artificial." 
        />
        <FeatureCard 
          icono={
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#2d5a27" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto" }}>
              <line x1="18" y1="20" x2="18" y2="10"></line>
              <line x1="12" y1="20" x2="12" y2="4"></line>
              <line x1="6" y1="20" x2="6" y2="14"></line>
              <path d="M22 4h-6M16 4v6M16 4l6 6"></path>
            </svg>
          } 
          titulo="Proyección Adaptativa" 
          texto="Aprende de tus cosechas para predecir cuándo y cuánto cortar." 
        />
      </div>
    </div>
  );
}

function FeatureCard({ icono, titulo, texto }) {
  return (
    <div style={{ background: "white", padding: "30px", borderRadius: "10px", width: "250px", textAlign: "center", boxShadow: "0 4px 6px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", gap: "10px" }}>
      <div style={{ color: "#2d5a27", display: "flex", justifyContent: "center" }}>{icono}</div>
      <h3 style={{ color: "#2d5a27", margin: "10px 0 5px 0" }}>{titulo}</h3>
      <p style={{ color: "#666", fontSize: "0.9rem", margin: 0 }}>{texto}</p>
    </div>
  );
}
