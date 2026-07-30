import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function ConfiguracionFinca({ defaultSection = "configuracion" }) {
  const navigate = useNavigate();
  const [seccion, setSeccion] = useState(defaultSection);
  const [sidebarVisible, setSidebarVisible] = useState(true);

  // Sincronizar sección cuando cambie la prop de la ruta
  useEffect(() => {
    setSeccion(defaultSection);
  }, [defaultSection]);

  // --- MOCK DATA PARA LA SIMULACIÓN (DATOS QUEMADOS) ---
  const [invernaderos, setInvernaderos] = useState([
    { id: 1, nombre: "Galpón Norte", cultivo: "Rosas Freedom", totalCamas: 12 },
    { id: 2, nombre: "Galpón Sur", cultivo: "Rosas Explorer", totalCamas: 8 }
  ]);

  const [supervisores, setSupervisores] = useState([
    { id: 1, nombre: "Carlos Mendoza", usuario: "carlos.m@finca.com", galpones: "Galpón Norte", cedula: "1724567890", contratacion: "Indefinido", contacto: "0998765432", sueldo: 850, estado: "Activo" },
    { id: 2, nombre: "Ana Torres", usuario: "ana.t@finca.com", galpones: "Galpón Sur", cedula: "1719876543", contratacion: "Indefinido", contacto: "0987654321", sueldo: 850, estado: "Activo" }
  ]);

  const [trabajadores, setTrabajadores] = useState([
    { id: 1, nombre: "Luis Silva", pin: "1234", supervisor: "Carlos Mendoza", asignacion: "Galpón Norte - Camas 1 a 5", cedula: "1718273645", contratacion: "Temporal", contacto: "0967543210", sueldo: 550, estado: "Activo" },
    { id: 2, nombre: "Miguel Rojas", pin: "5678", supervisor: "Ana Torres", asignacion: "Galpón Sur - Camas 1 a 3", cedula: "1715243647", contratacion: "Temporal", contacto: "0976543210", sueldo: 550, estado: "Activo" }
  ]);

  const [listaPodas, setListaPodas] = useState([
    { id: 1, fecha: "23/07/2026", hora: "08:15", cama: "Cama 1-1", cortados: 240, tipo: "Freedom", calidad: "Largo", supervisor: "Carlos Mendoza" },
    { id: 2, fecha: "22/07/2026", hora: "14:20", cama: "Cama 1-2", cortados: 180, tipo: "Freedom", calidad: "Medio", supervisor: "Ana Torres" },
    { id: 3, fecha: "21/07/2026", hora: "09:45", cama: "Cama 2-1", cortados: 210, tipo: "Explorer", calidad: "Corto", supervisor: "Carlos Mendoza" }
  ]);
  const [nuevaCosecha, setNuevaCosecha] = useState({ cama: "", tipo: "Freedom", cortados: "", calidad: "Largo", hora: "08:00", supervisor: "" });

  const [listaMantenimientoPoda, setListaMantenimientoPoda] = useState([
    { id: 1, fecha: "24/07/2026", cama: "Cama 1-1", tipo: "Fitosanitaria", tallos: 45, operario: "Luis Silva" },
    { id: 2, fecha: "23/07/2026", cama: "Cama 1-2", tipo: "Limpieza", tallos: 60, operario: "Miguel Rojas" },
    { id: 3, fecha: "22/07/2026", cama: "Cama 1-3", tipo: "Formación", tallos: 30, operario: "Luis Silva" }
  ]);
  const [nuevaPoda, setNuevaPoda] = useState({ cama: "", tipo: "Limpieza", tallos: "", operario: "" });

  // Estados interactivos para simulación
  const [tipoFormulario, setTipoFormulario] = useState("supervisor");
  const [cargandoEnvio, setCargandoEnvio] = useState(false);
  const [progresoEnvio, setProgresoEnvio] = useState(0);
  const [mostrarResultadoMock, setMostrarResultadoMock] = useState(false);
  
  // Checkout de Planes
  const [mostrarModalPago, setMostrarModalPago] = useState(false);
  const [planSeleccionado, setPlanSeleccionado] = useState("");
  const [procesandoPago, setProcesandoPago] = useState(false);
  const [pagoCompletado, setPagoCompletado] = useState(false);

  // Gestión de Camas en datos quemados
  const [invernaderoSeleccionado, setInvernaderoSeleccionado] = useState(null);
  const [nuevaCama, setNuevaCama] = useState({ nombre: "", descripcion: "", variedad: "", filas_por_cama: 2, largo: "", ancho: "", responsable: "" });
  const [editandoCama, setEditandoCama] = useState(null);
  const [camas, setCamas] = useState([
    { id: 1, invernaderoId: 1, nombre: "Cama 1", descripcion: "Fila central de profundidad", variedad: "Rosas Freedom", filas_por_cama: 2, largo: 50, ancho: 1.2, responsable: "Luis Silva" },
    { id: 2, invernaderoId: 1, nombre: "Cama 2", descripcion: "Fila lateral norte", variedad: "Rosas Freedom", filas_por_cama: 2, largo: 50, ancho: 1.2, responsable: "Luis Silva" },
    { id: 3, invernaderoId: 1, nombre: "Cama 3", descripcion: "Malla central baja", variedad: "Rosas Freedom", filas_por_cama: 1, largo: 45, ancho: 1.1, responsable: "Miguel Rojas" },
    { id: 4, invernaderoId: 2, nombre: "Cama 1", descripcion: "Lado este", variedad: "Rosas Explorer", filas_por_cama: 2, largo: 40, ancho: 1.2, responsable: "Ana Torres" }
  ]);

  // Estados para Croquis de la Finca
  const [croquisAncho, setCroquisAncho] = useState(4);
  const [croquisLargo, setCroquisLargo] = useState(8);
  const [invernaderoCroquis, setInvernaderoCroquis] = useState(1);
  const [camaSeleccionadaCroquis, setCamaSeleccionadaCroquis] = useState(null);

  // Estados agronómicos avanzados para el Croquis SVG interactivo
  const [modoVistaCroquis, setModoVistaCroquis] = useState("siembra"); // "siembra" o "calor"
  const [verRutaMonitor, setVerRutaMonitor] = useState(true);
  const [camaEditando, setCamaEditando] = useState(null);

  // Estados para el Generador Paramétrico de Bloques
  const [mostrarGenerador, setMostrarGenerador] = useState(false);
  const [genNumCamas, setGenNumCamas] = useState(8);
  const [genStartX, setGenStartX] = useState(60);
  const [genStartY, setGenStartY] = useState(80);
  const [genWidth, setGenWidth] = useState(160);
  const [genHeight, setGenHeight] = useState(30);
  const [genSpacing, setGenSpacing] = useState(15);
  const [genSlant, setGenSlant] = useState(10);
  const [genOrientacion, setGenOrientacion] = useState("horizontal");
  
  // Base de datos local de camas con coordenadas espaciales X, Y y puntos de plagas internos
  const [camasCroquisSVG, setCamasCroquisSVG] = useState([
    // Invernadero 1: Galpón Norte (Rosas Freedom) - Bloque Izquierdo Escalonado
    { id: 1, invernaderoId: 1, nombre: "Cama 1", x: 60, y: 70, w: 150, h: 30, largo: 60, ancho: 1.2, estado: "Lista Cosecha", responsable: "Luis Silva", variedad: "Rosas Freedom", totalTallos: 150, totalBotones: 130, confianza: 95, puntosPlaga: [{ id: 101, xPct: 15, yPct: 50, severidad: 0.8, plaga: "Araña Roja" }] },
    { id: 2, invernaderoId: 1, nombre: "Cama 2", x: 70, y: 115, w: 150, h: 30, largo: 60, ancho: 1.2, estado: "En Crecimiento", responsable: "Luis Silva", variedad: "Rosas Freedom", totalTallos: 110, totalBotones: 95, confianza: 93, puntosPlaga: [] },
    { id: 3, invernaderoId: 1, nombre: "Cama 3", x: 80, y: 160, w: 150, h: 30, largo: 60, ancho: 1.2, estado: "Sin censo", responsable: "Miguel Rojas", variedad: "Rosas Freedom", totalTallos: 0, totalBotones: 0, confianza: 0, puntosPlaga: [] },
    { id: 4, invernaderoId: 1, nombre: "Cama 4", x: 90, y: 205, w: 150, h: 30, largo: 60, ancho: 1.2, estado: "Lista Cosecha", responsable: "Miguel Rojas", variedad: "Rosas Freedom", totalTallos: 145, totalBotones: 120, confianza: 92, puntosPlaga: [{ id: 102, xPct: 75, yPct: 50, severidad: 0.5, plaga: "Trips" }] },
    { id: 5, invernaderoId: 1, nombre: "Cama 5", x: 100, y: 250, w: 150, h: 30, largo: 55, ancho: 1.2, estado: "En Crecimiento", responsable: "Luis Silva", variedad: "Rosas Freedom", totalTallos: 98, totalBotones: 85, confianza: 94, puntosPlaga: [] },
    { id: 6, invernaderoId: 1, nombre: "Cama 6", x: 110, y: 295, w: 150, h: 30, largo: 55, ancho: 1.2, estado: "Lista Cosecha", responsable: "Luis Silva", variedad: "Rosas Freedom", totalTallos: 160, totalBotones: 140, confianza: 96, puntosPlaga: [{ id: 103, xPct: 30, yPct: 50, severidad: 0.9, plaga: "Botrytis" }] },
    
    // Invernadero 1: Galpón Norte (Rosas Freedom) - Bloque Central
    { id: 7, invernaderoId: 1, nombre: "Cama 7", x: 280, y: 70, w: 180, h: 30, largo: 55, ancho: 1.2, estado: "Sin censo", responsable: "Miguel Rojas", variedad: "Rosas Freedom", totalTallos: 0, totalBotones: 0, confianza: 0, puntosPlaga: [] },
    { id: 8, invernaderoId: 1, nombre: "Cama 8", x: 280, y: 115, w: 180, h: 30, largo: 55, ancho: 1.2, estado: "En Crecimiento", responsable: "Miguel Rojas", variedad: "Rosas Freedom", totalTallos: 105, totalBotones: 90, confianza: 93, puntosPlaga: [] },
    { id: 9, invernaderoId: 1, nombre: "Cama 9", x: 280, y: 160, w: 180, h: 30, largo: 50, ancho: 1.2, estado: "Lista Cosecha", responsable: "Luis Silva", variedad: "Rosas Freedom", totalTallos: 130, totalBotones: 110, confianza: 95, puntosPlaga: [{ id: 104, xPct: 45, yPct: 50, severidad: 0.6, plaga: "Trips" }] },
    { id: 10, invernaderoId: 1, nombre: "Cama 10", x: 280, y: 205, w: 180, h: 30, largo: 50, ancho: 1.2, estado: "Sin censo", responsable: "Luis Silva", variedad: "Rosas Freedom", totalTallos: 0, totalBotones: 0, confianza: 0, puntosPlaga: [] },
    { id: 11, invernaderoId: 1, nombre: "Cama 11", x: 280, y: 250, w: 180, h: 30, largo: 50, ancho: 1.2, estado: "En Crecimiento", responsable: "Miguel Rojas", variedad: "Rosas Freedom", totalTallos: 88, totalBotones: 75, confianza: 94, puntosPlaga: [{ id: 105, xPct: 80, yPct: 50, severidad: 0.4, plaga: "Araña Roja" }] },
    { id: 12, invernaderoId: 1, nombre: "Cama 12", x: 280, y: 295, w: 180, h: 30, largo: 50, ancho: 1.2, estado: "Lista Cosecha", responsable: "Miguel Rojas", variedad: "Rosas Freedom", totalTallos: 155, totalBotones: 135, confianza: 96, puntosPlaga: [] },

    // Invernadero 1: Galpón Norte (Rosas Freedom) - Bloque Derecho
    { id: 13, invernaderoId: 1, nombre: "Cama 13", x: 500, y: 70, w: 200, h: 30, largo: 40, ancho: 1.2, estado: "Lista Cosecha", responsable: "Ana Torres", variedad: "Rosas Freedom", totalTallos: 120, totalBotones: 102, confianza: 94, puntosPlaga: [{ id: 106, xPct: 10, yPct: 50, severidad: 0.75, plaga: "Araña Roja" }] },
    { id: 14, invernaderoId: 1, nombre: "Cama 14", x: 500, y: 115, w: 200, h: 30, largo: 40, ancho: 1.2, estado: "En Crecimiento", responsable: "Ana Torres", variedad: "Rosas Freedom", totalTallos: 85, totalBotones: 72, confianza: 92, puntosPlaga: [] },
    { id: 15, invernaderoId: 1, nombre: "Cama 15", x: 500, y: 160, w: 200, h: 30, largo: 35, ancho: 1.1, estado: "Sin censo", responsable: "Miguel Rojas", variedad: "Rosas Freedom", totalTallos: 0, totalBotones: 0, confianza: 0, puntosPlaga: [] },
    { id: 16, invernaderoId: 1, nombre: "Cama 16", x: 500, y: 205, w: 200, h: 30, largo: 40, ancho: 1.2, estado: "Lista Cosecha", responsable: "Ana Torres", variedad: "Rosas Freedom", totalTallos: 130, totalBotones: 112, confianza: 95, puntosPlaga: [{ id: 107, xPct: 90, yPct: 50, severidad: 0.65, plaga: "Botrytis" }] },
    
    // Invernadero 2: Galpón Sur (Rosas Explorer)
    { id: 17, invernaderoId: 2, nombre: "Cama S-1", x: 80, y: 80, w: 180, h: 35, largo: 40, ancho: 1.2, estado: "Lista Cosecha", responsable: "Ana Torres", variedad: "Rosas Explorer", totalTallos: 120, totalBotones: 102, confianza: 94, puntosPlaga: [{ id: 108, xPct: 30, yPct: 50, severidad: 0.75, plaga: "Araña Roja" }] },
    { id: 18, invernaderoId: 2, nombre: "Cama S-2", x: 80, y: 130, w: 180, h: 35, largo: 40, ancho: 1.2, estado: "En Crecimiento", responsable: "Ana Torres", variedad: "Rosas Explorer", totalTallos: 85, totalBotones: 72, confianza: 92, puntosPlaga: [] },
    { id: 19, invernaderoId: 2, nombre: "Cama S-3", x: 80, y: 180, w: 180, h: 35, largo: 35, ancho: 1.1, estado: "Sin censo", responsable: "Miguel Rojas", variedad: "Rosas Explorer", totalTallos: 0, totalBotones: 0, confianza: 0, puntosPlaga: [] },
    { id: 20, invernaderoId: 2, nombre: "Cama S-4", x: 300, y: 80, w: 200, h: 35, largo: 40, ancho: 1.2, estado: "Lista Cosecha", responsable: "Ana Torres", variedad: "Rosas Explorer", totalTallos: 130, totalBotones: 112, confianza: 95, puntosPlaga: [{ id: 109, xPct: 70, yPct: 50, severidad: 0.5, plaga: "Trips" }] },
    { id: 21, invernaderoId: 2, nombre: "Cama S-5", x: 300, y: 130, w: 200, h: 35, largo: 40, ancho: 1.2, estado: "En Crecimiento", responsable: "Ana Torres", variedad: "Rosas Explorer", totalTallos: 92, totalBotones: 80, confianza: 93, puntosPlaga: [] }
  ]);

  // Control de Roles y Permisos (Mock)
  const [rolActual, setRolActual] = useState("admin");
  const [permisosSupervisor, setPermisosSupervisor] = useState({
    configuracion: true,
    personal: false,
    facturacion: false,
    ingreso_datos: true,
    datos_consolidados: true,
    proyecciones: true,
    cosecha: true,
    poda: true,
    riego: true,
    croquis: true
  });

  // Nuevos estados agronómicos (V4.0)
  const [tipoSuelo, setTipoSuelo] = useState("Franco-Arcilloso");
  const [areaTotal, setAreaTotal] = useState("12.5");
  const [alturaMsnm, setAlturaMsnm] = useState("2850");

  const [listaRiego, setListaRiego] = useState([
    { id: 1, fecha: "2026-07-24", responsable: "Luis Silva", metodo: "Goteo", cantidad: "120" },
    { id: 2, fecha: "2026-07-23", responsable: "Miguel Rojas", metodo: "Aspersión", cantidad: "150" }
  ]);
  const [nuevoRiego, setNuevoRiego] = useState({ fecha: "2026-07-24", responsable: "", metodo: "Goteo", cantidad: "" });

  // Estados de Ajustes de Admin (V4.0 / V5.0)
  const [subPestanaAdmin, setSubPestanaAdmin] = useState("dashboard_negocio");
  const [nombreEmpresa, setNombreEmpresa] = useState("BellaRosa S.A.");
  const [rfcEmpresa, setRfcEmpresa] = useState("1792348574001");
  const [ivaEmpresa, setIvaEmpresa] = useState("15");
  const [metodoPagoEmpresa, setMetodoPagoEmpresa] = useState("tarjeta");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("supervisor");
  const [usuariosRegistrados, setUsuariosRegistrados] = useState([
    { id: 1, nombre: "Ing. Alberto Herrera", email: "alberto.admin@bellarosa.com", rol: "Administrador", estado: "Activo" },
    { id: 2, nombre: "Carlos Mendoza", email: "carlos.mendoza@bellarosa.com", rol: "Supervisor", estado: "Activo" },
    { id: 3, nombre: "Ana Torres", email: "ana.torres@bellarosa.com", rol: "Supervisor", estado: "Activo" }
  ]);

  const [especiesCatalogo, setEspeciesCatalogo] = useState([
    { id: 1, nombre: "Rosa Freedom", ciclo: 12, largo: "70-80cm", humedad: "65%" },
    { id: 2, nombre: "Rosa Explorer", ciclo: 14, largo: "80-90cm", humedad: "60%" },
    { id: 3, nombre: "Rosa Mondial", ciclo: 11, largo: "60-70cm", humedad: "70%" },
    { id: 4, nombre: "Rosa Sweetness", ciclo: 13, largo: "60-80cm", humedad: "65%" }
  ]);
  const [nuevaEspecie, setNuevaEspecie] = useState({ nombre: "", ciclo: "", largo: "", humedad: "" });
  const [frecuenciaCenso, setFrecuenciaCenso] = useState("Diario");
  const [frecuenciaAlertas, setFrecuenciaAlertas] = useState("Inmediato");

  const generarBloqueCamas = () => {
    const baseId = Math.max(...camasCroquisSVG.map(c => c.id), 0) + 1;
    const nuevasCamas = [];
    
    for (let i = 0; i < genNumCamas; i++) {
      let x = genStartX;
      let y = genStartY;
      
      if (genOrientacion === "horizontal") {
        y = genStartY + i * (genHeight + genSpacing);
        x = genStartX + i * genSlant;
      } else {
        x = genStartX + i * (genWidth + genSpacing);
        y = genStartY + i * genSlant;
      }
      
      nuevasCamas.push({
        id: baseId + i,
        invernaderoId: invernaderoCroquis,
        nombre: `Cama B${invernaderoCroquis}-${i + 1}`,
        x: x,
        y: y,
        w: genWidth,
        h: genHeight,
        largo: Math.round(genWidth * 0.3),
        ancho: 1.2,
        estado: "Sin censo",
        responsable: "Operario Auto",
        variedad: invernaderoCroquis === 1 ? "Rosas Freedom" : "Rosas Explorer",
        totalTallos: 0,
        totalBotones: 0,
        confianza: 0,
        puntosPlaga: []
      });
    }
    
    setCamasCroquisSVG(prev => [...prev, ...nuevasCamas]);
    setMostrarGenerador(false);
  };

  const handleSvgClick = (e) => {
    if (modoVistaCroquis !== "calor") return;
    
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    
    const clickX = ((e.clientX - rect.left) / rect.width) * 800;
    const clickY = ((e.clientY - rect.top) / rect.height) * 450;
    
    let camaCercana = null;
    let minDistancia = Infinity;
    
    camasCroquisSVG
      .filter(c => c.invernaderoId === invernaderoCroquis)
      .forEach(c => {
        const centroX = c.x + c.w / 2;
        const centroY = c.y + c.h / 2;
        const dist = Math.hypot(clickX - centroX, clickY - centroY);
        
        if (dist < minDistancia) {
          minDistancia = dist;
          camaCercana = c;
        }
      });
      
    if (camaCercana && minDistancia < 150) {
      const localX = clickX - camaCercana.x;
      let xPct = Math.round((localX / camaCercana.w) * 100);
      xPct = Math.max(5, Math.min(95, xPct));
      
      const nuevosPuntos = [...(camaCercana.puntosPlaga || [])];
      const nuevoPunto = {
        id: Date.now(),
        xPct: xPct,
        yPct: 50,
        severidad: 0.6,
        plaga: "Araña Roja"
      };
      nuevosPuntos.push(nuevoPunto);
      
      const updated = { ...camaCercana, puntosPlaga: nuevosPuntos };
      setCamaSeleccionadaCroquis(updated);
      setCamasCroquisSVG(prev => prev.map(c => c.id === updated.id ? updated : c));
    }
  };

  const handleCambiarRol = (nuevoRol) => {
    setRolActual(nuevoRol);
    if (nuevoRol === "supervisor") {
      if (!permisosSupervisor[seccion]) {
        const primeraPermitida = Object.keys(permisosSupervisor).find(key => permisosSupervisor[key] === true);
        if (primeraPermitida) {
          setSeccion(primeraPermitida);
        }
      }
    }
  };

  // --- HANDLERS SIMULADOS ---
  const handleCrearInvernadero = (e) => {
    e.preventDefault();
    alert("Simulación: Invernadero guardado en datos quemados.");
  };

  const handleCrearPersonal = (e) => {
    e.preventDefault();
    alert(`Simulación: Nuevo ${tipoFormulario} creado con éxito.`);
  };

  const handleSimularSubida = (e) => {
    e.preventDefault();
    setCargandoEnvio(true);
    setProgresoEnvio(0);
    setMostrarResultadoMock(false);

    const intervalo = setInterval(() => {
      setProgresoEnvio(prev => {
        if (prev >= 100) {
          clearInterval(intervalo);
          setCargandoEnvio(false);
          setMostrarResultadoMock(true);
          return 100;
        }
        return prev + 20;
      });
    }, 300);
  };

  const handleSimularPago = (e) => {
    e.preventDefault();
    setProcesandoPago(true);
    setTimeout(() => {
      setProcesandoPago(false);
      setPagoCompletado(true);
    }, 2000);
  };

  const handleCrearCama = (e) => {
    e.preventDefault();
    const nueva = {
      id: Date.now(),
      invernaderoId: invernaderoSeleccionado.id,
      ...nuevaCama,
      filas_por_cama: parseInt(nuevaCama.filas_por_cama) || 2,
      largo: parseFloat(nuevaCama.largo) || 0,
      ancho: parseFloat(nuevaCama.ancho) || 0
    };
    setCamas([...camas, nueva]);
    setNuevaCama({ nombre: "", descripcion: "", variedad: "", filas_por_cama: 2, largo: "", ancho: "", responsable: "" });
    alert("Simulación: Cama creada correctamente en datos quemados.");
  };

  const handleGuardarEdicionCama = (e) => {
    e.preventDefault();
    setCamas(camas.map(c => c.id === editandoCama.id ? {
      ...editandoCama,
      filas_por_cama: parseInt(editandoCama.filas_por_cama) || 2,
      largo: parseFloat(editandoCama.largo) || 0,
      ancho: parseFloat(editandoCama.ancho) || 0
    } : c));
    setEditandoCama(null);
    alert("Simulación: Cama actualizada correctamente en datos quemados.");
  };

  const handleEliminarCama = (id) => {
    if (window.confirm("¿Seguro que deseas eliminar esta cama en la simulación?")) {
      setCamas(camas.filter(c => c.id !== id));
    }
  };

  const handleCrearPoda = (e) => {
    e.preventDefault();
    const nueva = {
      id: Date.now(),
      fecha: new Date().toLocaleDateString("es-ES"),
      ...nuevaPoda,
      tallos: parseInt(nuevaPoda.tallos) || 0
    };
    setListaMantenimientoPoda([nueva, ...listaMantenimientoPoda]);
    setNuevaPoda({ cama: "", tipo: "Limpieza", tallos: "", operario: "" });
    alert("Simulación: Registro de Poda guardado correctamente.");
  };

  const handleCrearRiego = (e) => {
    e.preventDefault();
    const nuevo = {
      id: Date.now(),
      ...nuevoRiego,
      cantidad: parseFloat(nuevoRiego.cantidad) || 0
    };
    setListaRiego([nuevo, ...listaRiego]);
    setNuevoRiego({ fecha: new Date().toISOString().split('T')[0], responsable: "", metodo: "Goteo", cantidad: "" });
    alert("Simulación: Registro de Riego guardado correctamente.");
  };

  const handleCrearCosecha = (e) => {
    e.preventDefault();
    const nueva = {
      id: Date.now(),
      fecha: new Date().toLocaleDateString("es-ES"),
      ...nuevaCosecha,
      cortados: parseInt(nuevaCosecha.cortados) || 0
    };
    setListaPodas([nueva, ...listaPodas]);
    setNuevaCosecha({ cama: "", tipo: "Freedom", cortados: "", calidad: "Largo", hora: "08:00", supervisor: "" });
    alert("Simulación: Registro de Cosecha guardado correctamente.");
  };

  // --- HELPER DE ESTILO SIDEBAR ---
  const styleLink = (current) => ({
    textDecoration: "none",
    color: seccion === current ? "#2d5a27" : "#4a5568",
    fontWeight: seccion === current ? "bold" : "normal",
  });

  const styleLi = (current) => ({
    padding: "10px 14px",
    background: seccion === current ? "#e5f0e4" : "transparent",
    borderRadius: "8px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "4px"
  });

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f4f6f4", fontFamily: "sans-serif" }}>
      
      {/* Sidebar Lateral del Ecosistema */}
      <div style={{ 
        width: sidebarVisible ? "260px" : "0px", 
        background: "white", 
        borderRight: sidebarVisible ? "1px solid #e2e8f0" : "none", 
        padding: sidebarVisible ? "20px" : "0px", 
        display: "flex", 
        flexDirection: "column", 
        justifyContent: "space-between",
        transition: "all 0.3s ease",
        overflow: "hidden",
        whiteSpace: "nowrap"
      }}>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px", marginTop: "10px" }}>
            <h3 style={{ color: "#2d5a27", display: "flex", alignItems: "center", gap: "10px", margin: 0 }}>
              <DashboardIcon /> Rosas Monitor
            </h3>
            <button onClick={() => setSidebarVisible(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#4a5568", display: "flex", alignItems: "center", justifyContent: "center", padding: "5px", borderRadius: "5px" }} title="Ocultar Sidebar">
              <MenuIcon />
            </button>
          </div>
          
          {/* Condicionar el sidebar según el rol actual */}
          <span style={{ fontSize: "0.75rem", color: "#9ca3af", fontWeight: "bold", textTransform: "uppercase", display: "block", marginBottom: "8px", paddingLeft: "10px" }}>Estructura y Personal</span>
          <ul style={{ listStyle: "none", padding: 0, margin: "0 0 20px 0" }}>
            {(rolActual === "admin" || permisosSupervisor.configuracion) && (
              <Link to="/configuracion-finca" style={styleLink("configuracion")}>
                <li style={styleLi("configuracion")}><HomeIcon /> Configuración Finca</li>
              </Link>
            )}
            {(rolActual === "admin" || permisosSupervisor.personal) && (
              <Link to="/gestion-personal" style={styleLink("personal")}>
                <li style={styleLi("personal")}><UsersIcon /> Gestión de Personal</li>
              </Link>
            )}
            {(rolActual === "admin" || permisosSupervisor.facturacion) && (
              <Link to="/membresia" style={styleLink("facturacion")}>
                <li style={styleLi("facturacion")}><CardIcon /> Facturación y Planes</li>
              </Link>
            )}
          </ul>

          <span style={{ fontSize: "0.75rem", color: "#9ca3af", fontWeight: "bold", textTransform: "uppercase", display: "block", marginBottom: "8px", paddingLeft: "10px" }}>Operaciones Agronómicas</span>
          <ul style={{ listStyle: "none", padding: 0, margin: "0 0 20px 0" }}>
            {(rolActual === "admin" || permisosSupervisor.ingreso_datos) && (
              <Link to="/web/ingreso-datos" style={styleLink("ingreso_datos")}>
                <li style={styleLi("ingreso_datos")}><UploadIcon /> Ingreso de Datos</li>
              </Link>
            )}
            {(rolActual === "admin" || permisosSupervisor.datos_consolidados) && (
              <Link to="/web/datos-consolidados" style={styleLink("datos_consolidados")}>
                <li style={styleLi("datos_consolidados")}><DatabaseIcon /> Datos Consolidados</li>
              </Link>
            )}
            {(rolActual === "admin" || permisosSupervisor.proyecciones) && (
              <Link to="/web/proyecciones" style={styleLink("proyecciones")}>
                <li style={styleLi("proyecciones")}><TrendingUpIcon /> Proyección por Cama</li>
              </Link>
            )}
            {(rolActual === "admin" || permisosSupervisor.cosecha) && (
              <Link to="/web/cosecha" style={styleLink("cosecha")}>
                <li style={styleLi("cosecha")}><LeafIcon /> Registro de Cosecha</li>
              </Link>
            )}
            {(rolActual === "admin" || permisosSupervisor.poda) && (
              <Link to="/web/poda" style={styleLink("poda")}>
                <li style={styleLi("poda")}><ScissorsIcon /> Control de Poda</li>
              </Link>
            )}
            {(rolActual === "admin" || permisosSupervisor.riego) && (
              <Link to="/web/riego" style={styleLink("riego")}>
                <li style={styleLi("riego")}><DropletIcon /> Control de Riego</li>
              </Link>
            )}
            {(rolActual === "admin" || permisosSupervisor.croquis) && (
              <Link to="/web/croquis" style={styleLink("croquis")}>
                <li style={styleLi("croquis")}><MapIcon /> Croquis de la Finca</li>
              </Link>
            )}
          </ul>

          {rolActual === "admin" && (
            <>
              <span style={{ fontSize: "0.75rem", color: "#9ca3af", fontWeight: "bold", textTransform: "uppercase", display: "block", marginBottom: "8px", paddingLeft: "10px" }}>Seguridad y Roles</span>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 20px 0" }}>
                <Link to="/web/permisos" style={styleLink("permisos")}>
                  <li style={styleLi("permisos")}><LockIcon /> Permisos de Rol</li>
                </Link>
                <Link to="/web/admin-ajustes" style={styleLink("admin_ajustes")}>
                  <li style={styleLi("admin_ajustes")}><SettingsIcon /> Ajustes de Admin</li>
                </Link>
              </ul>
            </>
          )}

          <span style={{ fontSize: "0.75rem", color: "#9ca3af", fontWeight: "bold", textTransform: "uppercase", display: "block", marginBottom: "8px", paddingLeft: "10px" }}>Demostración Móvil</span>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            <Link to="/web/movil-preview" style={styleLink("movil_preview")}>
              <li style={styleLi("movil_preview")}><SmartphoneIcon /> Simulador Móvil</li>
            </Link>
          </ul>
        </div>

        <Link to="/login" style={{ textDecoration: "none", color: "#dc2626" }}>
          <div style={{ ...styleLi("cerrar"), color: "#dc2626", fontWeight: "bold" }}><LogOutIcon /> Cerrar Sesión</div>
        </Link>
      </div>

      {/* Área de Visualización */}
      <div style={{ flex: 1, padding: sidebarVisible ? "40px" : "40px 40px 40px 80px", overflowY: "auto", transition: "all 0.3s ease", position: "relative" }}>
        
        {/* Botón para mostrar la barra lateral si está oculta */}
        {!sidebarVisible && (
          <button 
            onClick={() => setSidebarVisible(true)} 
            style={{ position: "fixed", top: "20px", left: "20px", background: "white", border: "1px solid #cbd5e1", borderRadius: "8px", padding: "10px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.1)", zIndex: 1000 }}
            title="Mostrar Sidebar"
          >
            <MenuIcon />
          </button>
        )}

        {/* Header Superior con Switch de Rol */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: "15px", marginBottom: "25px", flexWrap: "wrap", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "0.85rem", color: "#4a5568", fontWeight: "600" }}>Rol Demostración:</span>
            <div style={{ display: "flex", background: "#e2e8f0", padding: "3px", borderRadius: "8px" }}>
              <button 
                onClick={() => handleCambiarRol("admin")}
                style={{ 
                  padding: "6px 14px", 
                  borderRadius: "6px", 
                  border: "none", 
                  fontSize: "0.8rem", 
                  fontWeight: "bold", 
                  cursor: "pointer", 
                  background: rolActual === "admin" ? "#2d5a27" : "transparent",
                  color: rolActual === "admin" ? "white" : "#4a5568",
                  transition: "all 0.2s"
                }}
              >
                Vista Administrador
              </button>
              <button 
                onClick={() => handleCambiarRol("supervisor")}
                style={{ 
                  padding: "6px 14px", 
                  borderRadius: "6px", 
                  border: "none", 
                  fontSize: "0.8rem", 
                  fontWeight: "bold", 
                  cursor: "pointer", 
                  background: rolActual === "supervisor" ? "#2d5a27" : "transparent",
                  color: rolActual === "supervisor" ? "white" : "#4a5568",
                  transition: "all 0.2s"
                }}
              >
                Vista Supervisor
              </button>
            </div>
          </div>

          <div style={{ fontSize: "0.85rem", color: "#4a5568", fontWeight: "bold", display: "flex", alignItems: "center", gap: "6px" }}>
            <span>Finca Activa:</span>
            <span style={{ background: "#e5f0e4", color: "#2d5a27", padding: "4px 10px", borderRadius: "6px" }}>BellaRosa</span>
          </div>
        </div>
        
        {/* =======================================
            SECCIÓN 1: CONFIGURACIÓN FINCA
            ======================================= */}
        {seccion === "configuracion" && (
          <div>
            <h2 style={{ color: "#1a2e1a", marginBottom: "5px" }}>Estructura de la Finca</h2>
            <p style={{ color: "#666", marginBottom: "30px", marginTop: 0 }}>Gestiona invernaderos, galpones y camas de producción</p>
            
            {invernaderoSeleccionado === null ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "30px", width: "100%" }}>
                
                {/* Datos de Hacienda (BellaRosa) */}
                <div style={{ background: "white", padding: "25px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                  <h3 style={{ color: "#2d5a27", marginTop: 0, marginBottom: "20px", fontSize: "1.1rem" }}>Datos Geográficos de la Hacienda</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px" }}>
                    <div>
                      <label style={{ display: "block", marginBottom: "5px", color: "#4a5568", fontWeight: "600", fontSize: "0.85rem" }}>Tipo de Suelo</label>
                      <select 
                        value={tipoSuelo} 
                        onChange={(e) => setTipoSuelo(e.target.value)}
                        style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                      >
                        <option value="Franco-Arcilloso">Franco-Arcilloso (Nutritivo)</option>
                        <option value="Franco-Arenoso">Franco-Arenoso (Fácil filtrado)</option>
                        <option value="Limoso">Limoso (Retentivo)</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: "block", marginBottom: "5px", color: "#4a5568", fontWeight: "600", fontSize: "0.85rem" }}>Área Total (Hectáreas)</label>
                      <input 
                        type="number" 
                        value={areaTotal} 
                        onChange={(e) => setAreaTotal(e.target.value)}
                        style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", marginBottom: "5px", color: "#4a5568", fontWeight: "600", fontSize: "0.85rem" }}>Altura Promedio (msnm)</label>
                      <input 
                        type="number" 
                        value={alturaMsnm} 
                        onChange={(e) => setAlturaMsnm(e.target.value)}
                        style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "30px" }}>
                  {/* Formulario Crear Invernadero */}
                  <div style={{ background: "white", padding: "25px", borderRadius: "12px", flex: "1", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", height: "fit-content" }}>
                  <h3 style={{ color: "#2d5a27", marginTop: 0, marginBottom: "20px" }}>Añadir Invernadero / Galpón</h3>
                  <form onSubmit={handleCrearInvernadero} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                    <div>
                      <label style={{ display: "block", marginBottom: "5px", color: "#4a5568", fontWeight: "600", fontSize: "0.9rem" }}>Nombre del Invernadero</label>
                      <input type="text" placeholder="Ej: Galpón Principal" style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }} required />
                    </div>
                    <div>
                      <label style={{ display: "block", marginBottom: "5px", color: "#4a5568", fontWeight: "600", fontSize: "0.9rem" }}>Tipo de Cultivo / Variedad</label>
                      <select style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }} required>
                        <option value="">Seleccione una variedad...</option>
                        <option value="freedom">Rosa Freedom</option>
                        <option value="explorer">Rosa Explorer</option>
                      </select>
                    </div>
                    <button type="submit" style={{ background: "#2d5a27", color: "white", padding: "12px", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", marginTop: "10px" }}>
                      Guardar Invernadero
                    </button>
                  </form>
                </div>
                {/* Listado Invernaderos */}
                <div style={{ flex: "2" }}>
                  <h3 style={{ color: "#1a2e1a", marginTop: 0, marginBottom: "20px" }}>Invernaderos Registrados</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                    {invernaderos.map(inv => {
                      const camasCount = camas.filter(c => c.invernaderoId === inv.id).length;
                      return (
                        <div key={inv.id} style={{ background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center", borderLeft: "5px solid #2d5a27" }}>
                          <div>
                            <h4 style={{ margin: "0 0 5px 0", color: "#1a2e1a" }}>{inv.nombre}</h4>
                            <p style={{ margin: 0, fontSize: "0.9rem", color: "#666" }}>Cultivo: {inv.cultivo} | Camas: {camasCount}</p>
                          </div>
                          <button onClick={() => setInvernaderoSeleccionado(inv)} style={{ background: "#e5f0e4", color: "#2d5a27", border: "none", padding: "8px 15px", borderRadius: "5px", fontWeight: "bold", cursor: "pointer" }}>
                            Gestionar Camas
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ) : (
              <div>
                {/* Cabecera Camas */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <button onClick={() => { setInvernaderoSeleccionado(null); setEditandoCama(null); }} style={{ background: "white", border: "1px solid #cbd5e1", padding: "8px 15px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", color: "#2d5a27" }}>
                    ← Volver a Invernaderos
                  </button>
                  <h3 style={{ margin: 0, color: "#1a2e1a" }}>Camas en: <strong style={{ color: "#2d5a27" }}>{invernaderoSeleccionado.nombre}</strong> ({invernaderoSeleccionado.cultivo})</h3>
                </div>

                <div style={{ display: "flex", gap: "30px" }}>
                  {/* Formulario Crear/Editar Cama */}
                  <div style={{ background: "white", padding: "25px", borderRadius: "12px", flex: "1", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", height: "fit-content" }}>
                    <h3 style={{ color: "#2d5a27", marginTop: 0, marginBottom: "20px" }}>
                      {editandoCama ? "Editar Cama" : "Añadir Cama de Rosas"}
                    </h3>
                    <form onSubmit={editandoCama ? handleGuardarEdicionCama : handleCrearCama} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      <div>
                        <label style={{ display: "block", marginBottom: "5px", color: "#4a5568", fontWeight: "600", fontSize: "0.85rem" }}>Nombre de la Cama</label>
                        <input 
                          type="text" 
                          placeholder="Ej: Cama 4" 
                          value={editandoCama ? editandoCama.nombre : nuevaCama.nombre}
                          onChange={(e) => editandoCama ? setEditandoCama({...editandoCama, nombre: e.target.value}) : setNuevaCama({...nuevaCama, nombre: e.target.value})}
                          style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }} 
                          required 
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", marginBottom: "5px", color: "#4a5568", fontWeight: "600", fontSize: "0.85rem" }}>Descripción / Ubicación</label>
                        <input 
                          type="text" 
                          placeholder="Ej: Fila central izquierda" 
                          value={editandoCama ? editandoCama.descripcion : nuevaCama.descripcion}
                          onChange={(e) => editandoCama ? setEditandoCama({...editandoCama, descripcion: e.target.value}) : setNuevaCama({...nuevaCama, descripcion: e.target.value})}
                          style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }} 
                        />
                      </div>
                      <div>
                        <label style={{ display: "block", marginBottom: "5px", color: "#4a5568", fontWeight: "600", fontSize: "0.85rem" }}>Variedad sembrada</label>
                        <select 
                          value={editandoCama ? editandoCama.variedad : nuevaCama.variedad}
                          onChange={(e) => editandoCama ? setEditandoCama({...editandoCama, variedad: e.target.value}) : setNuevaCama({...nuevaCama, variedad: e.target.value})}
                          style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }} 
                          required
                        >
                          <option value="">Selecciona variedad...</option>
                          <option value="Rosas Freedom">Rosas Freedom</option>
                          <option value="Rosas Explorer">Rosas Explorer</option>
                        </select>
                      </div>

                      <div style={{ display: "flex", gap: "10px" }}>
                        <div style={{ flex: 1 }}>
                          <label style={{ display: "block", marginBottom: "5px", color: "#4a5568", fontWeight: "600", fontSize: "0.85rem" }}>Filas Cama</label>
                          <input 
                            type="number" 
                            placeholder="2" 
                            value={editandoCama ? editandoCama.filas_por_cama : nuevaCama.filas_por_cama}
                            onChange={(e) => editandoCama ? setEditandoCama({...editandoCama, filas_por_cama: e.target.value}) : setNuevaCama({...nuevaCama, filas_por_cama: e.target.value})}
                            style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }} 
                            required 
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <label style={{ display: "block", marginBottom: "5px", color: "#4a5568", fontWeight: "600", fontSize: "0.85rem" }}>Largo (m)</label>
                          <input 
                            type="number" 
                            step="0.1"
                            placeholder="50" 
                            value={editandoCama ? editandoCama.largo : nuevaCama.largo}
                            onChange={(e) => editandoCama ? setEditandoCama({...editandoCama, largo: e.target.value}) : setNuevaCama({...nuevaCama, largo: e.target.value})}
                            style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }} 
                            required 
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <label style={{ display: "block", marginBottom: "5px", color: "#4a5568", fontWeight: "600", fontSize: "0.85rem" }}>Ancho (m)</label>
                          <input 
                            type="number" 
                            step="0.1"
                            placeholder="1.2" 
                            value={editandoCama ? editandoCama.ancho : nuevaCama.ancho}
                            onChange={(e) => editandoCama ? setEditandoCama({...editandoCama, ancho: e.target.value}) : setNuevaCama({...nuevaCama, ancho: e.target.value})}
                            style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }} 
                            required 
                          />
                        </div>
                      </div>

                      <div style={{ display: "flex", gap: "10px" }}>
                        <div style={{ flex: 1 }}>
                          <label style={{ display: "block", marginBottom: "5px", color: "#4a5568", fontWeight: "600", fontSize: "0.85rem" }}>Fecha de Siembra</label>
                          <input 
                            type="date" 
                            value={editandoCama ? editandoCama.fecha_siembra || "" : nuevaCama.fecha_siembra || ""}
                            onChange={(e) => editandoCama ? setEditandoCama({...editandoCama, fecha_siembra: e.target.value}) : setNuevaCama({...nuevaCama, fecha_siembra: e.target.value})}
                            style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }} 
                            required
                          />
                        </div>
                        <div style={{ flex: 1 }}>
                          <label style={{ display: "block", marginBottom: "5px", color: "#4a5568", fontWeight: "600", fontSize: "0.85rem" }}>Densidad (Plantas)</label>
                          <input 
                            type="number" 
                            placeholder="Ej: 1200" 
                            value={editandoCama ? editandoCama.densidad || "" : nuevaCama.densidad || ""}
                            onChange={(e) => editandoCama ? setEditandoCama({...editandoCama, densidad: e.target.value}) : setNuevaCama({...nuevaCama, densidad: e.target.value})}
                            style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }} 
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label style={{ display: "block", marginBottom: "5px", color: "#4a5568", fontWeight: "600", fontSize: "0.85rem" }}>Operador Asignado (Responsable)</label>
                        <select 
                          value={editandoCama ? editandoCama.responsable : nuevaCama.responsable}
                          onChange={(e) => editandoCama ? setEditandoCama({...editandoCama, responsable: e.target.value}) : setNuevaCama({...nuevaCama, responsable: e.target.value})}
                          style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }} 
                          required
                        >
                          <option value="">Selecciona operador...</option>
                          {supervisores.map(s => <option key={s.id} value={s.nombre}>{s.nombre} (Supervisor)</option>)}
                          {trabajadores.map(t => <option key={t.id} value={t.nombre}>{t.nombre} (Trabajador)</option>)}
                        </select>
                      </div>

                      <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                        {editandoCama && (
                          <button type="button" onClick={() => setEditandoCama(null)} style={{ flex: 1, padding: "12px", background: "#f4f6f4", border: "1px solid #cbd5e1", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}>
                            Cancelar
                          </button>
                        )}
                        <button type="submit" style={{ flex: 2, background: "#2d5a27", color: "white", padding: "12px", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}>
                          {editandoCama ? "Guardar Cambios" : "Guardar Cama"}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Listado de Camas de este Invernadero */}
                  <div style={{ flex: "1.5", display: "flex", flexDirection: "column", gap: "15px" }}>
                    <h3 style={{ color: "#1a2e1a", marginTop: 0, marginBottom: "5px" }}>Camas Registradas</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {camas.filter(c => c.invernaderoId === invernaderoSeleccionado.id).map(cama => (
                        <div key={cama.id} style={{ background: "white", padding: "15px", borderRadius: "10px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", borderLeft: "5px solid #2d5a27" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                            <div>
                              <h4 style={{ margin: 0, color: "#1a2e1a" }}>{cama.nombre} <span style={{ fontSize: "0.8rem", color: "#666", fontWeight: "normal" }}>({cama.variedad})</span></h4>
                              <p style={{ margin: "3px 0 0 0", fontSize: "0.85rem", color: "#777" }}>{cama.descripcion || "Sin descripción"}</p>
                            </div>
                            <div style={{ display: "flex", gap: "5px" }}>
                              <button onClick={() => setEditandoCama(cama)} style={{ background: "#e5f0e4", color: "#2d5a27", border: "none", padding: "5px 10px", borderRadius: "4px", fontSize: "0.8rem", fontWeight: "bold", cursor: "pointer" }}>Editar</button>
                              <button onClick={() => handleEliminarCama(cama.id)} style={{ background: "#fef2f2", color: "#dc2626", border: "none", padding: "5px 10px", borderRadius: "4px", fontSize: "0.8rem", fontWeight: "bold", cursor: "pointer" }}>Eliminar</button>
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: "15px", fontSize: "0.8rem", color: "#555", marginTop: "10px", borderTop: "1px solid #f0f4f0", paddingTop: "10px", flexWrap: "wrap" }}>
                            <span>Filas: <strong>{cama.filas_por_cama}</strong></span>
                            <span>Largo: <strong>{cama.largo}m</strong></span>
                            <span>Ancho: <strong>{cama.ancho}m</strong></span>
                            <span>Siembra: <strong>{cama.fecha_siembra || "2026-05-10"}</strong></span>
                            <span>Densidad: <strong>{cama.densidad || "1200"} pl.</strong></span>
                          </div>
                          <div style={{ marginTop: "8px", background: "#e5f0e4", color: "#2d5a27", display: "inline-block", padding: "3px 8px", borderRadius: "4px", fontSize: "0.8rem", fontWeight: "bold" }}>
                            Responsable: {cama.responsable || "Sin asignar"}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* =======================================
            SECCIÓN 2: GESTIÓN DE PERSONAL (MOCK CON CUADROS ALINEADOS EN GRID)
            ======================================= */}
        {seccion === "personal" && (
          <div>
            <h2 style={{ color: "#1a2e1a", marginBottom: "5px" }}>Gestión de Personal</h2>
            <p style={{ color: "#666", marginBottom: "30px", marginTop: 0 }}>Registra supervisores y trabajadores móviles</p>
            <div style={{ display: "flex", gap: "30px" }}>
              
              {/* Formulario en Cuadrícula (Grid) */}
              <div style={{ background: "white", padding: "25px", borderRadius: "12px", flex: "1", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", height: "fit-content" }}>
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

                <form onSubmit={handleCrearPersonal} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={{ display: "block", marginBottom: "5px", color: "#4a5568", fontWeight: "600", fontSize: "0.85rem" }}>Nombre Completo</label>
                    <input type="text" placeholder="Ej: Juan Pérez" style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }} required />
                  </div>

                  <div>
                    <label style={{ display: "block", marginBottom: "5px", color: "#4a5568", fontWeight: "600", fontSize: "0.85rem" }}>Cédula / Identificación</label>
                    <input type="text" placeholder="Ej: 1724567890" style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }} required />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "5px", color: "#4a5568", fontWeight: "600", fontSize: "0.85rem" }}>Contacto (Teléfono)</label>
                    <input type="tel" placeholder="Ej: 0998765432" style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }} required />
                  </div>

                  <div>
                    <label style={{ display: "block", marginBottom: "5px", color: "#4a5568", fontWeight: "600", fontSize: "0.85rem" }}>Tipo de Contratación</label>
                    <select style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }} required>
                      <option value="Interna (Planta)">Interna (Planta)</option>
                      <option value="Servicios Externos">Servicios Externos (Servicios)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "5px", color: "#4a5568", fontWeight: "600", fontSize: "0.85rem" }}>Sueldo Mensual ($)</label>
                    <input type="number" placeholder="Ej: 850" style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }} required />
                  </div>

                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={{ display: "block", marginBottom: "5px", color: "#4a5568", fontWeight: "600", fontSize: "0.85rem" }}>Dirección Domiciliaria</label>
                    <input type="text" placeholder="Ej: Vía Cayambe Km 4" style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }} required />
                  </div>

                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={{ display: "block", marginBottom: "5px", color: "#4a5568", fontWeight: "600", fontSize: "0.85rem" }}>Nivel de Conocimiento / Capacitación</label>
                    <select style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }} required>
                      <option value="Principiante">Principiante (Inducción)</option>
                      <option value="Intermedio">Intermedio</option>
                      <option value="Experto">Experto / Capacitador</option>
                    </select>
                  </div>

                  {tipoFormulario === "supervisor" ? (
                    <>
                      <div style={{ gridColumn: "1 / -1" }}>
                        <label style={{ display: "block", marginBottom: "5px", color: "#4a5568", fontWeight: "600", fontSize: "0.85rem" }}>Galpones Asignados</label>
                        <select style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }} required>
                          <option value="">Seleccione un galpón...</option>
                          <option value="norte">Galpón Norte</option>
                          <option value="sur">Galpón Sur</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: "block", marginBottom: "5px", color: "#4a5568", fontWeight: "600", fontSize: "0.85rem" }}>Usuario (Correo)</label>
                        <input type="email" placeholder="usuario@finca.com" style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }} required />
                      </div>
                      <div>
                        <label style={{ display: "block", marginBottom: "5px", color: "#4a5568", fontWeight: "600", fontSize: "0.85rem" }}>Contraseña Web</label>
                        <input type="password" style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }} required />
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <label style={{ display: "block", marginBottom: "5px", color: "#4a5568", fontWeight: "600", fontSize: "0.85rem" }}>Supervisor a Cargo</label>
                        <select style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }} required>
                          <option value="">Seleccione supervisor...</option>
                          <option value="1">Carlos Mendoza</option>
                          <option value="2">Ana Torres</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: "block", marginBottom: "5px", color: "#4a5568", fontWeight: "600", fontSize: "0.85rem" }}>Responsabilidad (Camas)</label>
                        <select style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }} required>
                          <option value="">Seleccione asignación...</option>
                          <option value="1">Galpón Norte - Camas 1 a 5</option>
                          <option value="2">Galpón Sur - Camas 1 a 3</option>
                        </select>
                      </div>
                      <div style={{ gridColumn: "1 / -1" }}>
                        <label style={{ display: "block", marginBottom: "5px", color: "#4a5568", fontWeight: "600", fontSize: "0.85rem" }}>PIN Móvil (4 dígitos)</label>
                        <input type="text" maxLength="4" placeholder="Ej: 1234" style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }} required />
                      </div>
                    </>
                  )}

                  <button type="submit" style={{ gridColumn: "1 / -1", background: "#2d5a27", color: "white", padding: "12px", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", marginTop: "10px" }}>
                    Guardar Personal
                  </button>
                </form>
              </div>

              {/* Listado con atributos completos */}
              <div style={{ flex: "1.5", display: "flex", flexDirection: "column", gap: "20px" }}>
                <div>
                  <h3 style={{ color: "#1a2e1a", marginTop: 0, marginBottom: "15px", borderBottom: "2px solid #cbd5e1", paddingBottom: "8px" }}>Supervisores</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {supervisores.map(sup => (
                      <div key={sup.id} style={{ background: "white", padding: "15px", borderRadius: "8px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", borderLeft: "4px solid #2d5a27", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <h4 style={{ margin: "0 0 5px 0", display: "flex", alignItems: "center", gap: "8px" }}>
                            {sup.nombre}
                            <span style={{ fontSize: "0.7rem", background: sup.estado === "Activo" ? "#d1fae5" : "#fee2e2", color: sup.estado === "Activo" ? "#065f46" : "#991b1b", padding: "2px 6px", borderRadius: "4px", fontWeight: "bold" }}>
                              {sup.estado}
                            </span>
                          </h4>
                          <p style={{ margin: 0, fontSize: "0.85rem", color: "#555" }}>Usuario: {sup.usuario} | Galpón: {sup.galpones}</p>
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
                  <h3 style={{ color: "#1a2e1a", marginTop: 0, marginBottom: "15px", borderBottom: "2px solid #cbd5e1", paddingBottom: "8px" }}>Trabajadores móviles</h3>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {trabajadores.map(trab => (
                      <div key={trab.id} style={{ background: "white", padding: "15px", borderRadius: "8px", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", borderLeft: "4px solid #3b82f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <h4 style={{ margin: "0 0 5px 0", display: "flex", alignItems: "center", gap: "8px" }}>
                            {trab.nombre}
                            <span style={{ fontSize: "0.7rem", background: trab.estado === "Activo" ? "#d1fae5" : "#fee2e2", color: trab.estado === "Activo" ? "#065f46" : "#991b1b", padding: "2px 6px", borderRadius: "4px", fontWeight: "bold" }}>
                              {trab.estado}
                            </span>
                          </h4>
                          <p style={{ margin: 0, fontSize: "0.85rem", color: "#555" }}>Camas: {trab.asignacion} | Supervisor: {trab.supervisor}</p>
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
        )}

        {/* =======================================
            SECCIÓN 3: INGRESO DE DATOS (MOCK COMPLETO)
            ======================================= */}
        {seccion === "ingreso_datos" && (
          <div>
            <h2 style={{ color: "#1a2e1a", marginBottom: "5px" }}>Ingreso de Datos</h2>
            <p style={{ color: "#666", marginBottom: "30px", marginTop: 0 }}>Sube un video para analizar una cama</p>
            
            <div style={{ background: "white", padding: "30px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", maxWidth: "700px", margin: "0 auto" }}>
              <form onSubmit={handleSimularSubida} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>Seleccionar Cama</label>
                  <select style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
                    <option value="1">Cama 1 - Explorer (Galpón Norte)</option>
                    <option value="2">Cama 2 - Freedom (Galpón Sur)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>Subir Video de Evidencia (Lado A y B)</label>
                  <div style={{ border: "2px dashed #aac9a0", background: "#f9fcf9", padding: "40px", borderRadius: "12px", textAlign: "center", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2d5a27" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: "10px" }}>
                      <path d="M23 7a2 2 0 0 0-2.45-1.45L16 7V5a2 2 0 0 0-2-2H2a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2l4.55 1.45A2 2 0 0 0 23 17V7z"></path>
                    </svg>
                    <p style={{ margin: "10px 0 0 0", color: "#2d5a27", fontWeight: "bold" }}>Selecciona o arrastra el video de la cama</p>
                    <small style={{ color: "#777" }}>Formatos recomendados: MP4, MOV. Tamaño máximo: 150MB</small>
                  </div>
                </div>

                <button type="submit" disabled={cargandoEnvio} style={{ background: "#2d5a27", color: "white", padding: "15px", border: "none", borderRadius: "8px", fontSize: "1.1rem", fontWeight: "bold", cursor: "pointer" }}>
                  {cargandoEnvio ? "Procesando video con IA..." : "Analizar con Claude Vision"}
                </button>
              </form>

              {cargandoEnvio && (
                <div style={{ marginTop: "20px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px", fontWeight: "bold", color: "#2d5a27" }}>
                    <span>Progreso del censo</span>
                    <span>{progresoEnvio}%</span>
                  </div>
                  <div style={{ width: "100%", height: "10px", background: "#e5f0e4", borderRadius: "10px", overflow: "hidden" }}>
                    <div style={{ width: `${progresoEnvio}%`, height: "100%", background: "#2d5a27", transition: "width 0.2s" }}></div>
                  </div>
                </div>
              )}

              {mostrarResultadoMock && (
                <div style={{ marginTop: "30px", borderTop: "2px solid #f0f4f0", paddingTop: "20px" }}>
                  <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
                    <div style={{ flex: 1, background: "#e5f0e4", color: "#2d5a27", padding: "15px", borderRadius: "8px", textAlign: "center" }}>
                      <span style={{ fontSize: "0.85rem", fontWeight: "bold" }}>TALLOS ENCONTRADOS</span>
                      <h2 style={{ margin: "5px 0 0 0" }}>106</h2>
                    </div>
                    <div style={{ flex: 1, background: "#fef3c7", color: "#b45309", padding: "15px", borderRadius: "8px", textAlign: "center" }}>
                      <span style={{ fontSize: "0.85rem", fontWeight: "bold" }}>CONFIDENCE SCORE</span>
                      <h2 style={{ margin: "5px 0 0 0" }}>94.6%</h2>
                    </div>
                  </div>

                  <h4 style={{ color: "#2d5a27", margin: "0 0 10px 0" }}>Distribución por Etapas de Botón (Simulado)</h4>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
                    <thead>
                      <tr style={{ background: "#f4f6f4", borderBottom: "2px solid #aac9a0", textAlign: "left" }}>
                        <th style={{ padding: "8px" }}>Categoría</th>
                        <th style={{ padding: "8px" }}>Largo</th>
                        <th style={{ padding: "8px" }}>Medio</th>
                        <th style={{ padding: "8px" }}>Corto</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                        <td style={{ padding: "8px", fontWeight: "bold" }}>Cosecha</td>
                        <td style={{ padding: "8px" }}>24</td>
                        <td style={{ padding: "8px" }}>12</td>
                        <td style={{ padding: "8px" }}>5</td>
                      </tr>
                      <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                        <td style={{ padding: "8px", fontWeight: "bold" }}>Estrella</td>
                        <td style={{ padding: "8px" }}>18</td>
                        <td style={{ padding: "8px" }}>8</td>
                        <td style={{ padding: "8px" }}>2</td>
                      </tr>
                      <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                        <td style={{ padding: "8px", fontWeight: "bold" }}>Garbanzo</td>
                        <td style={{ padding: "8px" }}>15</td>
                        <td style={{ padding: "8px" }}>10</td>
                        <td style={{ padding: "8px" }}>12</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* =======================================
            SECCIÓN 4: DATOS CONSOLIDADOS (MOCK COMPLETO)
            ======================================= */}
        {seccion === "datos_consolidados" && (
          <div>
            <h2 style={{ color: "#1a2e1a", marginBottom: "5px" }}>Datos Consolidados</h2>
            <p style={{ color: "#666", marginBottom: "30px", marginTop: 0 }}>Historial de censos aprobados en campo</p>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
              <div style={{ background: "white", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", overflow: "hidden" }}>
                <div style={{ background: "#2d5a27", color: "white", padding: "15px 20px", fontWeight: "bold", fontSize: "1.1rem" }}>
                  Cama 1 — Explorer (Censo Realizado: Hoy 17:15)
                </div>
                <div style={{ padding: "20px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "15px", marginBottom: "20px" }}>
                    <div style={{ border: "1px solid #cbd5e1", padding: "15px", borderRadius: "8px", textAlign: "center" }}>
                      <span style={{ fontSize: "0.8rem", color: "#666" }}>Total Tallos</span>
                      <h3 style={{ margin: "5px 0 0 0" }}>115</h3>
                    </div>
                    <div style={{ border: "1px solid #cbd5e1", padding: "15px", borderRadius: "8px", textAlign: "center" }}>
                      <span style={{ fontSize: "0.8rem", color: "#666" }}>Tallos con Botón</span>
                      <h3 style={{ margin: "5px 0 0 0", color: "#2d5a27" }}>106</h3>
                    </div>
                    <div style={{ border: "1px solid #cbd5e1", padding: "15px", borderRadius: "8px", textAlign: "center" }}>
                      <span style={{ fontSize: "0.8rem", color: "#666" }}>Etapa Dominante</span>
                      <h3 style={{ margin: "5px 0 0 0" }}>Cosecha</h3>
                    </div>
                    <div style={{ border: "1px solid #cbd5e1", padding: "15px", borderRadius: "8px", textAlign: "center" }}>
                      <span style={{ fontSize: "0.8rem", color: "#666" }}>Tallos Ciegos</span>
                      <h3 style={{ margin: "5px 0 0 0" }}>9</h3>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ background: "white", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", overflow: "hidden" }}>
                <div style={{ background: "#2d5a27", color: "white", padding: "15px 20px", fontWeight: "bold", fontSize: "1.1rem" }}>
                  Cama 2 — Freedom (Censo Realizado: Ayer 14:30)
                </div>
                <div style={{ padding: "20px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "15px", marginBottom: "20px" }}>
                    <div style={{ border: "1px solid #cbd5e1", padding: "15px", borderRadius: "8px", textAlign: "center" }}>
                      <span style={{ fontSize: "0.8rem", color: "#666" }}>Total Tallos</span>
                      <h3 style={{ margin: "5px 0 0 0" }}>103</h3>
                    </div>
                    <div style={{ border: "1px solid #cbd5e1", padding: "15px", borderRadius: "8px", textAlign: "center" }}>
                      <span style={{ fontSize: "0.8rem", color: "#666" }}>Tallos con Botón</span>
                      <h3 style={{ margin: "5px 0 0 0", color: "#2d5a27" }}>95</h3>
                    </div>
                    <div style={{ border: "1px solid #cbd5e1", padding: "15px", borderRadius: "8px", textAlign: "center" }}>
                      <span style={{ fontSize: "0.8rem", color: "#666" }}>Etapa Dominante</span>
                      <h3 style={{ margin: "5px 0 0 0" }}>Garbanzo</h3>
                    </div>
                    <div style={{ border: "1px solid #cbd5e1", padding: "15px", borderRadius: "8px", textAlign: "center" }}>
                      <span style={{ fontSize: "0.8rem", color: "#666" }}>Tallos Ciegos</span>
                      <h3 style={{ margin: "5px 0 0 0" }}>8</h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =======================================
            SECCIÓN 5: PROYECCIÓN POR CAMA (GRAFICO DE BARRAS CSS)
            ======================================= */}
        {seccion === "proyecciones" && (
          <div>
            <h2 style={{ color: "#1a2e1a", marginBottom: "5px" }}>Proyección de Cosecha</h2>
            <p style={{ color: "#666", marginBottom: "30px", marginTop: 0 }}>Proyección estimada de tallos listos para corte (próximos 14 días)</p>
            
            <div style={{ background: "white", padding: "30px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              <h3 style={{ color: "#2d5a27", marginTop: 0, marginBottom: "20px" }}>Cama 1 - Variedad: Explorer (Proyecciones de Corte)</h3>
              
              {/* Gráfico de Barras CSS Simulado de alta calidad */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", height: "300px", borderBottom: "2px solid #cbd5e1", paddingBottom: "10px", marginTop: "40px" }}>
                <Bar height="40%" label="Día 1" count="15" />
                <Bar height="55%" label="Día 2" count="22" />
                <Bar height="80%" label="Día 3" count="35" />
                <Bar height="95%" label="Día 4" count="42" />
                <Bar height="70%" label="Día 5" count="29" />
                <Bar height="45%" label="Día 6" count="18" />
                <Bar height="30%" label="Día 7" count="11" />
                <Bar height="50%" label="Día 8" count="20" />
                <Bar height="65%" label="Día 9" count="26" />
                <Bar height="90%" label="Día 10" count="38" />
                <Bar height="85%" label="Día 11" count="36" />
                <Bar height="60%" label="Día 12" count="25" />
                <Bar height="40%" label="Día 13" count="14" />
                <Bar height="20%" label="Día 14" count="8" />
              </div>
            </div>
          </div>
        )}

        {/* =======================================
            SECCIÓN 6: REGISTRO DE COSECHA
            ======================================= */}
        {seccion === "cosecha" && (
          <div>
            <h2 style={{ color: "#1a2e1a", marginBottom: "5px" }}>Registro de Cosecha</h2>
            <p style={{ color: "#666", marginBottom: "30px", marginTop: 0 }}>Historial de tallos comerciales recolectados y listos para exportación</p>
            
            <div style={{ display: "flex", gap: "30px", flexWrap: "wrap" }}>
              
              {/* Formulario de Cosecha */}
              <div style={{ background: "white", padding: "25px", borderRadius: "12px", flex: "1", minWidth: "300px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", height: "fit-content" }}>
                <h3 style={{ color: "#2d5a27", marginTop: 0, marginBottom: "20px", fontSize: "1.1rem" }}>Registrar Cosecha Comercial</h3>
                <form onSubmit={handleCrearCosecha} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "5px", color: "#4a5568", fontWeight: "600", fontSize: "0.85rem" }}>Seleccionar Cama</label>
                    <select 
                      value={nuevaCosecha.cama}
                      onChange={(e) => setNuevaCosecha({ ...nuevaCosecha, cama: e.target.value })}
                      style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" }} 
                      required
                    >
                      <option value="">Seleccione una cama...</option>
                      <option value="Cama 1-1">Cama 1-1 (Norte)</option>
                      <option value="Cama 1-2">Cama 1-2 (Norte)</option>
                      <option value="Cama 1-3">Cama 1-3 (Norte)</option>
                      <option value="Cama 2-1">Cama 2-1 (Sur)</option>
                      <option value="Cama 2-2">Cama 2-2 (Sur)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", marginBottom: "5px", color: "#4a5568", fontWeight: "600", fontSize: "0.85rem" }}>Variedad de Rosa</label>
                    <select 
                      value={nuevaCosecha.tipo}
                      onChange={(e) => setNuevaCosecha({ ...nuevaCosecha, tipo: e.target.value })}
                      style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" }} 
                      required
                    >
                      <option value="Freedom">Rosa Freedom</option>
                      <option value="Explorer">Rosa Explorer</option>
                      <option value="Mondial">Rosa Mondial</option>
                      <option value="Sweetness">Rosa Sweetness</option>
                    </select>
                  </div>

                  <div style={{ display: "flex", gap: "10px" }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: "block", marginBottom: "5px", color: "#4a5568", fontWeight: "600", fontSize: "0.85rem" }}>Cantidad Tallos</label>
                      <input 
                        type="number" 
                        placeholder="Ej: 200" 
                        value={nuevaCosecha.cortados}
                        onChange={(e) => setNuevaCosecha({ ...nuevaCosecha, cortados: e.target.value })}
                        style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }} 
                        required 
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: "block", marginBottom: "5px", color: "#4a5568", fontWeight: "600", fontSize: "0.85rem" }}>Calidad (Largo)</label>
                      <select 
                        value={nuevaCosecha.calidad}
                        onChange={(e) => setNuevaCosecha({ ...nuevaCosecha, calidad: e.target.value })}
                        style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" }} 
                        required
                      >
                        <option value="Largo">Largo (70-80cm)</option>
                        <option value="Medio">Medio (50-60cm)</option>
                        <option value="Corto">Corto (40cm)</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "10px" }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: "block", marginBottom: "5px", color: "#4a5568", fontWeight: "600", fontSize: "0.85rem" }}>Hora de Corte</label>
                      <input 
                        type="time" 
                        value={nuevaCosecha.hora}
                        onChange={(e) => setNuevaCosecha({ ...nuevaCosecha, hora: e.target.value })}
                        style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }} 
                        required 
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: "block", marginBottom: "5px", color: "#4a5568", fontWeight: "600", fontSize: "0.85rem" }}>Responsable</label>
                      <select 
                        value={nuevaCosecha.supervisor}
                        onChange={(e) => setNuevaCosecha({ ...nuevaCosecha, supervisor: e.target.value })}
                        style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" }} 
                        required
                      >
                        <option value="">Seleccione...</option>
                        {supervisores.map(s => <option key={s.id} value={s.nombre}>{s.nombre}</option>)}
                      </select>
                    </div>
                  </div>

                  <button type="submit" style={{ background: "#2d5a27", color: "white", padding: "12px", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", marginTop: "10px" }}>
                    Guardar Registro de Cosecha
                  </button>
                </form>
              </div>

              {/* Historial de Cosechas */}
              <div style={{ flex: "2", minWidth: "400px" }}>
                <div style={{ background: "white", padding: "25px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                  <h3 style={{ color: "#1a2e1a", marginTop: 0, marginBottom: "20px", fontSize: "1.1rem" }}>Historial de Tallos Cortados</h3>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
                    <thead>
                      <tr style={{ borderBottom: "2px solid #aac9a0", color: "#2d5a27", fontWeight: "bold" }}>
                        <th style={{ padding: "12px" }}>Fecha / Hora</th>
                        <th style={{ padding: "12px" }}>Cama / Variedad</th>
                        <th style={{ padding: "12px" }}>Tallos Comerciales</th>
                        <th style={{ padding: "12px" }}>Calidad</th>
                        <th style={{ padding: "12px" }}>Responsable</th>
                      </tr>
                    </thead>
                    <tbody>
                      {listaPodas.map(poda => (
                        <tr key={poda.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                          <td style={{ padding: "12px" }}>
                            <div style={{ fontWeight: "bold" }}>{poda.fecha}</div>
                            <div style={{ fontSize: "0.75rem", color: "#666" }}>Hora: {poda.hora || "08:15"}</div>
                          </td>
                          <td style={{ padding: "12px" }}>
                            <div style={{ fontWeight: "bold" }}>{poda.cama}</div>
                            <div style={{ fontSize: "0.75rem", color: "#666" }}>Rosa: {poda.tipo || "Freedom"}</div>
                          </td>
                          <td style={{ padding: "12px", color: "#2d5a27", fontWeight: "bold" }}>{poda.cortados} tallos</td>
                          <td style={{ padding: "12px" }}>
                            <span style={{ 
                              background: poda.calidad === "Largo" ? "#d1fae5" : poda.calidad === "Medio" ? "#ffedd5" : "#f1f5f9", 
                              color: poda.calidad === "Largo" ? "#065f46" : poda.calidad === "Medio" ? "#9a3412" : "#475569", 
                              padding: "3px 8px", 
                              borderRadius: "4px", 
                              fontSize: "0.8rem",
                              fontWeight: "bold"
                            }}>
                              {poda.calidad || "Largo"}
                            </span>
                          </td>
                          <td style={{ padding: "12px" }}>{poda.supervisor}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* =======================================
            SECCIÓN 10: CONTROL DE PODA (NUEVO)
            ======================================= */}
        {seccion === "poda" && (
          <div>
            <h2 style={{ color: "#1a2e1a", marginBottom: "5px" }}>Control de Poda y Mantenimiento</h2>
            <p style={{ color: "#666", marginBottom: "30px", marginTop: 0 }}>Gestión fitosanitaria y limpieza de arbustos (tallos de desecho)</p>
            
            <div style={{ display: "flex", gap: "30px", flexWrap: "wrap" }}>
              
              {/* Formulario de Poda */}
              <div style={{ background: "white", padding: "25px", borderRadius: "12px", flex: "1", minWidth: "300px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", height: "fit-content" }}>
                <h3 style={{ color: "#2d5a27", marginTop: 0, marginBottom: "20px", fontSize: "1.1rem" }}>Registrar Poda Manual</h3>
                <form onSubmit={handleCrearPoda} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "5px", color: "#4a5568", fontWeight: "600", fontSize: "0.85rem" }}>Seleccionar Cama</label>
                    <select 
                      value={nuevaPoda.cama}
                      onChange={(e) => setNuevaPoda({ ...nuevaPoda, cama: e.target.value })}
                      style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" }} 
                      required
                    >
                      <option value="">Seleccione una cama...</option>
                      <option value="Cama 1-1">Cama 1-1 (Norte)</option>
                      <option value="Cama 1-2">Cama 1-2 (Norte)</option>
                      <option value="Cama 1-3">Cama 1-3 (Norte)</option>
                      <option value="Cama 2-1">Cama 2-1 (Sur)</option>
                      <option value="Cama 2-2">Cama 2-2 (Sur)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", marginBottom: "5px", color: "#4a5568", fontWeight: "600", fontSize: "0.85rem" }}>Tipo de Poda</label>
                    <select 
                      value={nuevaPoda.tipo}
                      onChange={(e) => setNuevaPoda({ ...nuevaPoda, tipo: e.target.value })}
                      style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" }} 
                      required
                    >
                      <option value="Limpieza">Poda de Limpieza (Desbrote)</option>
                      <option value="Formación">Poda de Formación</option>
                      <option value="Fitosanitaria">Poda Fitosanitaria (Enfermedades)</option>
                      <option value="Rejuvenecimiento">Poda de Rejuvenecimiento</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", marginBottom: "5px", color: "#4a5568", fontWeight: "600", fontSize: "0.85rem" }}>Tallos Podados / Desechados</label>
                    <input 
                      type="number" 
                      placeholder="Ej: 50" 
                      value={nuevaPoda.tallos}
                      onChange={(e) => setNuevaPoda({ ...nuevaPoda, tallos: e.target.value })}
                      style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }} 
                      required 
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", marginBottom: "5px", color: "#4a5568", fontWeight: "600", fontSize: "0.85rem" }}>Operario Responsable</label>
                    <select 
                      value={nuevaPoda.operario}
                      onChange={(e) => setNuevaPoda({ ...nuevaPoda, operario: e.target.value })}
                      style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" }} 
                      required
                    >
                      <option value="">Seleccione operario...</option>
                      {trabajadores.map(t => <option key={t.id} value={t.nombre}>{t.nombre}</option>)}
                      {supervisores.map(s => <option key={s.id} value={s.nombre}>{s.nombre} (Sup.)</option>)}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", marginBottom: "5px", color: "#4a5568", fontWeight: "600", fontSize: "0.85rem" }}>Notas (Plagas / Incidencias)</label>
                    <textarea 
                      placeholder="Ej: Se detectó presencia leve de araña roja." 
                      value={nuevaPoda.notas || ""}
                      onChange={(e) => setNuevaPoda({ ...nuevaPoda, notas: e.target.value })}
                      style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box", height: "60px", fontFamily: "sans-serif" }}
                    />
                  </div>

                  <button type="submit" style={{ background: "#2d5a27", color: "white", padding: "12px", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", marginTop: "10px" }}>
                    Guardar Registro de Poda
                  </button>
                </form>
              </div>

              {/* Historial de Podas */}
              <div style={{ flex: "2", minWidth: "400px" }}>
                <div style={{ background: "white", padding: "25px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                  <h3 style={{ color: "#1a2e1a", marginTop: 0, marginBottom: "20px", fontSize: "1.1rem" }}>Historial de Mantenimiento (Limpieza)</h3>
                  
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
                    <thead>
                      <tr style={{ borderBottom: "2px solid #aac9a0", color: "#2d5a27", fontWeight: "bold" }}>
                        <th style={{ padding: "12px" }}>Fecha</th>
                        <th style={{ padding: "12px" }}>Cama</th>
                        <th style={{ padding: "12px" }}>Tipo de Poda</th>
                        <th style={{ padding: "12px" }}>Tallos Removidos</th>
                        <th style={{ padding: "12px" }}>Operario</th>
                      </tr>
                    </thead>
                    <tbody>
                      {listaMantenimientoPoda.map(item => (
                        <tr key={item.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                          <td style={{ padding: "12px" }}>{item.fecha}</td>
                          <td style={{ padding: "12px" }}>
                            <div style={{ fontWeight: "bold" }}>{item.cama}</div>
                            {item.notas && <div style={{ fontSize: "0.72rem", color: "#ef4444", fontStyle: "italic", marginTop: "2px" }}>Nota: {item.notas}</div>}
                          </td>
                          <td style={{ padding: "12px" }}>
                            <span style={{ 
                              background: item.tipo === "Fitosanitaria" ? "#fee2e2" : "#f1f5f9", 
                              color: item.tipo === "Fitosanitaria" ? "#dc2626" : "#475569", 
                              padding: "3px 8px", 
                              borderRadius: "4px", 
                              fontSize: "0.8rem",
                              fontWeight: "bold"
                            }}>
                              {item.tipo}
                            </span>
                          </td>
                          <td style={{ padding: "12px", color: "#d97706", fontWeight: "bold" }}>{item.tallos} tallos</td>
                          <td style={{ padding: "12px" }}>{item.operario}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* =======================================
            SECCIÓN 11: CONTROL DE RIEGO (NUEVO)
            ======================================= */}
        {seccion === "riego" && (
          <div>
            <h2 style={{ color: "#1a2e1a", marginBottom: "5px" }}>Control de Riego</h2>
            <p style={{ color: "#666", marginBottom: "30px", marginTop: 0 }}>Gestión hídrica, dosificación de agua en camas de producción</p>
            
            <div style={{ display: "flex", gap: "30px", flexWrap: "wrap" }}>
              
              {/* Formulario de Riego */}
              <div style={{ background: "white", padding: "25px", borderRadius: "12px", flex: "1", minWidth: "300px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", height: "fit-content" }}>
                <h3 style={{ color: "#2d5a27", marginTop: 0, marginBottom: "20px", fontSize: "1.1rem" }}>Registrar Riego</h3>
                <form onSubmit={handleCrearRiego} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                  <div>
                    <label style={{ display: "block", marginBottom: "5px", color: "#4a5568", fontWeight: "600", fontSize: "0.85rem" }}>Fecha de Riego</label>
                    <input 
                      type="date" 
                      value={nuevoRiego.fecha}
                      onChange={(e) => setNuevoRiego({ ...nuevoRiego, fecha: e.target.value })}
                      style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }} 
                      required 
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", marginBottom: "5px", color: "#4a5568", fontWeight: "600", fontSize: "0.85rem" }}>Método de Riego</label>
                    <select 
                      value={nuevoRiego.metodo}
                      onChange={(e) => setNuevoRiego({ ...nuevoRiego, metodo: e.target.value })}
                      style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" }} 
                      required
                    >
                      <option value="Goteo">Riego por Goteo (Alta Eficiencia)</option>
                      <option value="Aspersión">Riego por Aspersión (Foliar)</option>
                      <option value="Microaspersión">Microaspersión</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", marginBottom: "5px", color: "#4a5568", fontWeight: "600", fontSize: "0.85rem" }}>Cantidad de Agua (m³)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      placeholder="Ej: 150" 
                      value={nuevoRiego.cantidad}
                      onChange={(e) => setNuevoRiego({ ...nuevoRiego, cantidad: e.target.value })}
                      style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }} 
                      required 
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", marginBottom: "5px", color: "#4a5568", fontWeight: "600", fontSize: "0.85rem" }}>Operador Responsable</label>
                    <select 
                      value={nuevoRiego.responsable}
                      onChange={(e) => setNuevoRiego({ ...nuevoRiego, responsable: e.target.value })}
                      style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" }} 
                      required
                    >
                      <option value="">Seleccione responsable...</option>
                      {trabajadores.map(t => <option key={t.id} value={t.nombre}>{t.nombre}</option>)}
                      {supervisores.map(s => <option key={s.id} value={s.nombre}>{s.nombre} (Sup.)</option>)}
                    </select>
                  </div>

                  <button type="submit" style={{ background: "#2d5a27", color: "white", padding: "12px", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", marginTop: "10px" }}>
                    Guardar Registro de Riego
                  </button>
                </form>
              </div>

              {/* Historial de Riego */}
              <div style={{ flex: "2", minWidth: "400px" }}>
                <div style={{ background: "white", padding: "25px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                  <h3 style={{ color: "#1a2e1a", marginTop: 0, marginBottom: "20px", fontSize: "1.1rem" }}>Historial de Riego</h3>
                  
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
                    <thead>
                      <tr style={{ borderBottom: "2px solid #aac9a0", color: "#2d5a27", fontWeight: "bold" }}>
                        <th style={{ padding: "12px" }}>Fecha</th>
                        <th style={{ padding: "12px" }}>Método</th>
                        <th style={{ padding: "12px" }}>Cantidad (m³)</th>
                        <th style={{ padding: "12px" }}>Responsable</th>
                      </tr>
                    </thead>
                    <tbody>
                      {listaRiego.map(item => (
                        <tr key={item.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                          <td style={{ padding: "12px" }}>{item.fecha}</td>
                          <td style={{ padding: "12px" }}>
                            <span style={{ 
                              background: item.metodo === "Goteo" ? "#e0f2fe" : "#f3e8ff", 
                              color: item.metodo === "Goteo" ? "#0369a1" : "#6b21a8", 
                              padding: "3px 8px", 
                              borderRadius: "4px", 
                              fontSize: "0.8rem",
                              fontWeight: "bold"
                            }}>
                              {item.metodo}
                            </span>
                          </td>
                          <td style={{ padding: "12px", color: "#0284c7", fontWeight: "bold" }}>{item.cantidad} m³</td>
                          <td style={{ padding: "12px" }}>{item.responsable}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* =======================================
            SECCIÓN 7: FACTURACIÓN Y PLANES (Checkout Simulado funcional)
            ======================================= */}
        {seccion === "facturacion" && (
          <div>
            <h2 style={{ color: "#1a2e1a", marginBottom: "5px" }}>Facturación y Membresías</h2>
            <p style={{ color: "#666", marginBottom: "30px", marginTop: 0 }}>Selecciona tu suscripción para continuar analizando tus camas de rosas</p>
            
            <div style={{ display: "flex", gap: "25px", justifyContent: "center", flexWrap: "wrap", marginTop: "20px" }}>
              <div style={{ background: "white", padding: "30px", borderRadius: "12px", width: "300px", boxShadow: "0 4px 15px rgba(0,0,0,0.05)", border: "1px solid #cbd5e1" }}>
                <h3 style={{ color: "#1a2e1a", fontSize: "1.5rem", margin: "0 0 10px 0" }}>Plan Básico</h3>
                <p style={{ fontSize: "2rem", color: "#2d5a27", fontWeight: "bold", margin: "0 0 20px 0" }}>$50<span style={{ fontSize: "1rem", color: "#666" }}>/mes</span></p>
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 30px 0", color: "#4a5568", lineHeight: "1.8" }}>
                  <li>✓ Hasta 5 camas de producción</li>
                  <li>✓ App Móvil Offline para operarios</li>
                  <li>✓ Soporte por correo</li>
                </ul>
                <button onClick={() => { setPlanSeleccionado("Plan Básico ($50/mes)"); setMostrarModalPago(true); setPagoCompletado(false); }} style={{ width: "100%", padding: "12px", background: "white", color: "#2d5a27", border: "2px solid #2d5a27", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}>
                  Elegir Plan
                </button>
              </div>

              <div style={{ background: "white", padding: "30px", borderRadius: "12px", width: "300px", boxShadow: "0 8px 20px rgba(45,90,39,0.1)", border: "2px solid #2d5a27", position: "relative" }}>
                <div style={{ position: "absolute", top: "-12px", right: "20px", background: "#2d5a27", color: "white", fontSize: "0.75rem", fontWeight: "bold", padding: "4px 10px", borderRadius: "10px" }}>RECOMENDADO</div>
                <h3 style={{ color: "#1a2e1a", fontSize: "1.5rem", margin: "0 0 10px 0" }}>Plan Pro</h3>
                <p style={{ fontSize: "2rem", color: "#2d5a27", fontWeight: "bold", margin: "0 0 20px 0" }}>$150<span style={{ fontSize: "1rem", color: "#666" }}>/mes</span></p>
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 30px 0", color: "#4a5568", lineHeight: "1.8" }}>
                  <li>✓ Camas ilimitadas de producción</li>
                  <li>✓ Proyecciones automáticas con IA</li>
                  <li>✓ Dashboard web gerencial</li>
                </ul>
                <button onClick={() => { setPlanSeleccionado("Plan Pro ($150/mes)"); setMostrarModalPago(true); setPagoCompletado(false); }} style={{ width: "100%", padding: "12px", background: "#2d5a27", color: "white", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}>
                  Elegir Plan
                </button>
              </div>
            </div>

            {/* Modal de Pago Simulado */}
            {mostrarModalPago && (
              <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 99999 }}>
                <div style={{ background: "white", padding: "30px", borderRadius: "15px", width: "450px", boxShadow: "0 10px 30px rgba(0,0,0,0.2)" }}>
                  
                  {!pagoCompletado ? (
                    <>
                      <h3 style={{ color: "#2d5a27", margin: "0 0 5px 0" }}>Checkout Seguro</h3>
                      <p style={{ color: "#666", margin: "0 0 20px 0" }}>Suscripción a: <strong>{planSeleccionado}</strong></p>
                      
                      <form onSubmit={handleSimularPago} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                        <div>
                          <label style={{ display: "block", marginBottom: "5px", fontWeight: "600", fontSize: "0.85rem" }}>Nombre del Titular</label>
                          <input type="text" placeholder="Ej: Carlos Mendoza" style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }} required />
                        </div>
                        <div>
                          <label style={{ display: "block", marginBottom: "5px", fontWeight: "600", fontSize: "0.85rem" }}>Número de Tarjeta</label>
                          <input type="text" maxLength="16" placeholder="4111 2222 3333 4444" style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }} required />
                        </div>
                        <div style={{ display: "flex", gap: "15px" }}>
                          <div style={{ flex: 1 }}>
                            <label style={{ display: "block", marginBottom: "5px", fontWeight: "600", fontSize: "0.85rem" }}>Expiración</label>
                            <input type="text" placeholder="MM/AA" style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }} required />
                          </div>
                          <div style={{ flex: 1 }}>
                            <label style={{ display: "block", marginBottom: "5px", fontWeight: "600", fontSize: "0.85rem" }}>CVC / CVV</label>
                            <input type="password" maxLength="3" placeholder="•••" style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }} required />
                          </div>
                        </div>

                        <div style={{ display: "flex", gap: "10px", marginTop: "15px" }}>
                          <button type="button" onClick={() => setMostrarModalPago(false)} style={{ flex: 1, padding: "12px", background: "#f4f6f4", border: "1px solid #cbd5e1", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}>
                            Cancelar
                          </button>
                          <button type="submit" disabled={procesandoPago} style={{ flex: 1, padding: "12px", background: "#2d5a27", color: "white", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}>
                            {procesandoPago ? "Procesando pago..." : "Pagar con Tarjeta"}
                          </button>
                        </div>
                      </form>
                    </>
                  ) : (
                    <div style={{ textAlign: "center", padding: "20px 0" }}>
                      <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#2d5a27" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto 15px auto", display: "block" }}>
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      <h3 style={{ color: "#2d5a27", margin: "15px 0 10px 0" }}>¡Pago Aprobado con Éxito!</h3>
                      <p style={{ color: "#666", margin: "0 0 25px 0" }}>Tu suscripción a <strong>{planSeleccionado}</strong> se encuentra activa. Hemos enlazado las credenciales de tu finca.</p>
                      <button onClick={() => setMostrarModalPago(false)} style={{ padding: "12px 30px", background: "#2d5a27", color: "white", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}>
                        Entrar al Panel
                      </button>
                    </div>
                  )}

                </div>
              </div>
            )}
          </div>
        )}

           {/* =======================================
            SECCIÓN 8: CROQUIS INTERACTIVO DE LA FINCA (PLANO 2D BLUEPRINT)
            ======================================= */}
        {seccion === "croquis" && (
          <div>
            <h2 style={{ color: "#1a2e1a", marginBottom: "5px" }}>Croquis Interactivo del Invernadero</h2>
            <p style={{ color: "#666", marginBottom: "25px", marginTop: 0 }}>Distribución real de camas, mapa de calor localizado y auditoría de rutas.</p>
            
            {/* Panel Principal Contenedor */}
            <div style={{ display: "flex", gap: "25px", flexWrap: "wrap", alignItems: "stretch" }}>
              
              {/* BANNER LATERAL DE CONTROL (30% de ancho aproximado) */}
              <div style={{ 
                flex: "1 1 320px", 
                maxWidth: "400px", 
                background: "#ffffff", 
                padding: "20px", 
                borderRadius: "12px", 
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)", 
                border: "1px solid #cbd5e1",
                display: "flex",
                flexDirection: "column",
                gap: "18px"
              }}>
                
                {/* 1. Selector de Invernadero */}
                <div>
                  <label style={{ display: "block", marginBottom: "6px", color: "#475569", fontWeight: "700", fontSize: "0.8rem", letterSpacing: "0.5px" }}>INVERNADERO ACTIVO</label>
                  <select 
                    value={invernaderoCroquis} 
                    onChange={(e) => {
                      setInvernaderoCroquis(parseInt(e.target.value));
                      setCamaSeleccionadaCroquis(null);
                    }}
                    style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", background: "#f8fafc", fontWeight: "600", fontSize: "0.9rem", color: "#1e293b" }}
                  >
                    <option value="1">Galpón Norte (Rosas Freedom)</option>
                    <option value="2">Galpón Sur (Rosas Explorer)</option>
                  </select>
                </div>

                {/* Generador Paramétrico de Bloques */}
                <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "12px" }}>
                  <button
                    onClick={() => setMostrarGenerador(!mostrarGenerador)}
                    style={{
                      width: "100%",
                      padding: "8px",
                      background: "#f1f5f9",
                      color: "#334155",
                      border: "1px solid #cbd5e1",
                      borderRadius: "6px",
                      fontSize: "0.8rem",
                      fontWeight: "bold",
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}
                  >
                    <span>🔨 Generar Bloque</span>
                    <span>{mostrarGenerador ? "▲" : "▼"}</span>
                  </button>
                  
                  {mostrarGenerador && (
                    <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "6px", border: "1px solid #e2e8f0", marginTop: "8px", display: "flex", flexDirection: "column", gap: "10px" }}>
                      <p style={{ margin: 0, fontSize: "0.75rem", color: "#64748b" }}>Crea un bloque de camas alineado paramétricamente de forma instantánea.</p>
                      
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                        <div>
                          <label style={{ fontSize: "0.65rem", color: "#475569" }}>Camas (Nº)</label>
                          <input type="number" min="1" max="30" value={genNumCamas} onChange={(e) => setGenNumCamas(parseInt(e.target.value) || 1)} style={{ width: "100%", padding: "4px", fontSize: "0.75rem" }} />
                        </div>
                        <div>
                          <label style={{ fontSize: "0.65rem", color: "#475569" }}>Orientación</label>
                          <select value={genOrientacion} onChange={(e) => setGenOrientacion(e.target.value)} style={{ width: "100%", padding: "4px", fontSize: "0.75rem" }}>
                            <option value="horizontal">Horizontal (Pasillos H)</option>
                            <option value="vertical">Vertical (Pasillos V)</option>
                          </select>
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px" }}>
                        <div>
                          <label style={{ fontSize: "0.65rem", color: "#475569" }}>Origen X</label>
                          <input type="number" value={genStartX} onChange={(e) => setGenStartX(parseInt(e.target.value) || 0)} style={{ width: "100%", padding: "4px", fontSize: "0.75rem" }} />
                        </div>
                        <div>
                          <label style={{ fontSize: "0.65rem", color: "#475569" }}>Origen Y</label>
                          <input type="number" value={genStartY} onChange={(e) => setGenStartY(parseInt(e.target.value) || 0)} style={{ width: "100%", padding: "4px", fontSize: "0.75rem" }} />
                        </div>
                        <div>
                          <label style={{ fontSize: "0.65rem", color: "#475569" }}>Pasillo (px)</label>
                          <input type="number" value={genSpacing} onChange={(e) => setGenSpacing(parseInt(e.target.value) || 0)} style={{ width: "100%", padding: "4px", fontSize: "0.75rem" }} />
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px" }}>
                        <div>
                          <label style={{ fontSize: "0.65rem", color: "#475569" }}>Largo (w)</label>
                          <input type="number" value={genWidth} onChange={(e) => setGenWidth(parseInt(e.target.value) || 1)} style={{ width: "100%", padding: "4px", fontSize: "0.75rem" }} />
                        </div>
                        <div>
                          <label style={{ fontSize: "0.65rem", color: "#475569" }}>Alto (h)</label>
                          <input type="number" value={genHeight} onChange={(e) => setGenHeight(parseInt(e.target.value) || 1)} style={{ width: "100%", padding: "4px", fontSize: "0.75rem" }} />
                        </div>
                        <div>
                          <label style={{ fontSize: "0.65rem", color: "#475569" }}>Escalón (px)</label>
                          <input type="number" value={genSlant} onChange={(e) => setGenSlant(parseInt(e.target.value) || 0)} style={{ width: "100%", padding: "4px", fontSize: "0.75rem" }} />
                        </div>
                      </div>

                      <button
                        onClick={generarBloqueCamas}
                        style={{ padding: "6px 10px", background: "#2563eb", color: "white", border: "none", borderRadius: "4px", fontSize: "0.75rem", fontWeight: "bold", cursor: "pointer" }}
                      >
                        ⚡ Generar Bloque de Camas
                      </button>
                    </div>
                  )}
                </div>

                {/* 2. Interruptores de Capas y Modos */}
                <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "15px" }}>
                  <label style={{ display: "block", marginBottom: "10px", color: "#475569", fontWeight: "700", fontSize: "0.8rem", letterSpacing: "0.5px" }}>CAPAS DEL MAPA</label>
                  
                  {/* Modo de Vista */}
                  <div style={{ display: "flex", background: "#f1f5f9", padding: "4px", borderRadius: "8px", marginBottom: "12px" }}>
                    <button
                      onClick={() => setModoVistaCroquis("siembra")}
                      style={{
                        flex: 1,
                        padding: "8px 12px",
                        border: "none",
                        borderRadius: "6px",
                        fontSize: "0.8rem",
                        fontWeight: "bold",
                        cursor: "pointer",
                        background: modoVistaCroquis === "siembra" ? "white" : "transparent",
                        color: modoVistaCroquis === "siembra" ? "#2d5a27" : "#64748b",
                        boxShadow: modoVistaCroquis === "siembra" ? "0 2px 4px rgba(0,0,0,0.05)" : "none",
                        transition: "all 0.2s ease"
                      }}
                    >
                      🌱 Distribución
                    </button>
                    <button
                      onClick={() => setModoVistaCroquis("calor")}
                      style={{
                        flex: 1,
                        padding: "8px 12px",
                        border: "none",
                        borderRadius: "6px",
                        fontSize: "0.8rem",
                        fontWeight: "bold",
                        cursor: "pointer",
                        background: modoVistaCroquis === "calor" ? "white" : "transparent",
                        color: modoVistaCroquis === "calor" ? "#ef4444" : "#64748b",
                        boxShadow: modoVistaCroquis === "calor" ? "0 2px 4px rgba(0,0,0,0.05)" : "none",
                        transition: "all 0.2s ease"
                      }}
                    >
                      🔥 Calor Plagas
                    </button>
                  </div>

                  {/* Toggle Ruta GPS */}
                  <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: "0.85rem", color: "#334155", background: "#f8fafc", padding: "8px 12px", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                    <input
                      type="checkbox"
                      checked={verRutaMonitor}
                      onChange={(e) => setVerRutaMonitor(e.target.checked)}
                      style={{ width: "16px", height: "16px", cursor: "pointer" }}
                    />
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <strong>Ruta del Monitor GPS</strong>
                      <span style={{ fontSize: "0.7rem", color: "#64748b" }}>Trazado del recorrido en campo</span>
                    </div>
                  </label>
                </div>

                {/* 3. Editor de Camas y Focos de Plagas Dinámico */}
                <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "15px", flex: 1 }}>
                  {!camaSeleccionadaCroquis ? (
                    <div style={{ background: "#f8fafc", padding: "18px", borderRadius: "8px", border: "1px dashed #cbd5e1", textAlign: "center", color: "#64748b" }}>
                      <p style={{ margin: "0 0 12px 0", fontSize: "0.85rem" }}>Selecciona una cama en el plano para editar sus dimensiones reales o añadir focos exactos de plagas.</p>
                      <button
                        onClick={() => {
                          const nuevoId = Math.max(...camasCroquisSVG.map(c => c.id), 0) + 1;
                          const nuevaCama = {
                            id: nuevoId,
                            invernaderoId: invernaderoCroquis,
                            nombre: `Cama ${camasCroquisSVG.filter(c => c.invernaderoId === invernaderoCroquis).length + 1}`,
                            x: 100,
                            y: 100,
                            w: 160,
                            h: 30,
                            largo: 50,
                            ancho: 1.2,
                            estado: "Sin censo",
                            responsable: "Luis Silva",
                            variedad: invernaderoCroquis === 1 ? "Rosas Freedom" : "Rosas Explorer",
                            totalTallos: 0,
                            totalBotones: 0,
                            confianza: 0,
                            puntosPlaga: []
                          };
                          setCamasCroquisSVG(prev => [...prev, nuevaCama]);
                          setCamaSeleccionadaCroquis(nuevaCama);
                        }}
                        style={{ padding: "8px 14px", background: "#2d5a27", color: "white", border: "none", borderRadius: "6px", fontSize: "0.8rem", fontWeight: "bold", cursor: "pointer" }}
                      >
                        ➕ Crear Nueva Cama
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "400px", overflowY: "auto", paddingRight: "4px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontWeight: "bold", color: "#1e293b", fontSize: "0.95rem" }}>Cama Seleccionada</span>
                        <button 
                          onClick={() => {
                            if (window.confirm("¿Seguro que deseas eliminar esta cama?")) {
                              setCamasCroquisSVG(prev => prev.filter(c => c.id !== camaSeleccionadaCroquis.id));
                              setCamaSeleccionadaCroquis(null);
                            }
                          }}
                          style={{ border: "none", background: "none", color: "#ef4444", fontSize: "0.8rem", fontWeight: "bold", cursor: "pointer" }}
                        >
                          🗑️ Eliminar Cama
                        </button>
                      </div>

                      {/* Propiedades generales */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                        <div>
                          <label style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: "600" }}>Nombre</label>
                          <input
                            type="text"
                            value={camaSeleccionadaCroquis.nombre}
                            onChange={(e) => {
                              const updated = { ...camaSeleccionadaCroquis, nombre: e.target.value };
                              setCamaSeleccionadaCroquis(updated);
                              setCamasCroquisSVG(prev => prev.map(c => c.id === updated.id ? updated : c));
                            }}
                            style={{ width: "100%", padding: "5px 8px", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "0.8rem" }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: "600" }}>Variedad</label>
                          <input
                            type="text"
                            value={camaSeleccionadaCroquis.variedad}
                            onChange={(e) => {
                              const updated = { ...camaSeleccionadaCroquis, variedad: e.target.value };
                              setCamaSeleccionadaCroquis(updated);
                              setCamasCroquisSVG(prev => prev.map(c => c.id === updated.id ? updated : c));
                            }}
                            style={{ width: "100%", padding: "5px 8px", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "0.8rem" }}
                          />
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "6px" }}>
                        <div style={{ gridColumn: "span 1" }}>
                          <label style={{ fontSize: "0.65rem", color: "#64748b" }}>X (px)</label>
                          <input
                            type="number"
                            value={camaSeleccionadaCroquis.x}
                            onChange={(e) => {
                              const updated = { ...camaSeleccionadaCroquis, x: parseInt(e.target.value) || 0 };
                              setCamaSeleccionadaCroquis(updated);
                              setCamasCroquisSVG(prev => prev.map(c => c.id === updated.id ? updated : c));
                            }}
                            style={{ width: "100%", padding: "4px 6px", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "0.75rem" }}
                          />
                        </div>
                        <div style={{ gridColumn: "span 1" }}>
                          <label style={{ fontSize: "0.65rem", color: "#64748b" }}>Y (px)</label>
                          <input
                            type="number"
                            value={camaSeleccionadaCroquis.y}
                            onChange={(e) => {
                              const updated = { ...camaSeleccionadaCroquis, y: parseInt(e.target.value) || 0 };
                              setCamaSeleccionadaCroquis(updated);
                              setCamasCroquisSVG(prev => prev.map(c => c.id === updated.id ? updated : c));
                            }}
                            style={{ width: "100%", padding: "4px 6px", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "0.75rem" }}
                          />
                        </div>
                        <div style={{ gridColumn: "span 1" }}>
                          <label style={{ fontSize: "0.65rem", color: "#64748b" }}>Ancho (w)</label>
                          <input
                            type="number"
                            value={camaSeleccionadaCroquis.w}
                            onChange={(e) => {
                              const updated = { ...camaSeleccionadaCroquis, w: parseInt(e.target.value) || 20 };
                              setCamaSeleccionadaCroquis(updated);
                              setCamasCroquisSVG(prev => prev.map(c => c.id === updated.id ? updated : c));
                            }}
                            style={{ width: "100%", padding: "4px 6px", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "0.75rem" }}
                          />
                        </div>
                        <div style={{ gridColumn: "span 1" }}>
                          <label style={{ fontSize: "0.65rem", color: "#64748b" }}>Alto (h)</label>
                          <input
                            type="number"
                            value={camaSeleccionadaCroquis.h}
                            onChange={(e) => {
                              const updated = { ...camaSeleccionadaCroquis, h: parseInt(e.target.value) || 10 };
                              setCamaSeleccionadaCroquis(updated);
                              setCamasCroquisSVG(prev => prev.map(c => c.id === updated.id ? updated : c));
                            }}
                            style={{ width: "100%", padding: "4px 6px", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "0.75rem" }}
                          />
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                        <div>
                          <label style={{ fontSize: "0.7rem", color: "#64748b" }}>Largo Real (m)</label>
                          <input
                            type="number"
                            value={camaSeleccionadaCroquis.largo}
                            onChange={(e) => {
                              const updated = { ...camaSeleccionadaCroquis, largo: parseFloat(e.target.value) || 0 };
                              setCamaSeleccionadaCroquis(updated);
                              setCamasCroquisSVG(prev => prev.map(c => c.id === updated.id ? updated : c));
                            }}
                            style={{ width: "100%", padding: "5px 8px", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "0.8rem" }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: "0.7rem", color: "#64748b" }}>Estado</label>
                          <select
                            value={camaSeleccionadaCroquis.estado}
                            onChange={(e) => {
                              const updated = { ...camaSeleccionadaCroquis, estado: e.target.value };
                              setCamaSeleccionadaCroquis(updated);
                              setCamasCroquisSVG(prev => prev.map(c => c.id === updated.id ? updated : c));
                            }}
                            style={{ width: "100%", padding: "5px 8px", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "0.8rem" }}
                          >
                            <option value="Lista Cosecha">Lista Cosecha</option>
                            <option value="En Crecimiento">En Crecimiento</option>
                            <option value="Sin censo">Sin censo</option>
                          </select>
                        </div>
                      </div>

                      {/* --- REGISTRO DE FOCOS DE PLAGAS LOCALIZADOS (Multi-Punto) --- */}
                      <div style={{ background: "#fff5f5", padding: "12px", borderRadius: "8px", border: "1px solid #fed7d7", marginTop: "5px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                          <h4 style={{ margin: 0, color: "#c53030", fontSize: "0.8rem", fontWeight: "bold" }}>🚨 FOCOS DE PLAGA EN CAMA</h4>
                          <button
                            onClick={() => {
                              const nuevosPuntos = [...(camaSeleccionadaCroquis.puntosPlaga || [])];
                              const nuevoPunto = {
                                id: Date.now(),
                                xPct: 50,
                                yPct: 50,
                                severidad: 0.5,
                                plaga: "Araña Roja"
                              };
                              nuevosPuntos.push(nuevoPunto);
                              const updated = { ...camaSeleccionadaCroquis, puntosPlaga: nuevosPuntos };
                              setCamaSeleccionadaCroquis(updated);
                              setCamasCroquisSVG(prev => prev.map(c => c.id === updated.id ? updated : c));
                            }}
                            style={{ padding: "3px 8px", background: "#e53e3e", color: "white", border: "none", borderRadius: "4px", fontSize: "0.65rem", fontWeight: "bold", cursor: "pointer" }}
                          >
                            + Añadir Foco
                          </button>
                        </div>

                        {(!camaSeleccionadaCroquis.puntosPlaga || camaSeleccionadaCroquis.puntosPlaga.length === 0) ? (
                          <div style={{ fontSize: "0.75rem", color: "#9b2c2c", fontStyle: "italic", textAlign: "center", padding: "10px 0" }}>
                            Cama sana. Sin plagas detectadas.
                          </div>
                        ) : (
                          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            {camaSeleccionadaCroquis.puntosPlaga.map((pt, idx) => (
                              <div key={pt.id} style={{ background: "#ffffff", padding: "10px", borderRadius: "6px", border: "1px solid #feb2b2", position: "relative" }}>
                                <button
                                  onClick={() => {
                                    const nuevosPuntos = (camaSeleccionadaCroquis.puntosPlaga || []).filter(p => p.id !== pt.id);
                                    const updated = { ...camaSeleccionadaCroquis, puntosPlaga: nuevosPuntos };
                                    setCamaSeleccionadaCroquis(updated);
                                    setCamasCroquisSVG(prev => prev.map(c => c.id === updated.id ? updated : c));
                                  }}
                                  style={{ position: "absolute", top: "5px", right: "5px", background: "none", border: "none", color: "#e53e3e", fontWeight: "bold", cursor: "pointer", fontSize: "0.85rem" }}
                                >
                                  ×
                                </button>
                                
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "8px" }}>
                                  <div>
                                    <label style={{ fontSize: "0.65rem", color: "#742a2a", display: "block" }}>Plaga</label>
                                    <select
                                      value={pt.plaga}
                                      onChange={(e) => {
                                        const nuevosP = camaSeleccionadaCroquis.puntosPlaga.map(p => p.id === pt.id ? { ...p, plaga: e.target.value } : p);
                                        const updated = { ...camaSeleccionadaCroquis, puntosPlaga: nuevosP };
                                        setCamaSeleccionadaCroquis(updated);
                                        setCamasCroquisSVG(prev => prev.map(c => c.id === updated.id ? updated : c));
                                      }}
                                      style={{ width: "100%", padding: "3px 4px", borderRadius: "3px", border: "1px solid #f5c2c2", fontSize: "0.7rem" }}
                                    >
                                      <option value="Araña Roja">Araña Roja</option>
                                      <option value="Trips">Trips</option>
                                      <option value="Botrytis">Botrytis</option>
                                    </select>
                                  </div>
                                  <div>
                                    <label style={{ fontSize: "0.65rem", color: "#742a2a", display: "block" }}>Severidad ({(pt.severidad * 100).toFixed(0)}%)</label>
                                    <input
                                      type="range"
                                      min="0.10"
                                      max="1.00"
                                      step="0.05"
                                      value={pt.severidad}
                                      onChange={(e) => {
                                        const nuevosP = camaSeleccionadaCroquis.puntosPlaga.map(p => p.id === pt.id ? { ...p, severidad: parseFloat(e.target.value) } : p);
                                        const updated = { ...camaSeleccionadaCroquis, puntosPlaga: nuevosP };
                                        setCamaSeleccionadaCroquis(updated);
                                        setCamasCroquisSVG(prev => prev.map(c => c.id === updated.id ? updated : c));
                                      }}
                                      style={{ width: "100%", accentColor: "#e53e3e", cursor: "pointer", height: "14px" }}
                                    />
                                  </div>
                                </div>

                                {/* Slider de ubicación a lo largo de la cama */}
                                <div>
                                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.65rem", color: "#742a2a" }}>
                                    <span>Posición del Foco:</span>
                                    <strong>{pt.xPct}% del largo</strong>
                                  </div>
                                  <input
                                    type="range"
                                    min="5"
                                    max="95"
                                    step="1"
                                    value={pt.xPct}
                                    onChange={(e) => {
                                      const nuevosP = camaSeleccionadaCroquis.puntosPlaga.map(p => p.id === pt.id ? { ...p, xPct: parseInt(e.target.value) } : p);
                                      const updated = { ...camaSeleccionadaCroquis, puntosPlaga: nuevosP };
                                      setCamaSeleccionadaCroquis(updated);
                                      setCamasCroquisSVG(prev => prev.map(c => c.id === updated.id ? updated : c));
                                    }}
                                    style={{ width: "100%", accentColor: "#4a5568", cursor: "pointer", height: "14px" }}
                                  />
                                  
                                  {/* Mapeo Agronómico por Postes */}
                                  <div style={{ marginTop: "6px" }}>
                                    <label style={{ fontSize: "0.6rem", color: "#742a2a", fontWeight: "bold", display: "block", marginBottom: "4px" }}>📍 Mapear por Poste Físico (Estilo Celular):</label>
                                    <div style={{ display: "flex", gap: "3px", justifyContent: "space-between" }}>
                                      {[1, 2, 3, 4, 5].map((posteNum) => {
                                        const targetPct = posteNum * 20 - 10; // Post 1 = 10%, Post 2 = 30%, Post 3 = 50%, Post 4 = 70%, Post 5 = 90%
                                        const esActivo = Math.abs(pt.xPct - targetPct) <= 10;
                                        return (
                                          <button
                                            key={posteNum}
                                            onClick={() => {
                                              const nuevosP = camaSeleccionadaCroquis.puntosPlaga.map(p => p.id === pt.id ? { ...p, xPct: targetPct } : p);
                                              const updated = { ...camaSeleccionadaCroquis, puntosPlaga: nuevosP };
                                              setCamaSeleccionadaCroquis(updated);
                                              setCamasCroquisSVG(prev => prev.map(c => c.id === updated.id ? updated : c));
                                            }}
                                            style={{
                                              flex: 1,
                                              padding: "3px 0",
                                              fontSize: "0.6rem",
                                              fontWeight: "bold",
                                              background: esActivo ? "#c53030" : "#f7fafc",
                                              color: esActivo ? "white" : "#4a5568",
                                              border: "1px solid #cbd5e1",
                                              borderRadius: "3px",
                                              cursor: "pointer"
                                            }}
                                          >
                                            P{posteNum}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => setCamaSeleccionadaCroquis(null)}
                        style={{ width: "100%", padding: "8px", background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "6px", fontWeight: "bold", fontSize: "0.8rem", cursor: "pointer", marginTop: "10px" }}
                      >
                        Cerrar Editor
                      </button>
                    </div>
                  )}
                </div>

              </div>

              {/* VISTA DEL PLANO INTERACTIVO SVG (70% de ancho aproximado - CLARO/BLUEPRINT) */}
              <div style={{ 
                flex: "2 1 600px", 
                background: "#f8fafc", 
                borderRadius: "12px", 
                border: "2px solid #cbd5e1", 
                boxShadow: "0 4px 15px rgba(0,0,0,0.05)",
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                position: "relative",
                overflow: "hidden"
              }}>
                
                {/* Cabecera del Plano */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: "12px", marginBottom: "15px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 6px #22c55e" }}></div>
                    <span style={{ color: "#334155", fontSize: "0.8rem", fontWeight: "bold", letterSpacing: "1px" }}>
                      PLANO CARTOGRÁFICO DE FINCA: {invernaderoCroquis === 1 ? "GALPÓN NORTE (FREEDOM)" : "GALPÓN SUR (EXPLORER)"}
                    </span>
                  </div>
                  <span style={{ color: "#64748b", fontSize: "0.75rem" }}>
                    {camasCroquisSVG.filter(c => c.invernaderoId === invernaderoCroquis).length} Camas Ubicadas
                  </span>
                </div>

                {/* Lienzo SVG */}
                <div style={{ width: "100%", position: "relative", background: "#e2e8f0", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
                  <svg 
                    viewBox="0 0 800 450" 
                    width="100%" 
                    height="100%"
                    style={{ display: "block", cursor: modoVistaCroquis === "calor" ? "crosshair" : "default" }}
                    onClick={handleSvgClick}
                  >
                    <style>
                      {`
                        .gps-pulse {
                          animation: gpsPulse 2.5s infinite ease-out;
                        }
                        @keyframes gpsPulse {
                          0% { r: 3; opacity: 1; }
                          100% { r: 16; opacity: 0; }
                        }
                        .pulse-core {
                          animation: corePulse 1s infinite alternate;
                        }
                        @keyframes corePulse {
                          0% { r: 3.5; }
                          100% { r: 5; }
                        }
                        .bed-rect {
                          transition: all 0.25s ease;
                        }
                        .bed-rect:hover {
                          stroke: #2563eb !important;
                          stroke-width: 2.5px !important;
                          filter: drop-shadow(0px 0px 8px rgba(37,99,235,0.15));
                        }
                      `}
                    </style>

                    {/* Defs para patrones de cuadrícula y gradientes de calor localizados */}
                    <defs>
                      {/* Cuadrícula Blueprint Claro */}
                      <pattern id="blueprintGridClaro" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#cbd5e1" strokeWidth="1" />
                      </pattern>
                      <pattern id="dotGridClaro" width="10" height="10" patternUnits="userSpaceOnUse">
                        <circle cx="5" cy="5" r="0.5" fill="#94a3b8" />
                      </pattern>

                      {/* Gradientes Radiales de Plagas específicos por tipo */}
                      {camasCroquisSVG
                        .filter(c => c.invernaderoId === invernaderoCroquis)
                        .flatMap(c => (c.puntosPlaga || []).map(pt => {
                          // Colores: Araña Roja = Rojo, Trips = Amarillo, Botrytis = Morado
                          let colorPest = "#ef4444";
                          if (pt.plaga === "Trips") colorPest = "#f59e0b";
                          else if (pt.plaga === "Botrytis") colorPest = "#a855f7";

                          return (
                            <radialGradient key={`grad-${c.id}-${pt.id}`} id={`heat-${c.id}-${pt.id}`} cx="50%" cy="50%" r="50%">
                              <stop offset="0%" stopColor={colorPest} stopOpacity="0.85" />
                              <stop offset="40%" stopColor={colorPest} stopOpacity="0.45" />
                              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
                            </radialGradient>
                          );
                        }))
                      }
                    </defs>

                    {/* Fondos */}
                    <rect width="800" height="450" fill="#f1f5f9" />
                    <rect width="800" height="450" fill="url(#blueprintGridClaro)" />
                    <rect width="800" height="450" fill="url(#dotGridClaro)" opacity="0.6" />

                    {/* Estructura Exterior Invernadero */}
                    <rect x="15" y="15" width="770" height="420" rx="12" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeDasharray="10 6" />
                    <text x="30" y="38" fill="#64748b" fontSize="10" fontWeight="bold" letterSpacing="1.5">ESTRUCTURA DE NAVE PERIMETRAL - PILARES METÁLICOS</text>

                    {/* CAPA 1: TRAZADO GPS DEL MONITOR (Scarab Scout Route) */}
                    {verRutaMonitor && (
                      <g id="scouting-route">
                        {/* Línea de Trayecto (Pasillo) */}
                        <path 
                          d="M 40 90 L 760 90 L 760 182 L 40 182 L 40 272 L 760 272" 
                          fill="none" 
                          stroke="#64748b" 
                          strokeWidth="2.5" 
                          strokeDasharray="6 5" 
                          opacity="0.7" 
                        />
                        <text x="45" y="82" fill="#64748b" fontSize="8" fontWeight="bold" letterSpacing="0.5">TRAYECTORIA AUDITADA DEL MONITOR (GPS)</text>

                        {/* Puntos de Registro GPS */}
                        {[
                          {x: 100, y: 90, status: "ok"},
                          {x: 350, y: 90, status: "ok"},
                          {x: 650, y: 90, status: "ok"},
                          {x: 760, y: 135, status: "ok"},
                          {x: 550, y: 182, status: "warning"},
                          {x: 250, y: 182, status: "ok"},
                          {x: 40, y: 227, status: "ok"},
                          {x: 180, y: 272, status: "ok"},
                          {x: 480, y: 272, status: "ok"}
                        ].map((pt, i) => {
                          const haloColor = pt.status === "warning" ? "#ef4444" : "#3b82f6";
                          return (
                            <g key={`pt-${i}`} style={{ pointerEvents: "none" }}>
                              <circle cx={pt.x} cy={pt.y} r="8" fill="none" stroke={haloColor} strokeWidth="1.5" className="gps-pulse" />
                              <circle cx={pt.x} cy={pt.y} r="4" fill={haloColor} className="pulse-core" />
                            </g>
                          );
                        })}
                      </g>
                    )}

                    {/* CAPA 2: CAMAS (RECTÁNGULOS BLANCOS) */}
                    <g id="beds">
                      {camasCroquisSVG
                        .filter(c => c.invernaderoId === invernaderoCroquis)
                        .map((c) => {
                          // Indicar estado con un borde izquierdo coloreado
                          let colorEstado = "#cbd5e1"; // Gris
                          if (c.estado === "Lista Cosecha") colorEstado = "#10b981";
                          else if (c.estado === "En Crecimiento") colorEstado = "#f97316";

                          const esSeleccionada = camaSeleccionadaCroquis?.id === c.id;

                          return (
                            <g 
                              key={c.id} 
                              onClick={() => setCamaSeleccionadaCroquis(c)}
                              style={{ cursor: "pointer" }}
                            >
                              {/* Rectángulo de Cama de Cultivo (Fondo Blanco) */}
                              <rect
                                x={c.x}
                                y={c.y}
                                width={c.w}
                                height={c.h}
                                rx="4"
                                className="bed-rect"
                                fill="#ffffff"
                                stroke={esSeleccionada ? "#2563eb" : "#94a3b8"}
                                strokeWidth={esSeleccionada ? "3" : "1.5"}
                              />

                              {/* Barra lateral de estado de siembra (A la izquierda de cada rectángulo) */}
                              {modoVistaCroquis === "siembra" && (
                                <rect
                                  x={c.x}
                                  y={c.y}
                                  width="6"
                                  height={c.h}
                                  rx="2"
                                  fill={colorEstado}
                                />
                              )}

                              {/* Nombre de la Cama */}
                              <text 
                                x={c.x + 15} 
                                y={c.y + 18} 
                                fill="#1e293b" 
                                fontSize="11" 
                                fontWeight="bold" 
                                textAnchor="start"
                              >
                                {c.nombre}
                              </text>

                              {/* Detalle secundario */}
                              <text 
                                x={c.x + c.w - 10} 
                                y={c.y + 18} 
                                fill="#64748b" 
                                fontSize="8.5" 
                                textAnchor="end"
                              >
                                {c.largo}m • {c.variedad}
                              </text>
                            </g>
                          );
                        })}
                    </g>

                    {/* CAPA 3: OVERLAY DE MAPA DE CALOR LOCALIZADO (HEATMAP MULTI-PUNTO) */}
                    {modoVistaCroquis === "calor" && (
                      <g id="heatmap-layer" style={{ pointerEvents: "none" }}>
                        {camasCroquisSVG
                          .filter(c => c.invernaderoId === invernaderoCroquis && c.puntosPlaga && c.puntosPlaga.length > 0)
                          .flatMap(c => c.puntosPlaga.map((pt) => {
                            // Calcular coordenada exacta del punto de infección
                            const cx = c.x + (pt.xPct / 100) * c.w;
                            const cy = c.y + (pt.yPct / 100) * c.h;
                            const radioCalor = pt.severidad * 45; // Radio controlado de hotspot

                            return (
                              <circle 
                                key={`heat-${c.id}-${pt.id}`}
                                cx={cx} 
                                cy={cy} 
                                r={radioCalor} 
                                fill={`url(#heat-${c.id}-${pt.id})`}
                                opacity="0.8"
                              />
                            );
                          }))
                        }
                      </g>
                    )}

                  </svg>
                </div>

                {/* Leyendas y Ayuda Visual Inferior */}
                <div style={{ marginTop: "15px", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "10px", fontSize: "0.8rem", color: "#475569", background: "#f1f5f9", padding: "10px 15px", borderRadius: "8px", border: "1px solid #cbd5e1" }}>
                  <div style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
                    {modoVistaCroquis === "siembra" ? (
                      <>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <div style={{ width: "12px", height: "12px", background: "#10b981", borderRadius: "3px" }}></div>
                          <span>Listo Cosecha</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <div style={{ width: "12px", height: "12px", background: "#f97316", borderRadius: "3px" }}></div>
                          <span>En Crecimiento</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <div style={{ width: "12px", height: "12px", background: "#cbd5e1", borderRadius: "3px" }}></div>
                          <span>Sin Censo</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <div style={{ width: "10px", height: "10px", background: "#ef4444", borderRadius: "50%", boxShadow: "0 0 4px #ef4444" }}></div>
                          <span>Araña Roja</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <div style={{ width: "10px", height: "10px", background: "#f59e0b", borderRadius: "50%", boxShadow: "0 0 4px #f59e0b" }}></div>
                          <span>Trips</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <div style={{ width: "10px", height: "10px", background: "#a855f7", borderRadius: "50%", boxShadow: "0 0 4px #a855f7" }}></div>
                          <span>Botrytis</span>
                        </div>
                      </>
                    )}
                  </div>
                  <div style={{ fontStyle: "italic" }}>
                    * Haz clic en una cama para abrir el editor de focos
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* =======================================
            SECCIÓN 9: GESTIÓN DE PERMISOS DE ROL (NUEVO)
            ======================================= */}
        {seccion === "permisos" && rolActual === "admin" && (
          <div>
            <h2 style={{ color: "#1a2e1a", marginBottom: "5px" }}>Control de Accesos y Permisos</h2>
            <p style={{ color: "#666", marginBottom: "30px", marginTop: 0 }}>Administra las secciones y operaciones visibles para el rol de Supervisor en la plataforma</p>

            <div style={{ background: "white", padding: "25px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              <h3 style={{ color: "#2d5a27", marginTop: 0, marginBottom: "20px", fontSize: "1.1rem" }}>Matriz de Permisos del Supervisor</h3>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                
                {/* Tabla de Permisos */}
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid #e2e8f0", color: "#2d5a27", fontWeight: "bold" }}>
                      <th style={{ padding: "12px 10px" }}>Sección / Módulo</th>
                      <th style={{ padding: "12px 10px" }}>Descripción del Módulo</th>
                      <th style={{ padding: "12px 10px", textAlign: "center", width: "120px" }}>Acceso Admin</th>
                      <th style={{ padding: "12px 10px", textAlign: "center", width: "120px" }}>Acceso Supervisor</th>
                    </tr>
                  </thead>
                  <tbody>
                    
                    {/* Fila Configuración Finca */}
                    <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                      <td style={{ padding: "12px 10px", fontWeight: "bold" }}>Configuración Finca</td>
                      <td style={{ padding: "12px 10px", color: "#666" }}>Administración de invernaderos, galpones y registro de camas de rosas.</td>
                      <td style={{ padding: "12px 10px", textAlign: "center" }}>
                        <span style={{ color: "#2d5a27", fontWeight: "bold" }}>Siempre Permitido</span>
                      </td>
                      <td style={{ padding: "12px 10px", textAlign: "center" }}>
                        <input 
                          type="checkbox" 
                          checked={permisosSupervisor.configuracion} 
                          onChange={(e) => setPermisosSupervisor({ ...permisosSupervisor, configuracion: e.target.checked })}
                          style={{ width: "18px", height: "18px", cursor: "pointer", accentColor: "#2d5a27" }} 
                        />
                      </td>
                    </tr>

                    {/* Fila Personal */}
                    <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                      <td style={{ padding: "12px 10px", fontWeight: "bold" }}>Gestión de Personal</td>
                      <td style={{ padding: "12px 10px", color: "#666" }}>Registro de supervisores y trabajadores móviles, sueldos y contactos.</td>
                      <td style={{ padding: "12px 10px", textAlign: "center" }}>
                        <span style={{ color: "#2d5a27", fontWeight: "bold" }}>Siempre Permitido</span>
                      </td>
                      <td style={{ padding: "12px 10px", textAlign: "center" }}>
                        <input 
                          type="checkbox" 
                          checked={permisosSupervisor.personal} 
                          onChange={(e) => setPermisosSupervisor({ ...permisosSupervisor, personal: e.target.checked })}
                          style={{ width: "18px", height: "18px", cursor: "pointer", accentColor: "#2d5a27" }} 
                        />
                      </td>
                    </tr>

                    {/* Fila Facturación */}
                    <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                      <td style={{ padding: "12px 10px", fontWeight: "bold" }}>Facturación y Planes</td>
                      <td style={{ padding: "12px 10px", color: "#666" }}>Suscripción SaaS, historial de facturas y pasarela de pagos simulada.</td>
                      <td style={{ padding: "12px 10px", textAlign: "center" }}>
                        <span style={{ color: "#2d5a27", fontWeight: "bold" }}>Siempre Permitido</span>
                      </td>
                      <td style={{ padding: "12px 10px", textAlign: "center" }}>
                        <input 
                          type="checkbox" 
                          checked={permisosSupervisor.facturacion} 
                          onChange={(e) => setPermisosSupervisor({ ...permisosSupervisor, facturacion: e.target.checked })}
                          style={{ width: "18px", height: "18px", cursor: "pointer", accentColor: "#2d5a27" }} 
                        />
                      </td>
                    </tr>

                    {/* Fila Ingreso Datos */}
                    <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                      <td style={{ padding: "12px 10px", fontWeight: "bold" }}>Ingreso de Datos</td>
                      <td style={{ padding: "12px 10px", color: "#666" }}>Subida y procesamiento de videos de censo IA con Claude.</td>
                      <td style={{ padding: "12px 10px", textAlign: "center" }}>
                        <span style={{ color: "#2d5a27", fontWeight: "bold" }}>Siempre Permitido</span>
                      </td>
                      <td style={{ padding: "12px 10px", textAlign: "center" }}>
                        <input 
                          type="checkbox" 
                          checked={permisosSupervisor.ingreso_datos} 
                          onChange={(e) => setPermisosSupervisor({ ...permisosSupervisor, ingreso_datos: e.target.checked })}
                          style={{ width: "18px", height: "18px", cursor: "pointer", accentColor: "#2d5a27" }} 
                        />
                      </td>
                    </tr>

                    {/* Fila Datos Consolidados */}
                    <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                      <td style={{ padding: "12px 10px", fontWeight: "bold" }}>Datos Consolidados</td>
                      <td style={{ padding: "12px 10px", color: "#666" }}>Resúmenes, totales e indicadores por cama procesada.</td>
                      <td style={{ padding: "12px 10px", textAlign: "center" }}>
                        <span style={{ color: "#2d5a27", fontWeight: "bold" }}>Siempre Permitido</span>
                      </td>
                      <td style={{ padding: "12px 10px", textAlign: "center" }}>
                        <input 
                          type="checkbox" 
                          checked={permisosSupervisor.datos_consolidados} 
                          onChange={(e) => setPermisosSupervisor({ ...permisosSupervisor, datos_consolidados: e.target.checked })}
                          style={{ width: "18px", height: "18px", cursor: "pointer", accentColor: "#2d5a27" }} 
                        />
                      </td>
                    </tr>

                    {/* Fila Proyecciones */}
                    <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                      <td style={{ padding: "12px 10px", fontWeight: "bold" }}>Proyección por Cama</td>
                      <td style={{ padding: "12px 10px", color: "#666" }}>Estimación de tallos listos para corte a 14 días.</td>
                      <td style={{ padding: "12px 10px", textAlign: "center" }}>
                        <span style={{ color: "#2d5a27", fontWeight: "bold" }}>Siempre Permitido</span>
                      </td>
                      <td style={{ padding: "12px 10px", textAlign: "center" }}>
                        <input 
                          type="checkbox" 
                          checked={permisosSupervisor.proyecciones} 
                          onChange={(e) => setPermisosSupervisor({ ...permisosSupervisor, proyecciones: e.target.checked })}
                          style={{ width: "18px", height: "18px", cursor: "pointer", accentColor: "#2d5a27" }} 
                        />
                      </td>
                    </tr>

                    {/* Fila Cosecha */}
                    <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                      <td style={{ padding: "12px 10px", fontWeight: "bold" }}>Registro de Cosecha</td>
                      <td style={{ padding: "12px 10px", color: "#666" }}>Tabla de historial de cortes reportados en poscosecha.</td>
                      <td style={{ padding: "12px 10px", textAlign: "center" }}>
                        <span style={{ color: "#2d5a27", fontWeight: "bold" }}>Siempre Permitido</span>
                      </td>
                      <td style={{ padding: "12px 10px", textAlign: "center" }}>
                        <input 
                          type="checkbox" 
                          checked={permisosSupervisor.cosecha} 
                          onChange={(e) => setPermisosSupervisor({ ...permisosSupervisor, cosecha: e.target.checked })}
                          style={{ width: "18px", height: "18px", cursor: "pointer", accentColor: "#2d5a27" }} 
                        />
                      </td>
                    </tr>

                    {/* Fila Poda */}
                    <tr style={{ borderBottom: "1px solid #e2e8f0" }}>
                      <td style={{ padding: "12px 10px", fontWeight: "bold" }}>Control de Poda</td>
                      <td style={{ padding: "12px 10px", color: "#666" }}>Registro de mantenimiento, tipos de poda y tallos de rosa descartados.</td>
                      <td style={{ padding: "12px 10px", textAlign: "center" }}>
                        <span style={{ color: "#2d5a27", fontWeight: "bold" }}>Siempre Permitido</span>
                      </td>
                      <td style={{ padding: "12px 10px", textAlign: "center" }}>
                        <input 
                          type="checkbox" 
                          checked={permisosSupervisor.poda} 
                          onChange={(e) => setPermisosSupervisor({ ...permisosSupervisor, poda: e.target.checked })}
                          style={{ width: "18px", height: "18px", cursor: "pointer", accentColor: "#2d5a27" }} 
                        />
                      </td>
                    </tr>

                    {/* Fila Croquis */}
                    <tr style={{ borderBottom: "1px solid #cbd5e1" }}>
                      <td style={{ padding: "12px 10px", fontWeight: "bold" }}>Croquis de la Finca</td>
                      <td style={{ padding: "12px 10px", color: "#666" }}>Visualización matricial en rejilla y estado de alertas por cama.</td>
                      <td style={{ padding: "12px 10px", textAlign: "center" }}>
                        <span style={{ color: "#2d5a27", fontWeight: "bold" }}>Siempre Permitido</span>
                      </td>
                      <td style={{ padding: "12px 10px", textAlign: "center" }}>
                        <input 
                          type="checkbox" 
                          checked={permisosSupervisor.croquis} 
                          onChange={(e) => setPermisosSupervisor({ ...permisosSupervisor, croquis: e.target.checked })}
                          style={{ width: "18px", height: "18px", cursor: "pointer", accentColor: "#2d5a27" }} 
                        />
                      </td>
                    </tr>

                  </tbody>
                </table>

                {/* Nota informativa */}
                <div style={{ background: "#f8fafc", border: "1px solid #cbd5e1", borderRadius: "8px", padding: "15px", marginTop: "15px", color: "#475569", fontSize: "0.85rem", lineHeight: "1.5" }}>
                  <strong>Nota de Simulación:</strong> Puedes cambiar el switch <strong>"Rol Demostración"</strong> en el encabezado superior para alternar instantáneamente entre la perspectiva de Administrador (que ve todo) y la de Supervisor (que solo ve los módulos tildados en esta matriz).
                </div>

              </div>
            </div>
          </div>
        )}

        {/* =======================================
            SECCIÓN 12: AJUSTES DE ADMINISTRACIÓN AVANZADOS (NUEVO)
            ======================================= */}
        {seccion === "admin_ajustes" && rolActual === "admin" && (
          <div>
            <h2 style={{ color: "#1a2e1a", marginBottom: "5px" }}>Ajustes de Administración Avanzados</h2>
            <p style={{ color: "#666", marginBottom: "30px", marginTop: 0 }}>Gestión corporativa, control de inquilino, políticas de seguridad y catálogo de especies</p>

            {/* Pestañas Horizontales Internas */}
            <div style={{ display: "flex", borderBottom: "2px solid #e2e8f0", marginBottom: "25px", gap: "10px", flexWrap: "wrap" }}>
              {[
                { id: "dashboard_negocio", nombre: "Dashboard de Empresa" },
                { id: "config_inquilino", nombre: "Configuración de Inquilino" },
                { id: "usuarios", nombre: "Gestión de Usuarios" },
                { id: "programador", nombre: "Programador de Tareas" },
                { id: "catalogo", nombre: "Catálogo de Rosas" },
                { id: "planes", nombre: "Planes y Tarifas" }
              ].map(pestana => (
                <button
                  key={pestana.id}
                  onClick={() => setSubPestanaAdmin(pestana.id)}
                  style={{
                    padding: "10px 20px",
                    border: "none",
                    background: "transparent",
                    color: subPestanaAdmin === pestana.id ? "#2d5a27" : "#64748b",
                    fontWeight: "bold",
                    fontSize: "0.9rem",
                    cursor: "pointer",
                    borderBottom: subPestanaAdmin === pestana.id ? "3px solid #2d5a27" : "3px solid transparent",
                    transition: "all 0.2s"
                  }}
                >
                  {pestana.nombre}
                </button>
              ))}
            </div>

            {/* Contenido por Sub-Pestaña */}
            <div style={{ background: "white", padding: "25px", borderRadius: "12px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
              
              {/* 1. DASHBOARD DE NEGOCIO */}
              {subPestanaAdmin === "dashboard_negocio" && (
                <div>
                  <h3 style={{ color: "#2d5a27", marginTop: 0, marginBottom: "15px" }}>Rendimiento de Inquilino: {nombreEmpresa}</h3>
                  <p style={{ color: "#555", fontSize: "0.9rem", lineHeight: "1.6" }}>
                    Resumen del consumo de recursos, consultas de Inteligencia Artificial y almacenamiento asignado para tu empresa.
                  </p>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "15px", margin: "20px 0" }}>
                    <div style={{ padding: "15px", borderRadius: "8px", background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                      <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "bold" }}>CONSULTAS IA USADAS</span>
                      <strong style={{ display: "block", fontSize: "1.5rem", color: "#2d5a27", marginTop: "5px" }}>8,420 / 10,000</strong>
                      <span style={{ fontSize: "0.7rem", color: "#94a3b8" }}>Reinicia en 4 días</span>
                    </div>
                    <div style={{ padding: "15px", borderRadius: "8px", background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                      <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "bold" }}>ALMACENAMIENTO DE VIDEO</span>
                      <strong style={{ display: "block", fontSize: "1.5rem", color: "#2d5a27", marginTop: "5px" }}>2.4 GB / 10 GB</strong>
                      <span style={{ fontSize: "0.7rem", color: "#94a3b8" }}>Capacidad de almacenamiento</span>
                    </div>
                    <div style={{ padding: "15px", borderRadius: "8px", background: "#f8fafc", border: "1px solid #e2e8f0" }}>
                      <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: "bold" }}>USUARIOS ACTIVOS</span>
                      <strong style={{ display: "block", fontSize: "1.5rem", color: "#2d5a27", marginTop: "5px" }}>12 Operarios</strong>
                      <span style={{ fontSize: "0.7rem", color: "#94a3b8" }}>3 administradores / 9 campo</span>
                    </div>
                  </div>

                  {/* Gráfico de Consumo API (SVG) */}
                  <div style={{ border: "1px solid #e2e8f0", borderRadius: "8px", padding: "20px", marginTop: "20px" }}>
                    <h4 style={{ margin: "0 0 15px 0", color: "#1a2e1a" }}>Consumo Diario de Censo IA (Llamadas API)</h4>
                    <div style={{ height: "150px", display: "flex", alignItems: "flex-end", gap: "8px" }}>
                      <div style={{ flex: 1, background: "#aac9a0", height: "45%", borderRadius: "3px 3px 0 0" }}></div>
                      <div style={{ flex: 1, background: "#aac9a0", height: "60%", borderRadius: "3px 3px 0 0" }}></div>
                      <div style={{ flex: 1, background: "#2d5a27", height: "85%", borderRadius: "3px 3px 0 0" }}></div>
                      <div style={{ flex: 1, background: "#aac9a0", height: "70%", borderRadius: "3px 3px 0 0" }}></div>
                      <div style={{ flex: 1, background: "#2d5a27", height: "90%", borderRadius: "3px 3px 0 0" }}></div>
                      <div style={{ flex: 1, background: "#aac9a0", height: "65%", borderRadius: "3px 3px 0 0" }}></div>
                      <div style={{ flex: 1, background: "#10b981", height: "100%", borderRadius: "3px 3px 0 0" }}></div>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#64748b", marginTop: "5px" }}>
                      <span>Lunes</span>
                      <span>Miércoles</span>
                      <span>Hoy</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. CONFIGURACIÓN DEL INQUILINO */}
              {subPestanaAdmin === "config_inquilino" && (
                <div>
                  <h3 style={{ color: "#2d5a27", marginTop: 0, marginBottom: "15px" }}>Datos y Configuración de la Empresa</h3>
                  
                  <form onSubmit={(e) => { e.preventDefault(); alert("Configuración corporativa de inquilino actualizada con éxito."); }} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                    <div>
                      <label style={{ display: "block", marginBottom: "5px", color: "#4a5568", fontWeight: "600", fontSize: "0.85rem" }}>Razon Social / Nombre Empresa</label>
                      <input 
                        type="text" 
                        value={nombreEmpresa} 
                        onChange={(e) => setNombreEmpresa(e.target.value)} 
                        style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                        required
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", marginBottom: "5px", color: "#4a5568", fontWeight: "600", fontSize: "0.85rem" }}>Identificación Fiscal / RFC</label>
                      <input 
                        type="text" 
                        value={rfcEmpresa} 
                        onChange={(e) => setRfcEmpresa(e.target.value)} 
                        style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                        required
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", marginBottom: "5px", color: "#4a5568", fontWeight: "600", fontSize: "0.85rem" }}>Porcentaje Impuestos (IVA %)</label>
                      <input 
                        type="number" 
                        value={ivaEmpresa} 
                        onChange={(e) => setIvaEmpresa(e.target.value)} 
                        style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                        required
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", marginBottom: "5px", color: "#4a5568", fontWeight: "600", fontSize: "0.85rem" }}>Método de Pago Predeterminado</label>
                      <select 
                        value={metodoPagoEmpresa} 
                        onChange={(e) => setMetodoPagoEmpresa(e.target.value)}
                        style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                      >
                        <option value="tarjeta">Tarjeta de Crédito terminada en 4321</option>
                        <option value="transferencia">Transferencia Bancaria Directa</option>
                        <option value="paypal">PayPal Business Account</option>
                      </select>
                    </div>
                    <div style={{ gridColumn: "1 / -1" }}>
                      <label style={{ display: "block", marginBottom: "5px", color: "#4a5568", fontWeight: "600", fontSize: "0.85rem" }}>Logotipo de la Empresa</label>
                      <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
                        <div style={{ width: "60px", height: "60px", border: "1px dashed #cbd5e1", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc" }}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2d5a27" strokeWidth="2">
                            <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.58 0 8a7 7 0 0 1-8 10z"></path>
                          </svg>
                        </div>
                        <button type="button" onClick={() => alert("Simulación: Subiendo logotipo personalizado...")} style={{ background: "white", border: "1px solid #cbd5e1", padding: "8px 15px", borderRadius: "6px", fontWeight: "bold", fontSize: "0.8rem", cursor: "pointer" }}>
                          Cambiar Logotipo
                        </button>
                      </div>
                    </div>

                    <button type="submit" style={{ background: "#2d5a27", color: "white", padding: "12px 20px", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", gridColumn: "1 / -1", marginTop: "10px" }}>
                      Guardar Configuración Corporativa
                    </button>
                  </form>
                </div>
              )}

              {/* 3. GESTIÓN DE USUARIOS Y ROLES */}
              {subPestanaAdmin === "usuarios" && (
                <div>
                  <h3 style={{ color: "#2d5a27", marginTop: 0, marginBottom: "15px" }}>Invitación de Empleados y Control de Accesos</h3>
                  
                  <div style={{ display: "flex", gap: "30px", flexWrap: "wrap", marginBottom: "30px" }}>
                    {/* Formulario invitar */}
                    <div style={{ background: "#f8fafc", padding: "20px", borderRadius: "10px", border: "1px solid #cbd5e1", flex: 1, minWidth: "250px" }}>
                      <h4 style={{ color: "#2d5a27", marginTop: 0, marginBottom: "15px" }}>Invitar Nuevo Colaborador</h4>
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        if (!inviteEmail) return;
                        const nuevo = {
                          id: Date.now(),
                          nombre: inviteEmail.split("@")[0],
                          email: inviteEmail,
                          rol: inviteRole === "admin" ? "Administrador" : "Supervisor",
                          estado: "Invitación Pendiente"
                        };
                        setUsuariosRegistrados([...usuariosRegistrados, nuevo]);
                        setInviteEmail("");
                        alert(`Invitación enviada con éxito a ${inviteEmail}`);
                      }} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        <div>
                          <label style={{ display: "block", marginBottom: "3px", fontSize: "0.8rem", fontWeight: "600", color: "#4a5568" }}>Correo Electrónico</label>
                          <input 
                            type="email" 
                            placeholder="correo@empresa.com" 
                            value={inviteEmail}
                            onChange={(e) => setInviteEmail(e.target.value)}
                            style={{ width: "100%", padding: "8px", borderRadius: "5px", border: "1px solid #cbd5e1", boxSizing: "border-box" }}
                            required
                          />
                        </div>
                        <div>
                          <label style={{ display: "block", marginBottom: "3px", fontSize: "0.8rem", fontWeight: "600", color: "#4a5568" }}>Rol de Acceso</label>
                          <select 
                            value={inviteRole} 
                            onChange={(e) => setInviteRole(e.target.value)}
                            style={{ width: "100%", padding: "8px", borderRadius: "5px", border: "1px solid #cbd5e1", background: "white" }}
                          >
                            <option value="supervisor">Supervisor de Finca</option>
                            <option value="admin">Administrador Corporativo</option>
                          </select>
                        </div>
                        <button type="submit" style={{ background: "#2d5a27", color: "white", padding: "10px", border: "none", borderRadius: "5px", fontWeight: "bold", cursor: "pointer", marginTop: "5px" }}>
                          Enviar Invitación
                        </button>
                      </form>
                    </div>

                    {/* Tabla de Usuarios */}
                    <div style={{ flex: 1.5, minWidth: "300px" }}>
                      <h4 style={{ color: "#1a2e1a", marginTop: 0, marginBottom: "15px" }}>Usuarios y Roles Activos</h4>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                        <thead>
                          <tr style={{ borderBottom: "2px solid #aac9a0", color: "#2d5a27", fontWeight: "bold", textAlign: "left" }}>
                            <th style={{ padding: "8px" }}>Nombre</th>
                            <th style={{ padding: "8px" }}>Rol</th>
                            <th style={{ padding: "8px" }}>Estado</th>
                            <th style={{ padding: "8px" }}>Acción</th>
                          </tr>
                        </thead>
                        <tbody>
                          {usuariosRegistrados.map(user => (
                            <tr key={user.id} style={{ borderBottom: "1px solid #f0f4f0" }}>
                              <td style={{ padding: "8px" }}>
                                <strong style={{ color: "#1a2e1a", display: "block" }}>{user.nombre}</strong>
                                <span style={{ fontSize: "0.75rem", color: "#666" }}>{user.email}</span>
                              </td>
                              <td style={{ padding: "8px" }}>
                                <span style={{ background: user.rol === "Administrador" ? "#fee2e2" : "#e0f2fe", color: user.rol === "Administrador" ? "#991b1b" : "#0369a1", padding: "2px 8px", borderRadius: "4px", fontSize: "0.75rem", fontWeight: "bold" }}>
                                  {user.rol}
                                </span>
                              </td>
                              <td style={{ padding: "8px" }}>
                                <span style={{ background: user.estado === "Activo" ? "#d1fae5" : "#fef3c7", color: user.estado === "Activo" ? "#065f46" : "#d97706", padding: "2px 8px", borderRadius: "4px", fontSize: "0.75rem", fontWeight: "bold" }}>
                                  {user.estado}
                                </span>
                              </td>
                              <td style={{ padding: "8px" }}>
                                <div style={{ display: "flex", gap: "8px" }}>
                                  <button 
                                    onClick={() => alert(`Editar usuario: ${user.nombre}`)}
                                    style={{ background: "transparent", border: "none", color: "#475569", fontWeight: "bold", cursor: "pointer", fontSize: "0.8rem" }}
                                  >
                                    Editar
                                  </button>
                                  <button 
                                    onClick={() => {
                                      const nuevoEstado = user.estado === "Activo" ? "Suspendido" : "Activo";
                                      setUsuariosRegistrados(usuariosRegistrados.map(x => x.id === user.id ? { ...x, estado: nuevoEstado } : x));
                                    }}
                                    style={{ background: "transparent", border: "none", color: user.estado === "Activo" ? "#d97706" : "#10b981", fontWeight: "bold", cursor: "pointer", fontSize: "0.8rem" }}
                                  >
                                    {user.estado === "Activo" ? "Suspender" : "Activar"}
                                  </button>
                                  <button 
                                    onClick={() => {
                                      if (confirm(`¿Seguro que deseas eliminar a ${user.nombre}?`)) {
                                        setUsuariosRegistrados(usuariosRegistrados.filter(x => x.id !== user.id));
                                      }
                                    }}
                                    style={{ background: "transparent", border: "none", color: "#dc2626", fontWeight: "bold", cursor: "pointer", fontSize: "0.8rem" }}
                                  >
                                    Eliminar
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. PROGRAMADOR */}
              {subPestanaAdmin === "programador" && (
                <div>
                  <h3 style={{ color: "#2d5a27", marginTop: 0, marginBottom: "15px" }}>Configuración del Programador (Scheduler)</h3>
                  <p style={{ color: "#555", fontSize: "0.9rem", lineHeight: "1.6" }}>
                    Ajusta la frecuencia con la que los operarios deben subir los videos de censo y con la que el sistema debe reportar alertas fitosanitarias a la gerencia.
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginTop: "20px" }}>
                    <div>
                      <label style={{ display: "block", marginBottom: "5px", color: "#4a5568", fontWeight: "600", fontSize: "0.85rem" }}>Frecuencia de Censo Obligatorio</label>
                      <select 
                        value={frecuenciaCenso} 
                        onChange={(e) => setFrecuenciaCenso(e.target.value)}
                        style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                      >
                        <option value="Diario">Cada 24 Horas (Diario)</option>
                        <option value="Semanal">Cada 7 Días (Semanal)</option>
                        <option value="Interdiario">Día de por medio</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: "block", marginBottom: "5px", color: "#4a5568", fontWeight: "600", fontSize: "0.85rem" }}>Notificación de Alertas Sanitarias (Plagas)</label>
                      <select 
                        value={frecuenciaAlertas} 
                        onChange={(e) => setFrecuenciaAlertas(e.target.value)}
                        style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                      >
                        <option value="Inmediato">Inmediato (Tiempo Real)</option>
                        <option value="Resumen Diario">Resumen Diario al Finalizar Jornada</option>
                        <option value="Nunca">Solo en Dashboard</option>
                      </select>
                    </div>
                  </div>
                  <button 
                    onClick={() => alert("Parámetros del programador guardados en la simulación.")}
                    style={{ background: "#2d5a27", color: "white", padding: "12px 25px", border: "none", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", marginTop: "25px" }}
                  >
                    Guardar Parámetros
                  </button>
                </div>
              )}

              {/* 5. CATÁLOGO DE ESPECIES */}
              {subPestanaAdmin === "catalogo" && (
                <div>
                  <h3 style={{ color: "#2d5a27", marginTop: 0, marginBottom: "20px" }}>Catálogo de Especies y Variedades de Flores</h3>
                  
                  <div style={{ display: "flex", gap: "30px", flexWrap: "wrap" }}>
                    {/* Formulario Añadir Especie */}
                    <div style={{ background: "#f8fafc", padding: "20px", borderRadius: "10px", border: "1px solid #cbd5e1", flex: 1, minWidth: "250px" }}>
                      <h4 style={{ color: "#2d5a27", marginTop: 0, marginBottom: "15px" }}>Agregar Nueva Variedad</h4>
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        const nueva = {
                          id: Date.now(),
                          nombre: nuevaEspecie.nombre,
                          ciclo: parseInt(nuevaEspecie.ciclo) || 12,
                          largo: nuevaEspecie.largo || "70cm",
                          humedad: nuevaEspecie.humedad || "65%"
                        };
                        setEspeciesCatalogo([...especiesCatalogo, nueva]);
                        setNuevaEspecie({ nombre: "", ciclo: "", largo: "", humedad: "" });
                        alert("Simulación: Variedad agregada al catálogo.");
                      }} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        <div>
                          <label style={{ display: "block", marginBottom: "3px", fontSize: "0.8rem", fontWeight: "600", color: "#4a5568" }}>Nombre Comercial</label>
                          <input 
                            type="text" 
                            placeholder="Ej: Rosa Mondial" 
                            value={nuevaEspecie.nombre}
                            onChange={(e) => setNuevaEspecie({ ...nuevaEspecie, nombre: e.target.value })}
                            style={{ width: "100%", padding: "8px", borderRadius: "5px", border: "1px solid #cbd5e1", boxSizing: "border-box" }}
                            required
                          />
                        </div>
                        <div>
                          <label style={{ display: "block", marginBottom: "3px", fontSize: "0.8rem", fontWeight: "600", color: "#4a5568" }}>Ciclo Crecimiento (Semanas)</label>
                          <input 
                            type="number" 
                            placeholder="Ej: 12" 
                            value={nuevaEspecie.ciclo}
                            onChange={(e) => setNuevaEspecie({ ...nuevaEspecie, ciclo: e.target.value })}
                            style={{ width: "100%", padding: "8px", borderRadius: "5px", border: "1px solid #cbd5e1", boxSizing: "border-box" }}
                            required
                          />
                        </div>
                        <div>
                          <label style={{ display: "block", marginBottom: "3px", fontSize: "0.8rem", fontWeight: "600", color: "#4a5568" }}>Largo de Exportación Objetivo</label>
                          <input 
                            type="text" 
                            placeholder="Ej: 70-80cm" 
                            value={nuevaEspecie.largo}
                            onChange={(e) => setNuevaEspecie({ ...nuevaEspecie, largo: e.target.value })}
                            style={{ width: "100%", padding: "8px", borderRadius: "5px", border: "1px solid #cbd5e1", boxSizing: "border-box" }}
                            required
                          />
                        </div>
                        <div>
                          <label style={{ display: "block", marginBottom: "3px", fontSize: "0.8rem", fontWeight: "600", color: "#4a5568" }}>Humedad Óptima (%)</label>
                          <input 
                            type="text" 
                            placeholder="Ej: 65%" 
                            value={nuevaEspecie.humedad}
                            onChange={(e) => setNuevaEspecie({ ...nuevaEspecie, humedad: e.target.value })}
                            style={{ width: "100%", padding: "8px", borderRadius: "5px", border: "1px solid #cbd5e1", boxSizing: "border-box" }}
                            required
                          />
                        </div>
                        <button type="submit" style={{ background: "#2d5a27", color: "white", padding: "10px", border: "none", borderRadius: "5px", fontWeight: "bold", cursor: "pointer", marginTop: "5px" }}>
                          Guardar Variedad
                        </button>
                      </form>
                    </div>

                    {/* Listado de Especies */}
                    <div style={{ flex: 1.5, minWidth: "300px" }}>
                      <h4 style={{ color: "#1a2e1a", marginTop: 0, marginBottom: "15px" }}>Especies Registradas en el Sistema</h4>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                        <thead>
                          <tr style={{ borderBottom: "2px solid #aac9a0", color: "#2d5a27", fontWeight: "bold", textAlign: "left" }}>
                            <th style={{ padding: "8px" }}>Nombre</th>
                            <th style={{ padding: "8px" }}>Ciclo Prom.</th>
                            <th style={{ padding: "8px" }}>Largo Obj.</th>
                            <th style={{ padding: "8px" }}>Humedad Ópt.</th>
                          </tr>
                        </thead>
                        <tbody>
                          {especiesCatalogo.map(esp => (
                            <tr key={esp.id} style={{ borderBottom: "1px solid #f0f4f0" }}>
                              <td style={{ padding: "8px", fontWeight: "bold" }}>{esp.nombre}</td>
                              <td style={{ padding: "8px" }}>{esp.ciclo} semanas</td>
                              <td style={{ padding: "8px" }}>{esp.largo}</td>
                              <td style={{ padding: "8px" }}>{esp.humedad}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              )}

              {/* 6. PLANES Y TARIFAS */}
              {subPestanaAdmin === "planes" && (
                <div>
                  <h3 style={{ color: "#2d5a27", marginTop: 0, marginBottom: "15px" }}>Configuración de Planes y Tarifas</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px" }}>
                    {[
                      { nombre: "Plan Básico", precio: "$50", caracteristicas: "Hasta 2 Invernaderos, 10 camas, 1 administrador" },
                      { nombre: "Plan Profesional", precio: "$150", caracteristicas: "Hasta 10 Invernaderos, 50 camas, ilimitados operarios" },
                      { nombre: "Plan Corporativo", precio: "$300", caracteristicas: "Invernaderos y camas ilimitadas, reportes IA avanzados" }
                    ].map((plan, i) => (
                      <div key={i} style={{ border: "1px solid #cbd5e1", borderRadius: "10px", padding: "20px", background: "#f8fafc" }}>
                        <h4 style={{ margin: "0 0 10px 0", color: "#1a2e1a" }}>{plan.nombre}</h4>
                        <div style={{ fontSize: "1.8rem", fontWeight: "bold", color: "#2d5a27", marginBottom: "10px" }}>{plan.precio} <span style={{ fontSize: "0.85rem", color: "#666", fontWeight: "normal" }}>/mes</span></div>
                        <p style={{ fontSize: "0.8rem", color: "#555", margin: 0 }}>{plan.caracteristicas}</p>
                        <button 
                          onClick={() => alert(`Simulación: Editando plan ${plan.nombre}.`)}
                          style={{ width: "100%", marginTop: "15px", background: "white", border: "1px solid #cbd5e1", borderRadius: "6px", padding: "8px", fontWeight: "bold", cursor: "pointer" }}
                        >
                          Editar Tarifas
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// --- SUB-COMPONENTES INTERNOS DE MOCK ---
function Bar({ height, label, count }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, gap: "8px" }}>
      <span style={{ fontSize: "0.8rem", fontWeight: "bold", color: "#2d5a27" }}>{count}</span>
      <div style={{ width: "24px", height: height, background: "#2d5a27", borderRadius: "4px 4px 0 0", transition: "height 0.5s" }}></div>
      <span style={{ fontSize: "0.75rem", color: "#666", fontWeight: "600", textTransform: "uppercase" }}>{label}</span>
    </div>
  );
}

// Icons
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

function UsersIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
      <circle cx="9" cy="7" r="4"></circle>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
      <polyline points="9 22 9 12 15 12 15 22"></polyline>
    </svg>
  );
}

function CardIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
      <line x1="1" y1="10" x2="23" y2="10"></line>
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
      <polyline points="17 8 12 3 7 8"></polyline>
      <line x1="12" y1="3" x2="12" y2="15"></line>
    </svg>
  );
}

function DatabaseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
      <path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"></path>
    </svg>
  );
}

function TrendingUpIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
      <polyline points="17 6 23 6 23 12"></polyline>
    </svg>
  );
}

function LeafIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.58 0 8a7 7 0 0 1-8 10z"></path>
      <line x1="9" y1="22" x2="11" y2="20"></line>
    </svg>
  );
}

function LogOutIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
      <polyline points="16 17 21 12 16 7"></polyline>
      <line x1="21" y1="12" x2="9" y2="12"></line>
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12"></line>
      <line x1="3" y1="6" x2="21" y2="6"></line>
      <line x1="3" y1="18" x2="21" y2="18"></line>
    </svg>
  );
}

function MapIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
      <line x1="8" y1="2" x2="8" y2="18"></line>
      <line x1="16" y1="6" x2="16" y2="22"></line>
    </svg>
  );
}

function SmartphoneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
      <line x1="12" y1="18" x2="12.01" y2="18"></line>
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    </svg>
  );
}

function ScissorsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="6" r="3"></circle>
      <circle cx="6" cy="18" r="3"></circle>
      <line x1="9.8" y1="8.2" x2="21" y2="19.4"></line>
      <line x1="9.8" y1="15.8" x2="21" y2="4.6"></line>
    </svg>
  );
}

function DropletIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"></circle>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
    </svg>
  );
}
