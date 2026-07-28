import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginMovil() {
  const navigate = useNavigate();
  const [pin, setPin] = useState("");

  const handleSumbit = (e) => {
    e.preventDefault();
    // Simula el acceso
    navigate("/movil/mis-camas");
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", background: "#f0f4f0", fontFamily: "sans-serif", padding: "20px" }}>
      <div style={{ background: "white", padding: "40px 30px", borderRadius: "16px", boxShadow: "0 10px 25px rgba(0,0,0,0.1)", width: "100%", maxWidth: "350px", textAlign: "center" }}>
        
        <div style={{ background: "#e5f0e4", width: "80px", height: "80px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          <LockIcon />
        </div>
        
        <h2 style={{ color: "#2d5a27", marginBottom: "10px" }}>Acceso Operador</h2>
        <p style={{ color: "#666", marginBottom: "30px", fontSize: "0.9rem" }}>Ingresa tu PIN de 4 dígitos asignado</p>

        <form onSubmit={handleSumbit}>
          <input 
            type="password" 
            maxLength="4" 
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            style={{ width: "100%", padding: "15px", fontSize: "2rem", textAlign: "center", letterSpacing: "10px", borderRadius: "10px", border: "2px solid #aac9a0", marginBottom: "20px", boxSizing: "border-box" }} 
            placeholder="••••"
            required 
          />
          <button type="submit" style={{ width: "100%", padding: "15px", background: "#2d5a27", color: "white", border: "none", borderRadius: "10px", fontSize: "1.2rem", fontWeight: "bold" }}>
            Entrar a Campo
          </button>
        </form>
      </div>
    </div>
  );
}

function LockIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2d5a27" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
  );
}
