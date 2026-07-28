import { Link, useNavigate } from "react-router-dom";

export default function LoginWeb() {
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // Redirige al panel de configuración de la finca
    navigate("/configuracion-finca");
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f4f6f4", fontFamily: "sans-serif", position: "relative" }}>
      
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

      <div style={{ background: "white", padding: "40px", borderRadius: "12px", boxShadow: "0 4px 15px rgba(0,0,0,0.1)", width: "100%", maxWidth: "400px" }}>
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <h2 style={{ color: "#2d5a27", margin: "0 0 10px 0" }}>Rosas Monitor</h2>
          <p style={{ color: "#666", margin: 0 }}>Ingresa a tu cuenta gerencial</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "5px", color: "#1a2e1a", fontWeight: "600" }}>Usuario / Correo</label>
            <input type="text" placeholder="admin@finca.com" style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #aac9a0", boxSizing: "border-box" }} required />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "5px", color: "#1a2e1a", fontWeight: "600" }}>Contraseña</label>
            <input type="password" placeholder="••••••••" style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #aac9a0", boxSizing: "border-box" }} required />
          </div>
          
          <button type="submit" style={{ background: "#2d5a27", color: "white", padding: "12px", border: "none", borderRadius: "6px", fontSize: "1rem", fontWeight: "bold", cursor: "pointer", marginTop: "10px" }}>
            Ingresar
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "20px", color: "#666", fontSize: "0.9rem" }}>
          ¿No tienes una cuenta? <Link to="/web/registro" style={{ color: "#2d5a27", fontWeight: "bold", textDecoration: "none" }}>Regístrate aquí</Link>
        </p>
      </div>
    </div>
  );
}
