import { useState } from "react";
import { BottomNav } from "./MisCamas";

export default function Cosechas() {
  const [guardado, setGuardado] = useState(false);

  const handleGuardar = (e) => {
    e.preventDefault();
    setGuardado(true);
    setTimeout(() => setGuardado(false), 3000);
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f0f4f0", fontFamily: "sans-serif", paddingBottom: "80px" }}>
      <div style={{ background: "#2d5a27", color: "white", padding: "20px", textAlign: "center" }}>
        <h2 style={{ margin: 0, fontSize: "1.2rem" }}>Registro de Cosecha</h2>
      </div>

      <div style={{ padding: "20px" }}>
        <div style={{ background: "white", padding: "20px", borderRadius: "12px" }}>
          {guardado && <div style={{ background: "#d1fae5", color: "#065f46", padding: "10px", borderRadius: "8px", marginBottom: "15px", textAlign: "center", fontWeight: "bold" }}>¡Cosecha Registrada!</div>}
          
          <form onSubmit={handleGuardar} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <div>
              <label style={{ display: "block", color: "#1a2e1a", fontWeight: "bold", marginBottom: "5px" }}>Cama Podada</label>
              <select style={{ width: "100%", padding: "15px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "1rem", background: "white" }} required>
                <option value="">Seleccione una cama...</option>
                <option value="1">Cama 1 - Galpón Norte</option>
                <option value="2">Cama 2 - Galpón Norte</option>
              </select>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", color: "#10b981", fontWeight: "bold", marginBottom: "5px" }}>T. Largos</label>
                <input type="number" min="0" placeholder="0" style={{ width: "100%", padding: "15px", borderRadius: "8px", border: "2px solid #10b981", fontSize: "1.2rem", textAlign: "center", boxSizing: "border-box" }} required />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", color: "#3b82f6", fontWeight: "bold", marginBottom: "5px" }}>T. Medios</label>
                <input type="number" min="0" placeholder="0" style={{ width: "100%", padding: "15px", borderRadius: "8px", border: "2px solid #3b82f6", fontSize: "1.2rem", textAlign: "center", boxSizing: "border-box" }} required />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", color: "#f59e0b", fontWeight: "bold", marginBottom: "5px" }}>T. Cortos</label>
                <input type="number" min="0" placeholder="0" style={{ width: "100%", padding: "15px", borderRadius: "8px", border: "2px solid #f59e0b", fontSize: "1.2rem", textAlign: "center", boxSizing: "border-box" }} required />
              </div>
            </div>

            <div>
              <label style={{ display: "block", color: "#1a2e1a", fontWeight: "bold", marginBottom: "5px" }}>Observaciones (Opcional)</label>
              <textarea rows="2" style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "1rem", boxSizing: "border-box", resize: "none" }}></textarea>
            </div>

            <button type="submit" style={{ width: "100%", padding: "15px", background: "#2d5a27", color: "white", border: "none", borderRadius: "8px", fontSize: "1.2rem", fontWeight: "bold", marginTop: "10px" }}>
              Guardar Cosecha
            </button>
          </form>
        </div>
      </div>
      <BottomNav active="cosechas" />
    </div>
  );
}
