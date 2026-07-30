import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function MovilPreview() {
  // Estado de sesión
  const [sesionIniciada, setSesionIniciada] = useState(false);
  const [nombreUsuario, setNombreUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [errorLogin, setErrorLogin] = useState("");
  const [cargandoLogin, setCargandoLogin] = useState(false);
  const [operarioActivo, setOperarioActivo] = useState({ nombre: "Luis Silva", rol: "Trabajador", pin: "1234" });

  // Rol de la vista del simulador móvil
  const [rolMovil, setRolMovil] = useState("trabajador"); // 'trabajador', 'encargado', 'admin'

  // Configuración de API
  const [apiUrl, setApiUrl] = useState(import.meta.env.VITE_API_URL || "http://192.168.137.1:8000");

  // Al cambiar el rol exterior, sincronizamos el usuario ficticio de sesión para darle realismo
  useEffect(() => {
    if (rolMovil === "trabajador") {
      setOperarioActivo({ nombre: "Luis Silva", rol: "Trabajador de Campo", pin: "1234" });
      setTabMovil("camara");
    } else if (rolMovil === "encargado") {
      setOperarioActivo({ nombre: "Carlos Mendoza", rol: "Supervisor de Finca", pin: "5678" });
      setTabMovil("camara");
    } else if (rolMovil === "admin") {
      setOperarioActivo({ nombre: "Ing. Alberto Herrera", rol: "Administrador General", pin: "0000" });
      setTabMovil("dashboard");
    }
  }, [rolMovil]);

  const handleLoginMovil = (e) => {
    e.preventDefault();
    setCargandoLogin(true);
    setErrorLogin("");
    setTimeout(() => {
      if (contrasena === "1234") {
        setRolMovil("trabajador");
        setOperarioActivo({ nombre: "Luis Silva", rol: "Trabajador de Campo", pin: "1234" });
        setTabMovil("camara");
        setSesionIniciada(true);
      } else if (contrasena === "5678") {
        setRolMovil("encargado");
        setOperarioActivo({ nombre: "Carlos Mendoza", rol: "Supervisor de Finca", pin: "5678" });
        setTabMovil("camara");
        setSesionIniciada(true);
      } else if (contrasena === "0000") {
        setRolMovil("admin");
        setOperarioActivo({ nombre: "Ing. Alberto Herrera", rol: "Administrador General", pin: "0000" });
        setTabMovil("dashboard");
        setSesionIniciada(true);
      } else if (contrasena.trim().length >= 4) {
        setOperarioActivo({ nombre: nombreUsuario || "Operador Demo", rol: "Trabajador de Campo", pin: contrasena });
        setTabMovil("camara");
        setSesionIniciada(true);
      } else {
        setErrorLogin("PIN incorrecto. Usa 1234 (Luis), 5678 (Carlos) o 0000 (Alberto).");
      }
      setCargandoLogin(false);
    }, 1000);
  };

  // Navegación móvil
  const [tabMovil, setTabMovil] = useState("camara"); // 'camara', 'registros', 'sync', 'sanidad', 'ajustes' para trabajadores. 'dashboard', 'usuarios', 'inquilino' para admin.
  const [subTabRegistros, setSubTabRegistros] = useState("cosecha"); // 'cosecha', 'poda', 'riego'
  const [wifiDetectado, setWifiDetectado] = useState(false);

  // Estados de censo de video
  const [camaCaptura, setCamaCaptura] = useState("Cama 1-1");
  const [ladoActivoCamara, setLadoActivoCamara] = useState("A");
  const [mostrarCamaraViewfinder, setMostrarCamaraViewfinder] = useState(false);
  const [videoAGrabado, setVideoAGrabado] = useState(false);
  const [videoBGrabado, setVideoBGrabado] = useState(false);

  // Grabación activa
  const [grabando, setGrabando] = useState(false);
  const [progresoGrabacion, setProgresoGrabacion] = useState(0);
  const [anguloCorrecto, setAnguloCorrecto] = useState(true);
  const [alertaVelocidad, setAlertaVelocidad] = useState(false);
  
  // Estados de formularios
  const [tallosLargos, setTallosLargos] = useState("");
  const [tallosMedios, setTallosMedios] = useState("");
  const [tallosCortos, setTallosCortos] = useState("");
  const [obsCosecha, setObsCosecha] = useState("");
  
  const [camaPoda, setCamaPoda] = useState("Cama 1-1");
  const [tipoPoda, setTipoPoda] = useState("Limpieza");
  const [tallosPodados, setTallosPodados] = useState("");
  const [notasPoda, setNotasPoda] = useState("");
  
  const [camaRiego, setCamaRiego] = useState("Cama 1-1");
  const [metodoRiego, setMetodoRiego] = useState("Goteo");
  const [cantidadRiego, setCantidadRiego] = useState("");
  
  const [camaSanidad, setCamaSanidad] = useState("Cama 1-1");
  const [plagaSanidad, setPlagaSanidad] = useState("");
  const [severidadSanidad, setSeveridadSanidad] = useState("");
  const [fotoEvidencia, setFotoEvidencia] = useState(null);
  const [obsSanidad, setObsSanidad] = useState("");
  
  const [mostrarGuia, setMostrarGuia] = useState(false);
  const [plagaExpandida, setPlagaExpandida] = useState(null);

  // Cola local de datos
  const [colaLocal, setColaLocal] = useState([
    { id: 1, tipo: "Censo Cama Completa", cama: "Cama 1-2", detalles: "Lado A + Lado B (Consolidado)", peso: "26.5 MB", estado: "pendiente" },
    { id: 2, tipo: "Reporte Fitosanitario", cama: "Cama 2-3", detalles: "Araña Roja (Severidad Alta)", peso: "1.2 MB", estado: "pendiente" }
  ]);

  // Estados de Configuración de Inquilino en el Móvil (Para Rol Admin)
  const [nombreEmpresaMovil, setNombreEmpresaMovil] = useState("BellaRosa S.A.");
  const [rfcEmpresaMovil, setRfcEmpresaMovil] = useState("1792348574001");
  const [ivaEmpresaMovil, setIvaEmpresaMovil] = useState("15");
  const [metodoPagoMovil, setMetodoPagoMovil] = useState("tarjeta");
  const [logoEmpresaMovil, setLogoEmpresaMovil] = useState("logo_predeterminado.png");
  const [inviteEmailMovil, setInviteEmailMovil] = useState("");
  const [inviteRoleMovil, setInviteRoleMovil] = useState("supervisor");
  const [usuariosMovil, setUsuariosMovil] = useState([
    { id: 1, email: "carlos.mendoza@bellarosa.com", rol: "Supervisor", permisos: ["Censo", "Riego", "Sanidad"], estado: "Activo" },
    { id: 2, email: "luis.silva@bellarosa.com", rol: "Trabajador", permisos: ["Censo", "Sanidad"], estado: "Activo" },
    { id: 3, email: "miguel.rojas@bellarosa.com", rol: "Trabajador", permisos: ["Censo"], estado: "Activo" }
  ]);

  // Modales de Accesos Rápidos (Para Rol Admin)
  const [modalInvernaderos, setModalInvernaderos] = useState(false);
  const [modalAlertas, setModalAlertas] = useState(false);
  const [modalReporte, setModalReporte] = useState(false);
  
  // Ajustes de Integración y API
  const [integracionERP, setIntegracionERP] = useState(false);
  const [tokenCopiado, setTokenCopiado] = useState(false);
  const [auditLogs] = useState([
    { id: 1, fecha: "14:20", operario: "Luis Silva", accion: "Censo Cama 1-1" },
    { id: 2, fecha: "13:45", operario: "Carlos Mendoza", accion: "Riego Galpón Norte" },
    { id: 3, fecha: "11:15", operario: "Miguel Rojas", accion: "Reporte Trips Cama 1-2" }
  ]);

  // Sensores de cámara
  useEffect(() => {
    let intervalSensors;
    if (grabando) {
      intervalSensors = setInterval(() => {
        setAnguloCorrecto(Math.random() > 0.22);
        setAlertaVelocidad(Math.random() > 0.85);
        setProgresoGrabacion((prev) => {
          if (prev >= 100) {
            clearInterval(intervalSensors);
            setGrabando(false);
            setMostrarCamaraViewfinder(false);
            if (ladoActivoCamara === "A") {
              setVideoAGrabado(true);
              alert("Lado A grabado en memoria temporal.");
            } else {
              setVideoBGrabado(true);
              alert("Lado B grabado en memoria temporal.");
            }
            return 100;
          }
          return prev + 10;
        });
      }, 250);
    }
    return () => clearInterval(intervalSensors);
  }, [grabando, ladoActivoCamara]);

  const procesarCensoCamaCompleta = () => {
    if (!videoAGrabado || !videoBGrabado) {
      alert("Faltan videos. Registra Lado A y Lado B.");
      return;
    }
    const nuevoCenso = {
      id: Date.now(),
      tipo: "Censo Cama Completa",
      cama: camaCaptura,
      detalles: "Lado A + Lado B (Consolidado)",
      peso: "25.8 MB",
      estado: "pendiente"
    };
    setColaLocal([...colaLocal, nuevoCenso]);
    alert(`Censo consolidado de ${camaCaptura} guardado en la cola local.`);
    setVideoAGrabado(false);
    setVideoBGrabado(false);
  };

  // Sincronización
  const [subiendo, setSubiendo] = useState(false);
  const [progresoSubida, setProgresoSubida] = useState(0);

  const iniciarSincronizacion = () => {
    if (colaLocal.filter(x => x.estado === "pendiente").length === 0) {
      alert("No hay archivos pendientes.");
      return;
    }
    setSubiendo(true);
    setProgresoSubida(0);
  };

  useEffect(() => {
    let intervalSync;
    if (subiendo) {
      intervalSync = setInterval(() => {
        setProgresoSubida((prev) => {
          if (prev >= 100) {
            clearInterval(intervalSync);
            setSubiendo(false);
            setColaLocal(colaLocal.map(x => ({ ...x, estado: "sincronizado" })));
            alert("Sincronización completa con el servidor central.");
            return 100;
          }
          return prev + 10;
        });
      }, 250);
    }
    return () => clearInterval(intervalSync);
  }, [subiendo, colaLocal]);

  // Form handlers
  const guardarCosechaLocal = (e) => {
    e.preventDefault();
    const total = (parseInt(tallosLargos) || 0) + (parseInt(tallosMedios) || 0) + (parseInt(tallosCortos) || 0);
    if (total === 0) {
      alert("Debes registrar al menos 1 tallo.");
      return;
    }
    const nuevoRegistro = {
      id: Date.now(),
      tipo: "Registro de Cosecha",
      cama: camaCaptura,
      detalles: `Largos: ${tallosLargos || 0}, Medios: ${tallosMedios || 0}, Cortos: ${tallosCortos || 0}`,
      peso: "0.2 MB",
      estado: "pendiente"
    };
    setColaLocal([...colaLocal, nuevoRegistro]);
    alert("Cosecha guardada offline.");
    setTallosLargos("");
    setTallosMedios("");
    setTallosCortos("");
    setObsCosecha("");
  };

  const guardarPodaLocal = (e) => {
    e.preventDefault();
    const nuevoRegistro = {
      id: Date.now(),
      tipo: "Registro de Poda",
      cama: camaPoda,
      detalles: `${tipoPoda} - ${tallosPodados || 0} tallos deseados`,
      peso: "0.2 MB",
      estado: "pendiente"
    };
    setColaLocal([...colaLocal, nuevoRegistro]);
    alert("Poda guardada offline.");
    setTallosPodados("");
    setNotasPoda("");
  };

  const guardarRiegoLocal = (e) => {
    e.preventDefault();
    const nuevoRegistro = {
      id: Date.now(),
      tipo: "Registro de Riego",
      cama: camaRiego,
      detalles: `${metodoRiego} - ${cantidadRiego || 0} m³ aplicados`,
      peso: "0.1 MB",
      estado: "pendiente"
    };
    setColaLocal([...colaLocal, nuevoRegistro]);
    alert("Riego guardado offline.");
    setCantidadRiego("");
  };

  const guardarSanidadLocal = (e) => {
    e.preventDefault();
    if (!plagaSanidad || !severidadSanidad) {
      alert("Por favor completa los campos obligatorios.");
      return;
    }
    const nuevoRegistro = {
      id: Date.now(),
      tipo: "Reporte Fitosanitario",
      cama: camaSanidad,
      detalles: `Plaga: ${plagaSanidad} | Severidad: ${severidadSanidad}`,
      peso: fotoEvidencia ? "1.5 MB" : "0.3 MB",
      estado: "pendiente"
    };
    setColaLocal([...colaLocal, nuevoRegistro]);
    alert("Reporte de sanidad guardado offline.");
    setPlagaSanidad("");
    setSeveridadSanidad("");
    setFotoEvidencia(null);
    setObsSanidad("");
  };

  const plagasData = [
    { id: "trips", nombre: "Trips (Frankliniella)", sintomas: "Plateado en pétalos y brotes.", clima: "Seco y cálido (>24°C)" },
    { id: "araña", nombre: "Araña Roja (Tetranychus)", sintomas: "Puntos amarillos en el haz y telarañas.", clima: "Humedad baja (<50%)" },
    { id: "pulgon", nombre: "Pulgón (Macrosiphum)", sintomas: "Deformación del botón floral y melaza.", clima: "Templado y húmedo" },
    { id: "botrytis", nombre: "Moho Gris (Botrytis)", sintomas: "Pudrición blanda y vello grisáceo.", clima: "Humedad alta (>90%)" }
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f4f6f4", display: "flex", fontFamily: "sans-serif" }}>
      
      {/* =======================================
          COLUMNA IZQUIERDA: PANEL DE CONTROL
          ======================================= */}
      <div style={{ width: "360px", background: "white", padding: "30px", borderRight: "1px solid #cbd5e1", display: "flex", flexDirection: "column", justifyContent: "space-between", boxSizing: "border-box" }}>
        <div>
          <h2 style={{ color: "#2d5a27", marginTop: 0, fontSize: "1.5rem", fontWeight: "bold" }}>Simulador Móvil</h2>
          <p style={{ color: "#4a5568", fontSize: "0.9rem", lineHeight: "1.6", margin: "10px 0 25px 0" }}>
            Prueba cómo interactúan los diferentes roles de la hacienda en la aplicación móvil **Offline-First**.
          </p>

          {/* Selector de Perfiles/Roles Móviles */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "25px" }}>
            <span style={{ fontSize: "0.75rem", color: "#9ca3af", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "1px" }}>Vista del Teléfono</span>
            
            <button 
              onClick={() => setRolMovil("trabajador")}
              style={{
                display: "flex", flexDirection: "column", gap: "3px", padding: "12px", borderRadius: "10px", border: rolMovil === "trabajador" ? "2px solid #2d5a27" : "1px solid #cbd5e1",
                background: rolMovil === "trabajador" ? "#e5f0e4" : "white", color: "#1a2e1a", cursor: "pointer", textAlign: "left", transition: "all 0.2s"
              }}
            >
              <strong style={{ fontSize: "0.85rem" }}>Trabajador de Campo</strong>
              <span style={{ fontSize: "0.7rem", color: "#475569" }}>Captura de videos A/B, cosechas, podas y sanidad offline.</span>
            </button>

            <button 
              onClick={() => setRolMovil("encargado")}
              style={{
                display: "flex", flexDirection: "column", gap: "3px", padding: "12px", borderRadius: "10px", border: rolMovil === "encargado" ? "2px solid #2d5a27" : "1px solid #cbd5e1",
                background: rolMovil === "encargado" ? "#e5f0e4" : "white", color: "#1a2e1a", cursor: "pointer", textAlign: "left", transition: "all 0.2s"
              }}
            >
              <strong style={{ fontSize: "0.85rem" }}>Encargado / Supervisor</strong>
              <span style={{ fontSize: "0.7rem", color: "#475569" }}>Validación de censos, registros de riego y asignaciones de camas.</span>
            </button>

            <button 
              onClick={() => setRolMovil("admin")}
              style={{
                display: "flex", flexDirection: "column", gap: "3px", padding: "12px", borderRadius: "10px", border: rolMovil === "admin" ? "2px solid #2d5a27" : "1px solid #cbd5e1",
                background: rolMovil === "admin" ? "#e5f0e4" : "white", color: "#1a2e1a", cursor: "pointer", textAlign: "left", transition: "all 0.2s"
              }}
            >
              <strong style={{ fontSize: "0.85rem" }}>Administrador de Finca</strong>
              <span style={{ fontSize: "0.7rem", color: "#475569" }}>Dashboard de negocio, gestión de usuarios, perfiles y configuración de inquilino.</span>
            </button>
          </div>

          <div style={{ background: "#f8fafc", padding: "15px", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "0.8rem", color: "#475569", lineHeight: "1.5" }}>
            <h4 style={{ margin: "0 0 6px 0", color: "#2d5a27", fontWeight: "bold" }}>Guía de Simulación:</h4>
            <ul style={{ paddingLeft: "15px", margin: 0 }}>
              <li style={{ marginBottom: "5px" }}>Usa el PIN <strong>1234</strong> para Luis, <strong>5678</strong> para Carlos o <strong>0000</strong> para Alberto.</li>
              <li style={{ marginBottom: "5px" }}>La vista de Administrador móvil permite configurar los datos de la empresa.</li>
              <li style={{ marginBottom: "5px" }}>El Administrador no registra tareas de cosecha ni poda desde su celular.</li>
            </ul>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "20px" }}>
          <Link to="/configuracion-finca" style={{ textDecoration: "none", color: "white", fontWeight: "bold", fontSize: "0.85rem", padding: "12px", background: "#2d5a27", borderRadius: "8px", textAlign: "center", boxShadow: "0 2px 4px rgba(45,90,39,0.15)" }}>
            Volver a Administración Web
          </Link>
          <Link to="/landing" style={{ textDecoration: "none", color: "#64748b", fontSize: "0.8rem", textAlign: "center", fontWeight: "600" }}>
            Volver a la Landing Page
          </Link>
        </div>
      </div>

      {/* =======================================
          COLUMNA DERECHA: SMARTPHONE MOCKUP
          ======================================= */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
        
        {/* Smartphone Frame */}
        <div style={{ 
          width: "350px", 
          height: "700px", 
          background: "#121212", 
          borderRadius: "40px", 
          border: "10px solid #2d2d2d", 
          boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden"
        }}>
          
          {/* Muesca Superior */}
          <div style={{ 
            width: "110px", 
            height: "20px", 
            background: "black", 
            position: "absolute", 
            top: 0, 
            left: "50%", 
            transform: "translateX(-50%)", 
            borderBottomLeftRadius: "12px", 
            borderBottomRightRadius: "12px", 
            zIndex: 1000 
          }}></div>

          {/* Pantalla del Celular */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#f8fafc", position: "relative", overflow: "hidden" }}>
            
            {/* PANTALLA DE INICIO DE SESIÓN */}
            {!sesionIniciada ? (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "25px", background: "#1a2e1a", color: "white", boxSizing: "border-box" }}>
                <div style={{ textAlign: "center", marginBottom: "30px" }}>
                  <div style={{ width: "50px", height: "50px", borderRadius: "50%", background: "white", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px auto" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2d5a27" strokeWidth="2.5">
                      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.58 0 8a7 7 0 0 1-8 10z"></path>
                    </svg>
                  </div>
                  <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: "bold" }}>Rosas Monitor</h3>
                  <span style={{ fontSize: "0.7rem", color: "#a3bfa2", textTransform: "uppercase", letterSpacing: "1px", display: "block", marginTop: "3px" }}>Aplicación Móvil v2.1</span>
                </div>

                <form onSubmit={handleLoginMovil} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "4px", fontSize: "0.75rem", color: "#a3bfa2", fontWeight: "bold" }}>Usuario / Nombre</label>
                    <input 
                      type="text" 
                      placeholder="Ej: Alberto Herrera" 
                      value={nombreUsuario}
                      onChange={(e) => setNombreUsuario(e.target.value)}
                      style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #2d5a27", background: "rgba(255,255,255,0.08)", color: "white", fontSize: "0.85rem", boxSizing: "border-box" }} 
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "4px", fontSize: "0.75rem", color: "#a3bfa2", fontWeight: "bold" }}>PIN (4 dígitos)</label>
                    <input 
                      type="password" 
                      placeholder="••••" 
                      maxLength="4"
                      value={contrasena}
                      onChange={(e) => setContrasena(e.target.value)}
                      style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #2d5a27", background: "rgba(255,255,255,0.08)", color: "white", fontSize: "0.85rem", boxSizing: "border-box", textAlign: "center", letterSpacing: "5px" }} 
                      required 
                    />
                  </div>

                  {errorLogin && <div style={{ color: "#f87171", fontSize: "0.7rem", textAlign: "center", fontWeight: "bold" }}>{errorLogin}</div>}

                  <button 
                    type="submit" 
                    style={{ background: "white", color: "#1a2e1a", padding: "10px", border: "none", borderRadius: "6px", fontWeight: "bold", fontSize: "0.85rem", cursor: "pointer", marginTop: "5px" }}
                  >
                    {cargandoLogin ? "Verificando PIN..." : "Entrar a la Finca"}
                  </button>
                </form>
                <div style={{ marginTop: "20px", textAlign: "center", fontSize: "0.65rem", color: "#87a685" }}>
                  PINs: <strong>1234</strong> (Luis) | <strong>5678</strong> (Carlos) | <strong>0000</strong> (Alberto)
                </div>
              </div>
            ) : (
              <>
                {/* STATUS BAR DE LA APP MÓVIL */}
                <div style={{ height: "32px", background: "#2d5a27", color: "white", padding: "8px 15px 0 15px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.7rem", zIndex: 100 }}>
                  <span style={{ fontWeight: "bold" }}>14:30</span>
                  <span style={{ fontSize: "0.65rem", background: "rgba(255,255,255,0.2)", padding: "1px 6px", borderRadius: "4px", fontWeight: "bold", textTransform: "uppercase" }}>
                    {rolMovil}
                  </span>
                  <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                    <WifiIcon active={wifiDetectado} />
                    <BatteryIcon />
                  </div>
                </div>

                {/* CONTENIDO INTERNO DE PANTALLAS */}
                <div style={{ flex: 1, overflowY: "auto", position: "relative" }}>
                  
                  {/* ========================================================
                      FLUJOS DEL OPERARIO / TRABAJADOR O ENCARGADO EN EL MÓVIL
                      ======================================================== */}
                  {rolMovil !== "admin" && (
                    <>
                      {/* PANTALLA 1: CAPTURA DE VIDEOS */}
                      {tabMovil === "camara" && (
                        <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#f8fafc", boxSizing: "border-box" }}>
                          {rolMovil === "trabajador" && (
                            <>
                              {!mostrarCamaraViewfinder ? (
                                <div style={{ padding: "15px", display: "flex", flexDirection: "column", gap: "15px" }}>
                                  <div>
                                    <h3 style={{ margin: 0, color: "#1a2e1a", fontSize: "1.1rem", fontWeight: "bold" }}>Censo Continuo por Cama</h3>
                                    <span style={{ fontSize: "0.75rem", color: "#4b5563" }}>Graba los videos de ambos lados del surco para procesar.</span>
                                  </div>

                                  <div style={{ background: "white", padding: "12px", borderRadius: "10px", border: "1px solid #cbd5e1" }}>
                                    <label style={{ display: "block", marginBottom: "4px", color: "#2d5a27", fontWeight: "bold", fontSize: "0.75rem" }}>CAMA A CENSAR</label>
                                    <select 
                                      value={camaCaptura} 
                                      onChange={(e) => setCamaCaptura(e.target.value)}
                                      style={{ width: "100%", padding: "8px", borderRadius: "5px", border: "1px solid #cbd5e1", background: "white", fontSize: "0.85rem" }}
                                    >
                                      <option value="Cama 1-1">Cama 1-1 (Norte - Freedom)</option>
                                      <option value="Cama 1-2">Cama 1-2 (Norte - Freedom)</option>
                                      <option value="Cama 1-3">Cama 1-3 (Norte - Freedom)</option>
                                      <option value="Cama 2-1">Cama 2-1 (Sur - Explorer)</option>
                                    </select>
                                  </div>

                                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                    <span style={{ fontSize: "0.75rem", color: "#475569", fontWeight: "bold" }}>VIDEOS DEL CENSO</span>
                                    
                                    <button 
                                      onClick={() => { setLadoActivoCamara("A"); setMostrarCamaraViewfinder(true); }}
                                      style={{ 
                                        display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 15px", borderRadius: "10px", border: "1px solid #cbd5e1",
                                        background: videoAGrabado ? "#e5f0e4" : "white", color: "#1a2e1a", cursor: "pointer", textAlign: "left", width: "100%"
                                      }}
                                    >
                                      <div>
                                        <strong style={{ fontSize: "0.8rem", display: "block" }}>Video Lado A (Cama Izquierda)</strong>
                                        <span style={{ fontSize: "0.7rem", color: videoAGrabado ? "#2d5a27" : "#64748b" }}>
                                          {videoAGrabado ? "✓ Grabado (video_lado_a.mp4)" : "Pendiente de grabación"}
                                        </span>
                                      </div>
                                      <span style={{ fontSize: "0.75rem", background: videoAGrabado ? "#2d5a27" : "#cbd5e1", color: "white", padding: "4px 8px", borderRadius: "4px", fontWeight: "bold" }}>
                                        {videoAGrabado ? "Re-grabar" : "Grabar"}
                                      </span>
                                    </button>

                                    <button 
                                      onClick={() => { setLadoActivoCamara("B"); setMostrarCamaraViewfinder(true); }}
                                      style={{ 
                                        display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 15px", borderRadius: "10px", border: "1px solid #cbd5e1",
                                        background: videoBGrabado ? "#e5f0e4" : "white", color: "#1a2e1a", cursor: "pointer", textAlign: "left", width: "100%"
                                      }}
                                    >
                                      <div>
                                        <strong style={{ fontSize: "0.8rem", display: "block" }}>Video Lado B (Cama Derecha)</strong>
                                        <span style={{ fontSize: "0.7rem", color: videoBGrabado ? "#2d5a27" : "#64748b" }}>
                                          {videoBGrabado ? "✓ Grabado (video_lado_b.mp4)" : "Pendiente de grabación"}
                                        </span>
                                      </div>
                                      <span style={{ fontSize: "0.75rem", background: videoBGrabado ? "#2d5a27" : "#cbd5e1", color: "white", padding: "4px 8px", borderRadius: "4px", fontWeight: "bold" }}>
                                        {videoBGrabado ? "Re-grabar" : "Grabar"}
                                      </span>
                                    </button>
                                  </div>

                                  <button 
                                    onClick={procesarCensoCamaCompleta}
                                    disabled={!videoAGrabado || !videoBGrabado}
                                    style={{ 
                                      background: (videoAGrabado && videoBGrabado) ? "#2d5a27" : "#cbd5e1", 
                                      color: "white", padding: "12px", border: "none", borderRadius: "8px", fontWeight: "bold", fontSize: "0.85rem", 
                                      cursor: (videoAGrabado && videoBGrabado) ? "pointer" : "not-allowed", marginTop: "15px",
                                      boxShadow: (videoAGrabado && videoBGrabado) ? "0 4px 6px rgba(45,90,39,0.15)" : "none"
                                    }}
                                  >
                                    Procesar Cama Completa
                                  </button>
                                </div>
                              ) : (
                                /* CÁMARA TRABAJADOR */
                                <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#0c120c", position: "relative", minHeight: "500px" }}>
                                  <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 1 }}>
                                    <svg width="100%" height="100%" viewBox="0 0 360 550" fill="none">
                                      <rect width="360" height="550" fill="#081008" />
                                      <path d="M60 550 L60 160 M180 550 L180 100 M300 550 L300 180" stroke="#2d5a27" strokeWidth="6" strokeLinecap="round" />
                                      <circle cx="60" cy="160" r="15" fill="#dc2626" />
                                      <circle cx="180" cy="100" r="20" fill="#dc2626" />
                                      <circle cx="300" cy="180" r="12" fill="#d97706" />
                                      <line x1="110" y1="0" x2="110" y2="550" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="5,5" />
                                      <line x1="220" y1="0" x2="220" y2="550" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="5,5" />
                                    </svg>
                                  </div>
                                  <div style={{ zIndex: 10, padding: "12px", display: "flex", justifyContent: "space-between", background: "rgba(0,0,0,0.6)", color: "white", fontSize: "0.75rem", alignItems: "center" }}>
                                    <span>Grabando: Lado {ladoActivoCamara}</span>
                                    <button onClick={() => setMostrarCamaraViewfinder(false)} style={{ background: "#ef4444", border: "none", color: "white", padding: "4px 10px", borderRadius: "5px", fontWeight: "bold", cursor: "pointer" }}>Cancelar</button>
                                  </div>
                                  <div style={{ zIndex: 10, padding: "10px", display: "flex", flexDirection: "column", gap: "8px" }}>
                                    <div style={{ background: anguloCorrecto ? "rgba(34,197,94,0.85)" : "rgba(239,68,68,0.85)", color: "white", padding: "6px", borderRadius: "5px", fontSize: "0.7rem", fontWeight: "bold", textAlign: "center" }}>
                                      {anguloCorrecto ? "✓ Ángulo Correcto (Perpendicular)" : "⚠️ Incline el dispositivo 90°"}
                                    </div>
                                  </div>
                                  <div style={{ zIndex: 10, marginTop: "auto", padding: "20px", background: "linear-gradient(to top, rgba(0,0,0,0.95), transparent)", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                                    {grabando && (
                                      <div style={{ width: "100%" }}>
                                        <div style={{ height: "4px", background: "rgba(255,255,255,0.3)", borderRadius: "2px", overflow: "hidden" }}>
                                          <div style={{ width: `${progresoGrabacion}%`, height: "100%", background: "#ef4444" }}></div>
                                        </div>
                                      </div>
                                    )}
                                    <button onClick={() => !grabando && setGrabando(true)} style={{ width: "55px", height: "55px", borderRadius: "50%", border: "4px solid white", background: grabando ? "#4b5563" : "#ef4444", cursor: "pointer" }} />
                                    <span style={{ color: "white", fontSize: "0.7rem", fontWeight: "bold" }}>{grabando ? "Grabando..." : "Disparar Censo"}</span>
                                  </div>
                                </div>
                              )}
                            </>
                          )}

                          {rolMovil === "encargado" && (
                            <div style={{ padding: "15px", display: "flex", flexDirection: "column", gap: "15px" }}>
                              <div>
                                <h3 style={{ margin: 0, color: "#1a2e1a", fontSize: "1.1rem", fontWeight: "bold" }}>Asignación de Tareas</h3>
                                <span style={{ fontSize: "0.75rem", color: "#475569" }}>Monitorea el progreso de los operarios en campo.</span>
                              </div>

                              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                                {[
                                  { cama: "Cama 1-1", tarea: "Censo AI Lado A/B", worker: "Luis Silva", estado: "Completado", color: "#10b981", bg: "#e5f0e4" },
                                  { cama: "Cama 1-2", tarea: "Censo AI Lado A/B", worker: "Miguel Rojas", estado: "En Proceso", color: "#f97316", bg: "#fffbeb" },
                                  { cama: "Cama 1-3", tarea: "Poda Fitosanitaria", worker: "Luis Silva", estado: "Pendiente", color: "#94a3b8", bg: "#f1f5f9" },
                                  { cama: "Cama 2-1", tarea: "Riego Goteo", worker: "Carlos Mendoza", estado: "Completado", color: "#10b981", bg: "#e5f0e4" }
                                ].map((task, i) => (
                                  <div key={i} style={{ background: task.bg, padding: "12px", borderRadius: "8px", borderLeft: `4px solid ${task.color}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <div>
                                      <strong style={{ fontSize: "0.8rem", color: "#1a2e1a", display: "block" }}>{task.cama} - {task.tarea}</strong>
                                      <span style={{ fontSize: "0.7rem", color: "#475569" }}>Asignado: {task.worker}</span>
                                    </div>
                                    <span style={{ fontSize: "0.65rem", fontWeight: "bold", color: task.color }}>{task.estado}</span>
                                  </div>
                                ))}
                              </div>

                              <button 
                                onClick={() => { setMostrarCamaraViewfinder(true); setLadoActivoCamara("A"); }}
                                style={{ background: "#2d5a27", color: "white", padding: "10px", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", fontSize: "0.8rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                              >
                                <CameraIcon />
                                Inspección de Cámara Rápida
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* PANTALLA 2: REGISTROS */}
                      {tabMovil === "registros" && (
                        <div style={{ padding: "15px", boxSizing: "border-box" }}>
                          <div style={{ display: "flex", borderBottom: "1px solid #cbd5e1", marginBottom: "15px", background: "#f1f5f9", borderRadius: "8px", padding: "2px" }}>
                            <button 
                              onClick={() => setSubTabRegistros("cosecha")}
                              style={{ flex: 1, padding: "8px 4px", border: "none", background: subTabRegistros === "cosecha" ? "white" : "transparent", color: subTabRegistros === "cosecha" ? "#2d5a27" : "#475569", fontWeight: "bold", fontSize: "0.75rem", borderRadius: "6px", cursor: "pointer" }}
                            >
                              Cosecha
                            </button>
                            <button 
                              onClick={() => setSubTabRegistros("poda")}
                              style={{ flex: 1, padding: "8px 4px", border: "none", background: subTabRegistros === "poda" ? "white" : "transparent", color: subTabRegistros === "poda" ? "#2d5a27" : "#475569", fontWeight: "bold", fontSize: "0.75rem", borderRadius: "6px", cursor: "pointer" }}
                            >
                              Poda
                            </button>
                            {rolMovil === "encargado" && (
                              <button 
                                onClick={() => setSubTabRegistros("riego")}
                                style={{ flex: 1, padding: "8px 4px", border: "none", background: subTabRegistros === "riego" ? "white" : "transparent", color: subTabRegistros === "riego" ? "#2d5a27" : "#475569", fontWeight: "bold", fontSize: "0.75rem", borderRadius: "6px", cursor: "pointer" }}
                              >
                                Riego
                              </button>
                            )}
                          </div>

                          {subTabRegistros === "cosecha" && (
                            <form onSubmit={guardarCosechaLocal} style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.8rem" }}>
                              <h4 style={{ margin: 0, color: "#2d5a27" }}>Registrar Corte Diario</h4>
                              <div>
                                <label style={{ display: "block", marginBottom: "3px", fontWeight: "bold" }}>Cama de Rosas</label>
                                <select style={{ width: "100%", padding: "8px", borderRadius: "5px", border: "1px solid #cbd5e1" }}>
                                  <option value="1">Cama 1-1 (Freedom)</option>
                                  <option value="2">Cama 1-2 (Freedom)</option>
                                  <option value="3">Cama 2-1 (Explorer)</option>
                                </select>
                              </div>
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "5px" }}>
                                <div>
                                  <label style={{ display: "block", marginBottom: "3px", fontWeight: "bold", fontSize: "0.7rem" }}>Largos (&gt;60cm)</label>
                                  <input type="number" placeholder="0" value={tallosLargos} onChange={(e) => setTallosLargos(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "5px", border: "1px solid #cbd5e1", boxSizing: "border-box" }} />
                                </div>
                                <div>
                                  <label style={{ display: "block", marginBottom: "3px", fontWeight: "bold", fontSize: "0.7rem" }}>Medios (40-60)</label>
                                  <input type="number" placeholder="0" value={tallosMedios} onChange={(e) => setTallosMedios(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "5px", border: "1px solid #cbd5e1", boxSizing: "border-box" }} />
                                </div>
                                <div>
                                  <label style={{ display: "block", marginBottom: "3px", fontWeight: "bold", fontSize: "0.7rem" }}>Cortos (&lt;40cm)</label>
                                  <input type="number" placeholder="0" value={tallosCortos} onChange={(e) => setTallosCortos(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "5px", border: "1px solid #cbd5e1", boxSizing: "border-box" }} />
                                </div>
                              </div>
                              <div>
                                <label style={{ display: "block", marginBottom: "3px", fontWeight: "bold" }}>Observaciones</label>
                                <textarea placeholder="Ej: Calidad excelente..." value={obsCosecha} onChange={(e) => setObsCosecha(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "5px", border: "1px solid #cbd5e1", height: "45px", resize: "none", boxSizing: "border-box" }} />
                              </div>
                              <button type="submit" style={{ background: "#2d5a27", color: "white", padding: "10px", border: "none", borderRadius: "5px", fontWeight: "bold", cursor: "pointer" }}>
                                Guardar Cosecha (Local)
                              </button>
                            </form>
                          )}

                          {subTabRegistros === "poda" && (
                            <form onSubmit={guardarPodaLocal} style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.8rem" }}>
                              <h4 style={{ margin: 0, color: "#2d5a27" }}>Registrar Poda</h4>
                              <div>
                                <label style={{ display: "block", marginBottom: "3px", fontWeight: "bold" }}>Cama</label>
                                <select value={camaPoda} onChange={(e) => setCamaPoda(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "5px", border: "1px solid #cbd5e1" }}>
                                  <option value="Cama 1-1">Cama 1-1</option>
                                  <option value="Cama 1-2">Cama 1-2</option>
                                  <option value="Cama 2-1">Cama 2-1</option>
                                </select>
                              </div>
                              <div>
                                <label style={{ display: "block", marginBottom: "3px", fontWeight: "bold" }}>Tipo de Poda</label>
                                <select value={tipoPoda} onChange={(e) => setTipoPoda(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "5px", border: "1px solid #cbd5e1" }}>
                                  <option value="Limpieza">Poda de Limpieza (Desbrote)</option>
                                  <option value="Fitosanitaria">Poda Fitosanitaria (Enfermedad)</option>
                                  <option value="Formación">Poda de Formación</option>
                                </select>
                              </div>
                              <div>
                                <label style={{ display: "block", marginBottom: "3px", fontWeight: "bold" }}>Tallos Podados/Desechados</label>
                                <input type="number" placeholder="Ej: 45" value={tallosPodados} onChange={(e) => setTallosPodados(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "5px", border: "1px solid #cbd5e1", boxSizing: "border-box" }} required />
                              </div>
                              <div>
                                <label style={{ display: "block", marginBottom: "3px", fontWeight: "bold" }}>Notas adicionales</label>
                                <textarea placeholder="Ej: Presencia menor de hongo..." value={notasPoda} onChange={(e) => setNotasPoda(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "5px", border: "1px solid #cbd5e1", height: "45px", resize: "none", boxSizing: "border-box" }} />
                              </div>
                              <button type="submit" style={{ background: "#2d5a27", color: "white", padding: "10px", border: "none", borderRadius: "5px", fontWeight: "bold", cursor: "pointer" }}>
                                Guardar Poda (Local)
                              </button>
                            </form>
                          )}

                          {subTabRegistros === "riego" && (
                            <form onSubmit={guardarRiegoLocal} style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.8rem" }}>
                              <h4 style={{ margin: 0, color: "#2d5a27" }}>Control de Riego de Camas</h4>
                              <div>
                                <label style={{ display: "block", marginBottom: "3px", fontWeight: "bold" }}>Cama</label>
                                <select value={camaRiego} onChange={(e) => setCamaRiego(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "5px", border: "1px solid #cbd5e1" }}>
                                  <option value="Cama 1-1">Cama 1-1</option>
                                  <option value="Cama 1-2">Cama 1-2</option>
                                  <option value="Cama 2-1">Cama 2-1</option>
                                </select>
                              </div>
                              <div>
                                <label style={{ display: "block", marginBottom: "3px", fontWeight: "bold" }}>Método de Riego</label>
                                <select value={metodoRiego} onChange={(e) => setMetodoRiego(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "5px", border: "1px solid #cbd5e1" }}>
                                  <option value="Goteo">Por Goteo</option>
                                  <option value="Aspersión">Aspersión</option>
                                </select>
                              </div>
                              <div>
                                <label style={{ display: "block", marginBottom: "3px", fontWeight: "bold" }}>Cantidad (m³)</label>
                                <input type="number" placeholder="Ej: 15" value={cantidadRiego} onChange={(e) => setCantidadRiego(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "5px", border: "1px solid #cbd5e1", boxSizing: "border-box" }} required />
                              </div>
                              <button type="submit" style={{ background: "#2d5a27", color: "white", padding: "10px", border: "none", borderRadius: "5px", fontWeight: "bold", cursor: "pointer" }}>
                                Guardar Riego (Local)
                              </button>
                            </form>
                          )}
                        </div>
                      )}

                      {/* PANTALLA 3: SINCRONIZAR */}
                      {tabMovil === "sync" && (
                        <div style={{ padding: "15px", display: "flex", flexDirection: "column", gap: "15px", boxSizing: "border-box" }}>
                          <h3 style={{ margin: 0, color: "#1a2e1a", fontWeight: "bold", fontSize: "1.1rem" }}>Sincronización Local</h3>
                          
                          <div style={{ background: "white", padding: "12px", borderRadius: "10px", border: "1px solid #e5f0e4" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <div>
                                <h4 style={{ margin: "0 0 2px 0", color: "#2d5a27", fontSize: "0.85rem", fontWeight: "bold" }}>Wi-Fi Poscosecha</h4>
                                <span style={{ fontSize: "0.7rem", color: "#666" }}>
                                  {wifiDetectado ? "Conectado al servidor central" : "Modo Offline (Sin Wi-Fi)"}
                                </span>
                              </div>
                              <input 
                                type="checkbox" 
                                checked={wifiDetectado}
                                onChange={(e) => {
                                  setWifiDetectado(e.target.checked);
                                  if (!e.target.checked) setSubiendo(false);
                                }}
                                style={{ width: "18px", height: "18px", cursor: "pointer", accentColor: "#2d5a27" }} 
                              />
                            </div>
                          </div>

                          <div>
                            <h4 style={{ margin: "0 0 8px 0", color: "#475569", fontSize: "0.75rem", fontWeight: "bold" }}>Cola Local (WatermelonDB)</h4>
                            <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "150px", overflowY: "auto" }}>
                              {colaLocal.map(item => (
                                <div key={item.id} style={{ background: "white", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                  <div>
                                    <span style={{ fontWeight: "bold", fontSize: "0.8rem", display: "block" }}>{item.tipo}</span>
                                    <span style={{ fontSize: "0.7rem", color: "#666" }}>Cama: {item.cama} | {item.peso}</span>
                                  </div>
                                  <span style={{ 
                                    fontSize: "0.65rem", fontWeight: "bold", 
                                    color: item.estado === "sincronizado" ? "#2d5a27" : "#d97706",
                                    background: item.estado === "sincronizado" ? "#e5f0e4" : "#fffbeb",
                                    padding: "2px 6px", borderRadius: "4px"
                                  }}>
                                    {item.estado}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {wifiDetectado && (
                            <button 
                              onClick={iniciarSincronizacion} 
                              disabled={subiendo}
                              style={{ background: "#2d5a27", color: "white", padding: "10px", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}
                            >
                              {subiendo ? `Sincronizando... ${progresoSubida}%` : "Sincronizar Lotes"}
                            </button>
                          )}

                          {subiendo && (
                            <div style={{ width: "100%", height: "4px", background: "#e2e8f0", borderRadius: "2px", overflow: "hidden" }}>
                              <div style={{ width: `${progresoSubida}%`, height: "100%", background: "#2d5a27" }}></div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* PANTALLA 4: SANIDAD */}
                      {tabMovil === "sanidad" && (
                        <div style={{ padding: "15px", display: "flex", flexDirection: "column", gap: "12px", boxSizing: "border-box", position: "relative", height: "100%" }}>
                          {rolMovil === "trabajador" ? (
                            <>
                              <h3 style={{ margin: 0, color: "#1a2e1a", fontWeight: "bold", fontSize: "1.1rem" }}>Reportar Sanidad</h3>
                              <form onSubmit={guardarSanidadLocal} style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.8rem", background: "white", padding: "15px", borderRadius: "10px", border: "1px solid #cbd5e1" }}>
                                <div>
                                  <label style={{ display: "block", marginBottom: "3px", fontWeight: "bold" }}>Cama Afectada</label>
                                  <select value={camaSanidad} onChange={(e) => setCamaSanidad(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "5px", border: "1px solid #cbd5e1" }} required>
                                    <option value="Cama 1-1">Cama 1-1</option>
                                    <option value="Cama 1-2">Cama 1-2</option>
                                    <option value="Cama 2-1">Cama 2-1</option>
                                  </select>
                                </div>
                                <div>
                                  <label style={{ display: "block", marginBottom: "3px", fontWeight: "bold" }}>Tipo de Plaga</label>
                                  <select value={plagaSanidad} onChange={(e) => setPlagaSanidad(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "5px", border: "1px solid #cbd5e1" }} required>
                                    <option value="">Selecciona plaga...</option>
                                    <option value="Trips">Trips (Frankliniella)</option>
                                    <option value="Araña Roja">Araña Roja (Tetranychus)</option>
                                    <option value="Pulgón">Pulgón Verde</option>
                                    <option value="Botrytis">Botrytis</option>
                                  </select>
                                </div>
                                <div>
                                  <label style={{ display: "block", marginBottom: "3px", fontWeight: "bold" }}>Severidad</label>
                                  <select value={severidadSanidad} onChange={(e) => setSeveridadSanidad(e.target.value)} style={{ width: "100%", padding: "8px", borderRadius: "5px", border: "1px solid #cbd5e1" }} required>
                                    <option value="">Selecciona severidad...</option>
                                    <option value="Bajo">Bajo</option>
                                    <option value="Medio">Medio</option>
                                    <option value="Alto">Alto</option>
                                  </select>
                                </div>
                                <div>
                                  <label style={{ display: "block", marginBottom: "3px", fontWeight: "bold" }}>Evidencia</label>
                                  <button type="button" onClick={() => { setFotoEvidencia("foto.jpg"); alert("Foto de evidencia simulada."); }} style={{ width: "100%", padding: "8px", background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}>
                                    {fotoEvidencia ? "✓ Evidencia Capturada" : "Tomar Foto"}
                                  </button>
                                </div>
                                <button type="submit" style={{ background: "#2d5a27", color: "white", padding: "10px", border: "none", borderRadius: "5px", fontWeight: "bold", cursor: "pointer" }}>
                                  Guardar Reporte
                                </button>
                              </form>
                            </>
                          ) : (
                            <>
                              <h3 style={{ margin: 0, color: "#1a2e1a", fontWeight: "bold", fontSize: "1.1rem" }}>Alertas Fitosanitarias</h3>
                              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                                {[
                                  { cama: "Cama 2-3", plaga: "Araña Roja", severidad: "Alto", worker: "Luis", tiempo: "1h", color: "red" }
                                ].map((alert, i) => (
                                  <div key={i} style={{ background: "white", padding: "12px", borderRadius: "10px", border: "1px solid #cbd5e1", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <div>
                                      <strong style={{ fontSize: "0.8rem", color: "#1a2e1a" }}>{alert.cama} - {alert.plaga}</strong>
                                    </div>
                                    <span style={{ fontSize: "0.7rem", color: "red", fontWeight: "bold" }}>{alert.severidad}</span>
                                  </div>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      )}

                      {/* PANTALLA 5: AJUSTES */}
                      {tabMovil === "ajustes" && (
                        <div style={{ padding: "15px", display: "flex", flexDirection: "column", gap: "15px", boxSizing: "border-box" }}>
                          <h3 style={{ margin: 0, color: "#1a2e1a", fontWeight: "bold", fontSize: "1.1rem" }}>Ajustes del Sistema</h3>
                          <div style={{ background: "white", padding: "15px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "0.8rem" }}>
                            <div>
                              <label style={{ display: "block", marginBottom: "3px", fontWeight: "bold" }}>Servidor Central URL</label>
                              <input type="text" value={apiUrl} onChange={(e) => setApiUrl(e.target.value)} style={{ width: "100%", padding: "6px", borderRadius: "4px", border: "1px solid #cbd5e1" }} />
                            </div>
                            <div style={{ marginTop: "10px", borderTop: "1px solid #eee", paddingTop: "10px" }}>
                              <span>Usuario: <strong>{operarioActivo.nombre}</strong></span>
                            </div>
                          </div>
                          <button onClick={() => { setSesionIniciada(false); setContrasena(""); }} style={{ background: "#dc2626", color: "white", padding: "12px", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}>
                            Cerrar Sesión
                          </button>
                        </div>
                      )}
                    </>
                  )}

                  {/* ========================================================
                      FLUJOS DEL ADMINISTRADOR CORPORATIVO (ROL === 'ADMIN')
                      ======================================================== */}
                  {rolMovil === "admin" && (
                    <>
                      {/* PANTALLA 1: DASHBOARD DEL NEGOCIO */}
                      {tabMovil === "dashboard" && (
                        <div style={{ padding: "15px", display: "flex", flexDirection: "column", gap: "15px", boxSizing: "border-box" }}>
                          <div>
                            <h3 style={{ margin: 0, color: "#1a2e1a", fontSize: "1.1rem", fontWeight: "bold" }}>Dashboard del Negocio</h3>
                            <span style={{ fontSize: "0.75rem", color: "#475569" }}>Consumos y accesos rápidos de {nombreEmpresaMovil}.</span>
                          </div>

                          {/* Tarjetas de Métricas de Negocio */}
                          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                            <div style={{ background: "white", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", textAlign: "center" }}>
                              <span style={{ fontSize: "0.6rem", color: "#64748b", fontWeight: "bold", display: "block" }}>API CENSO IA</span>
                              <strong style={{ fontSize: "1.05rem", color: "#2d5a27" }}>8,420 / 10K</strong>
                              <span style={{ fontSize: "0.55rem", color: "#94a3b8", display: "block" }}>Consumo mensual</span>
                            </div>
                            <div style={{ background: "white", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", textAlign: "center" }}>
                              <span style={{ fontSize: "0.6rem", color: "#64748b", fontWeight: "bold", display: "block" }}>ALMACENAMIENTO</span>
                              <strong style={{ fontSize: "1.05rem", color: "#2d5a27" }}>2.4 GB / 10G</strong>
                              <span style={{ fontSize: "0.55rem", color: "#94a3b8", display: "block" }}>Videos guardados</span>
                            </div>
                          </div>

                          {/* Gráfico de Uso (SVG) */}
                          <div style={{ background: "white", padding: "12px", borderRadius: "10px", border: "1px solid #cbd5e1" }}>
                            <span style={{ fontSize: "0.7rem", color: "#475569", fontWeight: "bold", display: "block", marginBottom: "8px" }}>LLAMADAS API DIARIAS</span>
                            <div style={{ height: "80px", display: "flex", alignItems: "flex-end", gap: "6px" }}>
                              <div style={{ flex: 1, background: "#aac9a0", height: "35%", borderRadius: "2px" }}></div>
                              <div style={{ flex: 1, background: "#aac9a0", height: "55%", borderRadius: "2px" }}></div>
                              <div style={{ flex: 1, background: "#2d5a27", height: "80%", borderRadius: "2px" }}></div>
                              <div style={{ flex: 1, background: "#aac9a0", height: "65%", borderRadius: "2px" }}></div>
                              <div style={{ flex: 1, background: "#2d5a27", height: "90%", borderRadius: "2px" }}></div>
                            </div>
                          </div>

                          {/* Accesos Rápidos Propios */}
                          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            <span style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: "bold" }}>ACCESOS RÁPIDOS</span>
                            <button onClick={() => setModalInvernaderos(true)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", background: "white", cursor: "pointer", fontSize: "0.8rem", color: "#1a2e1a" }}>
                              <span>Invernaderos Activos</span>
                              <span style={{ color: "#64748b" }}>&gt;</span>
                            </button>
                            <button onClick={() => setModalAlertas(true)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", background: "white", cursor: "pointer", fontSize: "0.8rem", color: "#1a2e1a" }}>
                              <span>Focos de Alertas Activas</span>
                              <span style={{ color: "#64748b" }}>&gt;</span>
                            </button>
                            <button onClick={() => setModalReporte(true)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", background: "white", cursor: "pointer", fontSize: "0.8rem", color: "#1a2e1a" }}>
                              <span>Descargar Reporte Mensual</span>
                              <span style={{ color: "#64748b" }}>&gt;</span>
                            </button>
                          </div>

                          {/* MODALES INTERACTIVOS DE ACCESOS RÁPIDOS */}
                          {modalInvernaderos && (
                            <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", zIndex: 400, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                              <div style={{ background: "white", borderTopLeftRadius: "16px", borderTopRightRadius: "16px", padding: "15px", boxSizing: "border-box", maxHeight: "80%" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                                  <strong style={{ fontSize: "0.85rem", color: "#2d5a27" }}>Mapa de Invernaderos</strong>
                                  <button onClick={() => setModalInvernaderos(false)} style={{ background: "#f1f5f9", border: "none", borderRadius: "50%", width: "24px", height: "24px", cursor: "pointer", fontWeight: "bold" }}>×</button>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.75rem", color: "#475569" }}>
                                  <div style={{ border: "1px solid #cbd5e1", padding: "10px", borderRadius: "8px", background: "#f8fafc" }}>
                                    <strong>Galpón Norte</strong>
                                    <div style={{ display: "flex", gap: "6px", marginTop: "5px" }}>
                                      <span style={{ padding: "2px 6px", background: "#d1fae5", color: "#065f46", borderRadius: "4px", fontWeight: "bold", fontSize: "0.65rem" }}>Cama 1-1: Ok</span>
                                      <span style={{ padding: "2px 6px", background: "#fffbeb", color: "#b45309", borderRadius: "4px", fontWeight: "bold", fontSize: "0.65rem" }}>Cama 1-2: Trips</span>
                                    </div>
                                  </div>
                                  <div style={{ border: "1px solid #cbd5e1", padding: "10px", borderRadius: "8px", background: "#f8fafc" }}>
                                    <strong>Galpón Sur</strong>
                                    <div style={{ display: "flex", gap: "6px", marginTop: "5px" }}>
                                      <span style={{ padding: "2px 6px", background: "#fee2e2", color: "#991b1b", borderRadius: "4px", fontWeight: "bold", fontSize: "0.65rem" }}>Cama 2-1: Alerta Araña</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {modalAlertas && (
                            <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", zIndex: 400, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                              <div style={{ background: "white", borderTopLeftRadius: "16px", borderTopRightRadius: "16px", padding: "15px", boxSizing: "border-box", maxHeight: "80%" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                                  <strong style={{ fontSize: "0.85rem", color: "#dc2626" }}>Alertas Fitosanitarias Activas</strong>
                                  <button onClick={() => setModalAlertas(false)} style={{ background: "#f1f5f9", border: "none", borderRadius: "50%", width: "24px", height: "24px", cursor: "pointer", fontWeight: "bold" }}>×</button>
                                </div>
                                <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.7rem" }}>
                                  <div style={{ background: "#fee2e2", padding: "8px 12px", borderRadius: "6px", color: "#991b1b", borderLeft: "4px solid #ef4444" }}>
                                    <strong>Cama 2-1 (Galpón Sur): Araña Roja</strong>
                                    <span style={{ display: "block", fontSize: "0.6rem", marginTop: "2px" }}>Severidad: ALTA. Requiere poda fitosanitaria inmediata.</span>
                                  </div>
                                  <div style={{ background: "#fffbeb", padding: "8px 12px", borderRadius: "6px", color: "#b45309", borderLeft: "4px solid #f59e0b" }}>
                                    <strong>Cama 1-2 (Galpón Norte): Trips</strong>
                                    <span style={{ display: "block", fontSize: "0.6rem", marginTop: "2px" }}>Severidad: MEDIA. Requiere monitoreo continuo y desbrote.</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {modalReporte && (
                            <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", zIndex: 400, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                              <div style={{ background: "white", borderTopLeftRadius: "16px", borderTopRightRadius: "16px", padding: "15px", boxSizing: "border-box", maxHeight: "85%" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                                  <strong style={{ fontSize: "0.85rem", color: "#2d5a27" }}>Informe Ejecutivo de Finca</strong>
                                  <button onClick={() => setModalReporte(false)} style={{ background: "#f1f5f9", border: "none", borderRadius: "50%", width: "24px", height: "24px", cursor: "pointer", fontWeight: "bold" }}>×</button>
                                </div>
                                <div style={{ fontSize: "0.75rem", color: "#475569", lineHeight: "1.4" }}>
                                  <div style={{ borderBottom: "1px solid #cbd5e1", paddingBottom: "6px", marginBottom: "8px" }}>
                                    <strong>BellaRosa S.A.</strong>
                                    <span style={{ display: "block", fontSize: "0.6rem", color: "#94a3b8" }}>Reporte consolidado - Julio 2026</span>
                                  </div>
                                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                      <span>Tallos Proyectados (14d):</span>
                                      <strong>145,200</strong>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                      <span>Tallos Cosechados hoy:</span>
                                      <strong>12,400</strong>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                      <span>Eficiencia de Censo IA:</span>
                                      <strong>98.2%</strong>
                                    </div>
                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                      <span>Salud General Finca:</span>
                                      <span style={{ color: "#065f46", fontWeight: "bold" }}>Sano (98%)</span>
                                    </div>
                                  </div>
                                  <button onClick={() => { alert("Reporte PDF generado y guardado en descargas."); setModalReporte(false); }} style={{ width: "100%", marginTop: "15px", background: "#2d5a27", color: "white", border: "none", padding: "8px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", fontSize: "0.75rem" }}>
                                    Descargar PDF de Negocio
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* PANTALLA 2: GESTIÓN DE USUARIOS Y ROLES */}
                      {tabMovil === "usuarios" && (
                        <div style={{ padding: "15px", display: "flex", flexDirection: "column", gap: "15px", boxSizing: "border-box" }}>
                          <div>
                            <h3 style={{ margin: 0, color: "#1a2e1a", fontSize: "1.1rem", fontWeight: "bold" }}>Usuarios y Roles</h3>
                            <span style={{ fontSize: "0.75rem", color: "#475569" }}>Invitar empleados y configurar accesos.</span>
                          </div>

                          {/* Formulario Invitar */}
                          <form onSubmit={(e) => {
                            e.preventDefault();
                            if (!inviteEmailMovil) return;
                            const nuevo = {
                              id: Date.now(),
                              email: inviteEmailMovil,
                              rol: inviteRoleMovil === "supervisor" ? "Supervisor" : "Trabajador",
                              permisos: inviteRoleMovil === "supervisor" ? ["Censo", "Riego", "Sanidad"] : ["Censo"],
                              estado: "Invitación Enviada"
                            };
                            setUsuariosMovil([...usuariosMovil, nuevo]);
                            setInviteEmailMovil("");
                            alert(`Invitación de empleado enviada a ${inviteEmailMovil}`);
                          }} style={{ display: "flex", flexDirection: "column", gap: "10px", background: "white", padding: "12px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "0.75rem" }}>
                            <div>
                              <label style={{ display: "block", marginBottom: "3px", fontWeight: "bold" }}>Correo de Empleado</label>
                              <input 
                                type="email" 
                                placeholder="empleado@bellarosa.com" 
                                value={inviteEmailMovil}
                                onChange={(e) => setInviteEmailMovil(e.target.value)}
                                style={{ width: "100%", padding: "6px", borderRadius: "4px", border: "1px solid #cbd5e1" }}
                                required
                              />
                            </div>
                            <div>
                              <label style={{ display: "block", marginBottom: "3px", fontWeight: "bold" }}>Rol</label>
                              <select value={inviteRoleMovil} onChange={(e) => setInviteRoleMovil(e.target.value)} style={{ width: "100%", padding: "6px", borderRadius: "4px", border: "1px solid #cbd5e1", background: "white" }}>
                                <option value="supervisor">Supervisor (Censo, Riego, Alertas)</option>
                                <option value="trabajador">Trabajador de Campo</option>
                              </select>
                            </div>
                            <button type="submit" style={{ background: "#2d5a27", color: "white", padding: "8px", border: "none", borderRadius: "5px", fontWeight: "bold", cursor: "pointer" }}>
                              Invitar Colaborador
                            </button>
                          </form>

                          {/* Listado de Empleados */}
                          <div>
                            <span style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: "bold", display: "block", marginBottom: "6px" }}>COLABORADORES ({usuariosMovil.length})</span>
                            <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "200px", overflowY: "auto" }}>
                              {usuariosMovil.map(u => (
                                <div key={u.id} style={{ background: "white", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.7rem" }}>
                                  <div>
                                    <strong style={{ display: "block", color: "#1a2e1a" }}>{u.email.split("@")[0]}</strong>
                                    <span style={{ color: "#666" }}>{u.rol} | {u.permisos.join(", ")}</span>
                                  </div>
                                  <span style={{ background: u.estado === "Activo" ? "#d1fae5" : "#fef3c7", color: u.estado === "Activo" ? "#065f46" : "#d97706", padding: "2px 6px", borderRadius: "4px", fontWeight: "bold", fontSize: "0.65rem" }}>
                                    {u.estado}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* PANTALLA 3: CONFIGURACIÓN DEL INQUILINO */}
                      {tabMovil === "inquilino" && (
                        <div style={{ padding: "15px", display: "flex", flexDirection: "column", gap: "15px", boxSizing: "border-box" }}>
                          <div>
                            <h3 style={{ margin: 0, color: "#1a2e1a", fontSize: "1.1rem", fontWeight: "bold" }}>Ajustes de Inquilino</h3>
                            <span style={{ fontSize: "0.75rem", color: "#475569" }}>Políticas e identidad de {nombreEmpresaMovil}.</span>
                          </div>

                          {/* Formulario Inquilino */}
                          <form onSubmit={(e) => { e.preventDefault(); alert("Ajustes del inquilino guardados."); }} style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.75rem", background: "white", padding: "12px", borderRadius: "10px", border: "1px solid #cbd5e1" }}>
                            <div>
                              <label style={{ display: "block", marginBottom: "2px", fontWeight: "bold" }}>Nombre de Empresa</label>
                              <input type="text" value={nombreEmpresaMovil} onChange={(e) => setNombreEmpresaMovil(e.target.value)} style={{ width: "100%", padding: "6px", borderRadius: "4px", border: "1px solid #cbd5e1" }} required />
                            </div>
                            <div>
                              <label style={{ display: "block", marginBottom: "2px", fontWeight: "bold" }}>RFC / Registro Fiscal</label>
                              <input type="text" value={rfcEmpresaMovil} onChange={(e) => setRfcEmpresaMovil(e.target.value)} style={{ width: "100%", padding: "6px", borderRadius: "4px", border: "1px solid #cbd5e1" }} required />
                            </div>
                            <div>
                              <label style={{ display: "block", marginBottom: "2px", fontWeight: "bold" }}>Impuestos (IVA %)</label>
                              <input type="number" value={ivaEmpresaMovil} onChange={(e) => setIvaEmpresaMovil(e.target.value)} style={{ width: "100%", padding: "6px", borderRadius: "4px", border: "1px solid #cbd5e1" }} required />
                            </div>
                            <div>
                              <label style={{ display: "block", marginBottom: "2px", fontWeight: "bold" }}>Método de Pago</label>
                              <select value={metodoPagoMovil} onChange={(e) => setMetodoPagoMovil(e.target.value)} style={{ width: "100%", padding: "6px", borderRadius: "4px", border: "1px solid #cbd5e1", background: "white" }}>
                                <option value="tarjeta">Visa corporativa terminada en 4321</option>
                                <option value="paypal">PayPal Business Account</option>
                                <option value="transferencia">Transferencia Bancaria ACH</option>
                              </select>
                            </div>

                            {/* Logo Personalizado */}
                            <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "8px", marginTop: "4px" }}>
                              <label style={{ display: "block", marginBottom: "4px", fontWeight: "bold" }}>Logotipo Corporativo</label>
                              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                                <div style={{ width: "32px", height: "32px", borderRadius: "4px", border: "1px dashed #2d5a27", display: "flex", alignItems: "center", justifyContent: "center", background: "#e5f0e4" }}>
                                  <span style={{ fontSize: "0.6rem", fontWeight: "bold", color: "#2d5a27" }}>LOGO</span>
                                </div>
                                <button type="button" onClick={() => { setLogoEmpresaMovil("logo_subido_ok.png"); alert("Logotipo personalizado cargado."); }} style={{ background: "#f1f5f9", border: "1px solid #cbd5e1", padding: "6px 10px", borderRadius: "4px", cursor: "pointer", fontSize: "0.7rem", fontWeight: "bold" }}>
                                  {logoEmpresaMovil !== "logo_predeterminado.png" ? "Logo Actualizado" : "Subir Logotipo"}
                                </button>
                              </div>
                            </div>

                            {/* Integraciones ERP y API Key */}
                            <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "8px", marginTop: "4px" }}>
                              <label style={{ display: "block", marginBottom: "4px", fontWeight: "bold" }}>Integraciones & API</label>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                                <span style={{ fontSize: "0.65rem", color: "#475569" }}>Sincronizar con ERP (SAP/Dynamics)</span>
                                <input 
                                  type="checkbox" 
                                  checked={integracionERP} 
                                  onChange={(e) => setIntegracionERP(e.target.checked)} 
                                  style={{ width: "14px", height: "14px", accentColor: "#2d5a27" }}
                                />
                              </div>
                              <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                                <input 
                                  type="text" 
                                  value={tokenCopiado ? "br_live_7392a84d0e91bc7" : "br_live_••••••••••••••••"} 
                                  readOnly 
                                  style={{ flex: 1, padding: "4px 8px", fontSize: "0.65rem", border: "1px solid #cbd5e1", borderRadius: "4px", background: "#f8fafc" }}
                                />
                                <button 
                                  type="button" 
                                  onClick={() => { setTokenCopiado(true); alert("Token API copiado al portapapeles."); }} 
                                  style={{ background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "4px", padding: "4px 8px", fontSize: "0.65rem", cursor: "pointer", fontWeight: "bold" }}
                                >
                                  {tokenCopiado ? "Copiado" : "Copiar"}
                                </button>
                              </div>
                            </div>

                            {/* Historial de Auditoría */}
                            <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "8px", marginTop: "4px" }}>
                              <label style={{ display: "block", marginBottom: "4px", fontWeight: "bold" }}>Registro de Auditoría (Audit Log)</label>
                              <div style={{ display: "flex", flexDirection: "column", gap: "4px", background: "#f8fafc", padding: "6px", borderRadius: "6px", border: "1px solid #cbd5e1" }}>
                                {auditLogs.map(log => (
                                  <div key={log.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.6rem", color: "#475569" }}>
                                    <span>[{log.fecha}] {log.operario}</span>
                                    <strong style={{ color: "#2d5a27" }}>{log.accion}</strong>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <button type="submit" style={{ background: "#2d5a27", color: "white", padding: "10px", border: "none", borderRadius: "5px", fontWeight: "bold", cursor: "pointer", marginTop: "10px" }}>
                              Guardar Cambios
                            </button>
                          </form>

                          {/* Botón de Logout */}
                          <button 
                            onClick={() => {
                              setSesionIniciada(false);
                              setContrasena("");
                              alert("Sesión cerrada. Regresando a login de PIN.");
                            }}
                            style={{ background: "#dc2626", color: "white", padding: "10px", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", fontSize: "0.8rem" }}
                          >
                            Cerrar Sesión Corporativa
                          </button>
                        </div>
                      )}
                    </>
                  )}

                </div>

                {/* BOTTOM NAVIGATION BAR */}
                {rolMovil === "admin" ? (
                  /* NAVEGACIÓN EXCLUSIVA PARA ADMINISTRADORES MÓVILES */
                  <div style={{ height: "60px", borderTop: "1px solid #cbd5e1", display: "flex", background: "white", zIndex: 100 }}>
                    <button 
                      onClick={() => setTabMovil("dashboard")}
                      style={{ flex: 1, border: "none", background: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "4px", color: tabMovil === "dashboard" ? "#2d5a27" : "#64748b" }}
                    >
                      <ChartIcon />
                      <span style={{ fontSize: "0.6rem", fontWeight: "bold" }}>Dashboard</span>
                    </button>
                    
                    <button 
                      onClick={() => setTabMovil("usuarios")}
                      style={{ flex: 1, border: "none", background: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "4px", color: tabMovil === "usuarios" ? "#2d5a27" : "#64748b" }}
                    >
                      <UsersIcon />
                      <span style={{ fontSize: "0.6rem", fontWeight: "bold" }}>Usuarios</span>
                    </button>

                    <button 
                      onClick={() => setTabMovil("inquilino")}
                      style={{ flex: 1, border: "none", background: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "4px", color: tabMovil === "inquilino" ? "#2d5a27" : "#64748b" }}
                    >
                      <BuildingIcon />
                      <span style={{ fontSize: "0.6rem", fontWeight: "bold" }}>Inquilino</span>
                    </button>
                  </div>
                ) : (
                  /* NAVEGACIÓN ESTÁNDAR PARA TRABAJADOR Y ENCARGADO */
                  <div style={{ height: "60px", borderTop: "1px solid #cbd5e1", display: "flex", background: "white", zIndex: 100 }}>
                    <button 
                      onClick={() => { setTabMovil("camara"); setMostrarGuia(false); setMostrarCamaraViewfinder(false); }}
                      style={{ flex: 1, border: "none", background: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "4px", color: tabMovil === "camara" ? "#2d5a27" : "#64748b" }}
                    >
                      <CameraIcon />
                      <span style={{ fontSize: "0.6rem", fontWeight: "bold" }}>Captura</span>
                    </button>
                    
                    <button 
                      onClick={() => { setTabMovil("registros"); setMostrarGuia(false); setMostrarCamaraViewfinder(false); }}
                      style={{ flex: 1, border: "none", background: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "4px", color: tabMovil === "registros" ? "#2d5a27" : "#64748b" }}
                    >
                      <LeafIcon />
                      <span style={{ fontSize: "0.6rem", fontWeight: "bold" }}>Registros</span>
                    </button>

                    <button 
                      onClick={() => { setTabMovil("sync"); setMostrarGuia(false); setMostrarCamaraViewfinder(false); }}
                      style={{ flex: 1, border: "none", background: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "4px", color: tabMovil === "sync" ? "#2d5a27" : "#64748b" }}
                    >
                      <SyncIcon />
                      <span style={{ fontSize: "0.6rem", fontWeight: "bold" }}>Sincronizar</span>
                    </button>

                    <button 
                      onClick={() => { setTabMovil("sanidad"); setMostrarGuia(false); setMostrarCamaraViewfinder(false); }}
                      style={{ flex: 1, border: "none", background: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "4px", color: tabMovil === "sanidad" ? "#2d5a27" : "#64748b" }}
                    >
                      <ShieldIcon />
                      <span style={{ fontSize: "0.6rem", fontWeight: "bold" }}>Sanidad</span>
                    </button>

                    <button 
                      onClick={() => { setTabMovil("ajustes"); setMostrarGuia(false); setMostrarCamaraViewfinder(false); }}
                      style={{ flex: 1, border: "none", background: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "4px", color: tabMovil === "ajustes" ? "#2d5a27" : "#64748b" }}
                    >
                      <SettingsIcon />
                      <span style={{ fontSize: "0.6rem", fontWeight: "bold" }}>Ajustes</span>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- ICONOS VECTORIALES SVG ---
function WifiIcon({ active }) {
  return active ? (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.55a11 11 0 0 1 14.08 0"></path>
      <path d="M1.42 9a16 16 0 0 1 21.16 0"></path>
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
      <line x1="12" y1="20" x2="12.01" y2="20"></line>
    </svg>
  ) : (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="1" y1="1" x2="23" y2="23"></line>
      <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"></path>
      <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"></path>
      <path d="M10.71 5.05A16 16 0 0 1 22.58 9"></path>
      <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"></path>
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
      <line x1="12" y1="20" x2="12.01" y2="20"></line>
    </svg>
  );
}

function BatteryIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="6" width="18" height="12" rx="2" ry="2"></rect>
      <line x1="23" y1="11" x2="23" y2="13"></line>
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
      <circle cx="12" cy="13" r="4"></circle>
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
    </svg>
  );
}

function SyncIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10"></polyline>
      <polyline points="1 20 1 14 7 14"></polyline>
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
    </svg>
  );
}

function ChevronIcon({ direction }) {
  return direction === "up" ? (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="18 15 12 9 6 15"></polyline>
    </svg>
  ) : (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="16" x2="12" y2="12"></line>
      <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
  );
}

function LeafIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.58 0 8a7 7 0 0 1-8 10z"></path>
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"></circle>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"></line>
      <line x1="12" y1="20" x2="12" y2="4"></line>
      <line x1="6" y1="20" x2="6" y2="14"></line>
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
  );
}

function BuildingIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
      <line x1="9" y1="22" x2="9" y2="16"></line>
      <line x1="9" y1="16" x2="15" y2="16"></line>
      <line x1="15" y1="16" x2="15" y2="22"></line>
      <line x1="9" y1="8" x2="9.01" y2="8"></line>
      <line x1="15" y1="8" x2="15.01" y2="8"></line>
      <line x1="9" y1="12" x2="9.01" y2="12"></line>
      <line x1="15" y1="12" x2="15.01" y2="12"></line>
    </svg>
  );
}
