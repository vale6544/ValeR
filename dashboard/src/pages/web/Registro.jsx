import { Link, useNavigate } from "react-router-dom";

export default function Registro() {
  const navigate = useNavigate();

  const handleRegistro = (e) => {
    e.preventDefault();
    navigate("/membresia");
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f4f6f4", fontFamily: "sans-serif", position: "relative", padding: "20px", boxSizing: "border-box" }}>
      
      {/* Botón de retorno */}
      <Link 
        to="/landing" 
        style={{ 
          position: "absolute", 
          top: "25px", 
          left: "25px", 
          textDecoration: "none", 
          color: "#4a5568", 
          fontSize: "0.9rem", 
          fontWeight: "bold", 
          display: "flex", 
          alignItems: "center", 
          gap: "8px", 
          background: "white", 
          padding: "8px 16px", 
          borderRadius: "8px", 
          border: "1px solid #cbd5e1",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        Volver al Inicio
      </Link>

      <div style={{ background: "white", padding: "30px 40px", borderRadius: "12px", boxShadow: "0 4px 15px rgba(0,0,0,0.1)", width: "100%", maxWidth: "600px", boxSizing: "border-box" }}>
        
        <h2 style={{ color: "#2d5a27", textAlign: "center", marginBottom: "20px", marginTop: 0 }}>Crea tu cuenta empresarial</h2>
        
        <form onSubmit={handleRegistro} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 15px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "3px", color: "#1a2e1a", fontWeight: "600", fontSize: "0.82rem" }}>Nombre de Finca/Empresa</label>
            <input type="text" style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid #aac9a0", boxSizing: "border-box" }} required />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "3px", color: "#1a2e1a", fontWeight: "600", fontSize: "0.82rem" }}>País</label>
            <select style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid #aac9a0", boxSizing: "border-box" }} required>
              <option value="">Selecciona...</option>
              <option value="EC">Ecuador</option>
              <option value="CO">Colombia</option>
              <option value="OT">Otro</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "3px", color: "#1a2e1a", fontWeight: "600", fontSize: "0.82rem" }}>RUC / Identificación Fiscal</label>
            <input type="text" placeholder="Ej: 1792345678001" style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid #aac9a0", boxSizing: "border-box" }} required />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "3px", color: "#1a2e1a", fontWeight: "600", fontSize: "0.82rem" }}>Dirección</label>
            <input type="text" placeholder="Ej: Vía Cayambe Km 5" style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid #aac9a0", boxSizing: "border-box" }} required />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "3px", color: "#1a2e1a", fontWeight: "600", fontSize: "0.82rem" }}>Tu Nombre</label>
            <input type="text" style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid #aac9a0", boxSizing: "border-box" }} required />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "3px", color: "#1a2e1a", fontWeight: "600", fontSize: "0.82rem" }}>Teléfono</label>
            <input type="tel" style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid #aac9a0", boxSizing: "border-box" }} required />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "3px", color: "#1a2e1a", fontWeight: "600", fontSize: "0.82rem" }}>Correo (Administrador)</label>
            <input type="email" style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid #aac9a0", boxSizing: "border-box" }} required />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "3px", color: "#1a2e1a", fontWeight: "600", fontSize: "0.82rem" }}>Contraseña</label>
            <input type="password" placeholder="••••••••" style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid #aac9a0", boxSizing: "border-box" }} required />
          </div>
          
          <button type="submit" style={{ gridColumn: "1 / -1", background: "#2d5a27", color: "white", padding: "12px", border: "none", borderRadius: "6px", fontSize: "1rem", fontWeight: "bold", cursor: "pointer", marginTop: "8px" }}>
            Registrar Finca y Continuar
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "15px", color: "#666", fontSize: "0.85rem", marginBottom: 0 }}>
          ¿Ya tienes cuenta? <Link to="/login" style={{ color: "#2d5a27", fontWeight: "bold", textDecoration: "none" }}>Inicia Sesión</Link>
        </p>
      </div>
    </div>
  );
}
