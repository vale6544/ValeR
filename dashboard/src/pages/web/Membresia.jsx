import { useNavigate } from "react-router-dom";

export default function Membresia() {
  const navigate = useNavigate();

  const handleSeleccionPlan = (e) => {
    e.preventDefault();
    // Simula el pago y redirige al panel de configuración de la finca
    navigate("/configuracion-finca");
  };

  return (
    <div style={{ minHeight: "100vh", padding: "40px 20px", background: "#f0f4f0", fontFamily: "sans-serif" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h2 style={{ color: "#2d5a27", fontSize: "2.2rem", margin: "0 0 10px 0" }}>Selecciona tu Plan</h2>
          <p style={{ color: "#666", fontSize: "1.1rem" }}>Comienza tu prueba de 14 días. Cancela en cualquier momento.</p>
        </div>

        <div style={{ display: "flex", gap: "25px", justifyContent: "center", flexWrap: "wrap" }}>
          
          {/* Plan Móvil */}
          <div style={{ background: "white", padding: "30px", borderRadius: "12px", width: "300px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)" }}>
            <h3 style={{ color: "#1a2e1a", fontSize: "1.5rem", margin: "0 0 10px 0" }}>Plan Móvil</h3>
            <p style={{ fontSize: "2rem", color: "#2d5a27", fontWeight: "bold", margin: "0 0 20px 0" }}>$50<span style={{ fontSize: "1rem", color: "#666" }}>/mes</span></p>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 30px 0", color: "#4a5568", lineHeight: "1.8" }}>
              <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <CheckIcon /> Hasta 5 camas
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <CheckIcon /> Uso de App Móvil (Trabajadores)
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <CheckIcon /> Análisis con Claude Vision
              </li>
            </ul>
            <button onClick={handleSeleccionPlan} style={{ width: "100%", padding: "12px", background: "white", color: "#2d5a27", border: "2px solid #2d5a27", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}>
              Elegir Plan
            </button>
          </div>

          {/* Plan Semi-automático (Destacado) */}
          <div style={{ background: "#2d5a27", padding: "30px", borderRadius: "12px", width: "320px", boxShadow: "0 8px 20px rgba(45,90,39,0.3)", transform: "scale(1.05)" }}>
            <div style={{ background: "#e5f0e4", color: "#2d5a27", fontSize: "0.8rem", fontWeight: "bold", padding: "4px 10px", borderRadius: "20px", display: "inline-block", marginBottom: "10px" }}>MÁS POPULAR</div>
            <h3 style={{ color: "white", fontSize: "1.5rem", margin: "0 0 10px 0" }}>Plan Profesional</h3>
            <p style={{ fontSize: "2rem", color: "white", fontWeight: "bold", margin: "0 0 20px 0" }}>$150<span style={{ fontSize: "1rem", color: "#aac9a0" }}>/mes</span></p>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 30px 0", color: "white", lineHeight: "1.8" }}>
              <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <CheckIcon color="white" /> Hasta 20 camas
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <CheckIcon color="white" /> Entrenamiento de IA Propia
              </li>
              <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <CheckIcon color="white" /> Reportes PDF Avanzados
              </li>
            </ul>
            <button onClick={handleSeleccionPlan} style={{ width: "100%", padding: "12px", background: "white", color: "#2d5a27", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", fontSize: "1.1rem" }}>
              Elegir Plan
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

// Componente SVG reutilizable para el visto bueno
function CheckIcon({ color = "#2d5a27" }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  );
}
