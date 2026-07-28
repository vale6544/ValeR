import { useState } from "react";
import { Link } from "react-router-dom";

export default function GestionPersonal() {
  const [tipoFormulario, setTipoFormulario] = useState("supervisor");

  // Datos quemados para la maquetación visual
  const [supervisores, setSupervisores] = useState([
    { id: 1, nombre: "Carlos Mendoza", usuario: "carlos.m@finca.com", galpones: "Galpón Norte", cedula: "1724567890", contratacion: "Indefinido", contacto: "0998765432", sueldo: 850, estado: "Activo" },
    { id: 2, nombre: "Ana Torres", usuario: "ana.t@finca.com", galpones: "Galpón Sur", cedula: "1719876543", contratacion: "Indefinido", contacto: "0987654321", sueldo: 850, estado: "Activo" }
  ]);

  const [trabajadores, setTrabajadores] = useState([
    { id: 1, nombre: "Luis Silva", pin: "1234", supervisor: "Carlos Mendoza", asignacion: "Galpón Norte - Camas 1 a 5", cedula: "1718273645", contratacion: "Temporal", contacto: "0967543210", sueldo: 550, estado: "Activo" },
    { id: 2, nombre: "Miguel Rojas", pin: "5678", supervisor: "Ana Torres", asignacion: "Galpón Sur - Camas 1 a 3", cedula: "1715243647", contratacion: "Temporal", contacto: "0976543210", sueldo: 550, estado: "Activo" }
  ]);

  const handleCrearPersonal = (e) => {
    e.preventDefault();
    alert(`Simulación: Guardando nuevo ${tipoFormulario} en la base de datos...`);
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f0f4f0", fontFamily: "sans-serif" }}>
      
      {/* Sidebar Lateral */}
      <div style={{ width: "250px", background: "white", borderRight: "1px solid #e2e8f0", padding: "20px" }}>
        <h3 style={{ color: "#2d5a27", display: "flex", alignItems: "center", gap: "10px", marginBottom: "30px" }}>
          <DashboardIcon /> Admin Panel
        </h3>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, color: "#4a5568", display: "flex", flexDirection: "column", gap: "5px" }}>
          <Link to="/" style={{ textDecoration: "none", color: "#4a5568" }}>
            <li style={{ padding: "10px", cursor: "pointer" }}>📊 Dashboard Producción</li>
          </Link>
          <Link to="/configuracion-finca" style={{ textDecoration: "none", color: "#4a5568" }}>
            <li style={{ padding: "10px", cursor: "pointer" }}>Configuración Finca</li>
          </Link>
          <Link to="/gestion-personal" style={{ textDecoration: "none", color: "#2d5a27" }}>
            <li style={{ padding: "10px", background: "#e5f0e4", borderRadius: "6px", fontWeight: "bold" }}>Gestión de Personal</li>
          </Link>
          <Link to="/demostracion" style={{ textDecoration: "none", color: "#4a5568" }}>
            <li style={{ padding: "10px", cursor: "pointer" }}>Censo Tramos Demo</li>
          </Link>
          <Link to="/membresia" style={{ textDecoration: "none", color: "#4a5568" }}>
            <li style={{ padding: "10px", cursor: "pointer" }}>Facturación / Planes</li>
          </Link>
          <Link to="/login" style={{ textDecoration: "none", color: "#dc2626", marginTop: "20px" }}>
            <li style={{ padding: "10px", cursor: "pointer", fontWeight: "bold" }}>Cerrar Sesión</li>
          </Link>
        </ul>
      </div>

      {/* Contenido Principal */}
      <div style={{ flex: 1, padding: "40px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
          <h2 style={{ color: "#1a2e1a", margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
            <UsersIcon /> Gestión de Personal
          </h2>
        </div>

        <div style={{ display: "flex", gap: "30px" }}>
          
          {/* Formulario de Creación */}
          <div style={{ background: "white", padding: "25px", borderRadius: "10px", flex: "1", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", height: "fit-content" }}>
            
            <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
              <button 
                onClick={() => setTipoFormulario("supervisor")}
                style={{ flex: 1, padding: "10px", fontWeight: "bold", borderRadius: "6px", cursor: "pointer", border: tipoFormulario === "supervisor" ? "none" : "1px solid #cbd5e1", background: tipoFormulario === "supervisor" ? "#2d5a27" : "white", color: tipoFormulario === "supervisor" ? "white" : "#4a5568" }}
              >
                Crear Supervisor
              </button>
              <button 
                onClick={() => setTipoFormulario("trabajador")}
                style={{ flex: 1, padding: "10px", fontWeight: "bold", borderRadius: "6px", cursor: "pointer", border: tipoFormulario === "trabajador" ? "none" : "1px solid #cbd5e1", background: tipoFormulario === "trabajador" ? "#2d5a27" : "white", color: tipoFormulario === "trabajador" ? "white" : "#4a5568" }}
              >
                Crear Trabajador
              </button>
            </div>

            <form onSubmit={handleCrearPersonal} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              
              <div>
                <label style={{ display: "block", marginBottom: "5px", color: "#4a5568", fontWeight: "600", fontSize: "0.9rem" }}>Nombre Completo</label>
                <input type="text" placeholder="Ej: Juan Pérez" style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }} required />
              </div>

              {/* Nuevos Campos Solicitados: Datos Personales, Contacto, Contratación y Sueldo */}
              <div style={{ display: "flex", gap: "15px" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", marginBottom: "5px", color: "#4a5568", fontWeight: "600", fontSize: "0.9rem" }}>Cédula / Identificación</label>
                  <input type="text" placeholder="Ej: 1724567890" style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }} required />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", marginBottom: "5px", color: "#4a5568", fontWeight: "600", fontSize: "0.9rem" }}>Contacto (Teléfono)</label>
                  <input type="tel" placeholder="Ej: 0998765432" style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }} required />
                </div>
              </div>

              <div style={{ display: "flex", gap: "15px" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", marginBottom: "5px", color: "#4a5568", fontWeight: "600", fontSize: "0.9rem" }}>Tipo de Contratación</label>
                  <select style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }} required>
                    <option value="Indefinido">Indefinido</option>
                    <option value="Temporal">Temporal</option>
                    <option value="Servicios Prestados">Servicios Prestados</option>
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", marginBottom: "5px", color: "#4a5568", fontWeight: "600", fontSize: "0.9rem" }}>Sueldo Mensual ($)</label>
                  <input type="number" placeholder="Ej: 850" style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }} required />
                </div>
              </div>

              {tipoFormulario === "supervisor" ? (
                <>
                  <div>
                    <label style={{ display: "block", marginBottom: "5px", color: "#4a5568", fontWeight: "600", fontSize: "0.9rem" }}>Galpones Asignados</label>
                    <select style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }} required>
                      <option value="">Seleccione un galpón...</option>
                      <option value="norte">Galpón Norte</option>
                      <option value="sur">Galpón Sur</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "5px", color: "#4a5568", fontWeight: "600", fontSize: "0.9rem" }}>Usuario (Correo)</label>
                    <input type="email" placeholder="usuario@finca.com" style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }} required />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "5px", color: "#4a5568", fontWeight: "600", fontSize: "0.9rem" }}>Contraseña Web</label>
                    <input type="password" style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }} required />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label style={{ display: "block", marginBottom: "5px", color: "#4a5568", fontWeight: "600", fontSize: "0.9rem" }}>Supervisor a Cargo</label>
                    <select style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }} required>
                      <option value="">Seleccione un supervisor...</option>
                      <option value="1">Carlos Mendoza</option>
                      <option value="2">Ana Torres</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "5px", color: "#4a5568", fontWeight: "600", fontSize: "0.9rem" }}>Responsabilidad (Galpón / Camas)</label>
                    <select style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }} required>
                      <option value="">Seleccione asignación...</option>
                      <option value="1">Galpón Norte - Camas 1 a 5</option>
                      <option value="2">Galpón Sur - Camas 1 a 3</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "5px", color: "#4a5568", fontWeight: "600", fontSize: "0.9rem" }}>PIN de Acceso Móvil (4 dígitos)</label>
                    <input type="text" maxLength="4" placeholder="Ej: 1234" style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }} required />
                    <small style={{ color: "#666", display: "block", marginTop: "5px" }}>Con este PIN el trabajador ingresará a la app móvil offline.</small>
                  </div>
                </>
              )}

              <button type="submit" style={{ background: "#2d5a27", color: "white", padding: "12px", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", marginTop: "10px", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }}>
                <UserPlusIcon /> Guardar {tipoFormulario === "supervisor" ? "Supervisor" : "Trabajador"}
              </button>
            </form>
          </div>

          {/* Listas de Personal */}
          <div style={{ flex: "2", display: "flex", flexDirection: "column", gap: "25px" }}>
            
            <div>
              <h3 style={{ color: "#1a2e1a", marginBottom: "15px", borderBottom: "2px solid #e2e8f0", paddingBottom: "10px" }}>Supervisores Registrados (Acceso Web)</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {supervisores.map((sup) => (
                  <div key={sup.id} style={{ background: "white", padding: "15px", borderRadius: "8px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center", borderLeft: "4px solid #2d5a27" }}>
                    <div>
                      <h4 style={{ margin: "0 0 5px 0", color: "#1a2e1a", display: "flex", alignItems: "center", gap: "8px" }}>
                        {sup.nombre}
                        <span style={{ fontSize: "0.7rem", background: sup.estado === "Activo" ? "#d1fae5" : "#fee2e2", color: sup.estado === "Activo" ? "#065f46" : "#991b1b", padding: "2px 6px", borderRadius: "4px", fontWeight: "bold" }}>
                          {sup.estado}
                        </span>
                      </h4>
                      <p style={{ margin: 0, fontSize: "0.85rem", color: "#555" }}>Usuario: {sup.usuario} | Asignación: {sup.galpones}</p>
                      <p style={{ margin: "5px 0 0 0", fontSize: "0.8rem", color: "#666" }}>
                        Cédula: <strong>{sup.cedula}</strong> | Contrato: <strong>{sup.contratacion}</strong> | Sueldo: <strong>${sup.sueldo}</strong> | Telf: <strong>{sup.contacto}</strong>
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button 
                        onClick={() => alert(`Editar supervisor: ${sup.nombre}`)}
                        style={{ background: "white", border: "1px solid #cbd5e1", borderRadius: "4px", padding: "4px 8px", fontSize: "0.75rem", cursor: "pointer", color: "#475569", fontWeight: "bold" }}
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => {
                          const nuevoEstado = sup.estado === "Activo" ? "Suspendido" : "Activo";
                          setSupervisores(supervisores.map(s => s.id === sup.id ? { ...s, estado: nuevoEstado } : s));
                        }}
                        style={{ 
                          background: "white", 
                          border: sup.estado === "Activo" ? "1px solid #d97706" : "1px solid #10b981", 
                          borderRadius: "4px", padding: "4px 8px", fontSize: "0.75rem", cursor: "pointer", 
                          color: sup.estado === "Activo" ? "#d97706" : "#10b981", fontWeight: "bold"
                        }}
                      >
                        {sup.estado === "Activo" ? "Suspender" : "Activar"}
                      </button>
                      <button 
                        onClick={() => {
                          if (confirm(`¿Seguro que deseas eliminar a ${sup.nombre}?`)) {
                            setSupervisores(supervisores.filter(s => s.id !== sup.id));
                          }
                        }}
                        style={{ background: "white", border: "1px solid #ef4444", borderRadius: "4px", padding: "4px 8px", fontSize: "0.75rem", cursor: "pointer", color: "#ef4444", fontWeight: "bold" }}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 style={{ color: "#1a2e1a", marginBottom: "15px", borderBottom: "2px solid #e2e8f0", paddingBottom: "10px" }}>Trabajadores / Operadores (Acceso Móvil)</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {trabajadores.map((trab) => (
                  <div key={trab.id} style={{ background: "white", padding: "15px", borderRadius: "8px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center", borderLeft: "4px solid #3b82f6" }}>
                    <div>
                      <h4 style={{ margin: "0 0 5px 0", color: "#1a2e1a", display: "flex", alignItems: "center", gap: "8px" }}>
                        {trab.nombre}
                        <span style={{ fontSize: "0.7rem", background: trab.estado === "Activo" ? "#d1fae5" : "#fee2e2", color: trab.estado === "Activo" ? "#065f46" : "#991b1b", padding: "2px 6px", borderRadius: "4px", fontWeight: "bold" }}>
                          {trab.estado}
                        </span>
                      </h4>
                      <p style={{ margin: 0, fontSize: "0.85rem", color: "#555" }}>Supervisor: {trab.supervisor} | Camas: {trab.asignacion}</p>
                      <p style={{ margin: "5px 0 0 0", fontSize: "0.8rem", color: "#666" }}>
                        Cédula: <strong>{trab.cedula}</strong> | Contrato: <strong>{trab.contratacion}</strong> | Sueldo: <strong>${trab.sueldo}</strong> | Telf: <strong>{trab.contacto}</strong>
                      </p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ background: "#eff6ff", color: "#1e3a8a", padding: "5px 10px", borderRadius: "4px", fontSize: "0.85rem", fontWeight: "bold" }}>
                        PIN: {trab.pin}
                      </div>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button 
                          onClick={() => alert(`Editar trabajador: ${trab.nombre}`)}
                          style={{ background: "white", border: "1px solid #cbd5e1", borderRadius: "4px", padding: "4px 8px", fontSize: "0.75rem", cursor: "pointer", color: "#475569", fontWeight: "bold" }}
                        >
                          Editar
                        </button>
                        <button 
                          onClick={() => {
                            const nuevoEstado = trab.estado === "Activo" ? "Suspendido" : "Activo";
                            setTrabajadores(trabajadores.map(t => t.id === trab.id ? { ...t, estado: nuevoEstado } : t));
                          }}
                          style={{ 
                            background: "white", 
                            border: trab.estado === "Activo" ? "1px solid #d97706" : "1px solid #10b981", 
                            borderRadius: "4px", padding: "4px 8px", fontSize: "0.75rem", cursor: "pointer", 
                            color: trab.estado === "Activo" ? "#d97706" : "#10b981", fontWeight: "bold"
                          }}
                        >
                          {trab.estado === "Activo" ? "Suspender" : "Activar"}
                        </button>
                        <button 
                          onClick={() => {
                            if (confirm(`¿Seguro que deseas eliminar a ${trab.nombre}?`)) {
                              setTrabajadores(trabajadores.filter(t => t.id !== trab.id));
                            }
                          }}
                          style={{ background: "white", border: "1px solid #ef4444", borderRadius: "4px", padding: "4px 8px", fontSize: "0.75rem", cursor: "pointer", color: "#ef4444", fontWeight: "bold" }}
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

// Íconos SVG puros
function DashboardIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9"></rect>
      <rect x="14" y="3" width="7" height="5"></rect>
      <rect x="14" y="12" width="7" height="9"></rect>
      <rect x="3" y="16" width="7" height="5"></rect>
    </svg>
  );
}

// Icons
function UsersIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
  );
}

// Icons
function UserPlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
      <circle cx="8.5" cy="7" r="4"></circle>
      <line x1="20" y1="8" x2="20" y2="14"></line>
      <line x1="23" y1="11" x2="17" y2="11"></line>
    </svg>
  );
}
