import React, { useState, useEffect } from "react";
import axios from "axios";
import { Player } from "@lottiefiles/react-lottie-player";
import animacionCargando from "./cargando.json";

// Importación de componentes de Layout
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

// Importación de componentes de Páginas
import ConfiguracionCamas from "./pages/ConfiguracionCamas";
import IngresoDatos from "./pages/IngresoDatos";
import DatosConsolidados from "./pages/DatosConsolidados";
import Proyecciones from "./pages/Proyecciones";
import ProyeccionGlobalPage from "./pages/ProyeccionGlobalPage";
import Cosecha from "./pages/Cosecha";






const API = import.meta.env.VITE_API_URL ||"http://127.0.0.1:8000";

const TITULOS = {
  configuracion: "Configuración de Camas",
  cama_completa: "Ingreso de Datos",
  consolidado: "Datos Consolidados",
  proyecciones: "Proyección por Cama",
  proyeccion_global: "Proyección Global",
  podas: "Registro de Cosecha / Poda",
};

export default function App() {
  const [cargandoInicial, setCargandoInicial] = useState(true);
  const [colapsado, setColapsado] = useState(false);
  const [seccion, setSeccion] = useState("cama_completa");
  const [camas, setCamas] = useState([]);
  const [fechas, setFechas] = useState([]);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null);
  const [registrosDia, setRegistrosDia] = useState([]);
  const [consolidadoFecha, setConsolidadoFecha] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [recargarProyecciones, setRecargarProyecciones] = useState(0);
  const [camaFiltro, setCamaFiltro] = useState("");
  const [listaPodas, setListaPodas] = useState([]);
  const [precisionPodas, setPrecisionPodas] = useState({});
  const [cargandoPodas, setCargandoPodas] = useState(false);

  const getFechaEcuador = () => {
    const d = new Date();
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Guayaquil",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    return formatter.format(d); // YYYY-MM-DD
  };

  useEffect(() => {
    const TIEMPO_MINIMO = 2000;
    const inicio = Date.now();

    // Cargar camas independientemente
    axios.get(`${API}/camas/`)
      .then((c) => {
        setCamas(c.data);
      })
      .catch((err) => {
        console.error("Error cargando camas:", err);
      });

    // Cargar fechas de forma independiente con fallback para el dia de hoy
    axios.get(`${API}/reportes/fechas-disponibles`)
      .then((f) => {
        let fs = [...f.data.fechas];
        const hoyEC = getFechaEcuador();
        const hoyEC_format = hoyEC.split("-").reverse().join("-");
        if (!fs.includes(hoyEC_format)) {
          fs = [hoyEC_format, ...fs];
        }
        setFechas(fs);
        setFechaSeleccionada(hoyEC);
      })
      .catch((err) => {
        console.error("Error cargando fechas disponibles:", err);
        const hoyEC = getFechaEcuador();
        setFechas([hoyEC.split("-").reverse().join("-")]);
        setFechaSeleccionada(hoyEC);
      })
      .finally(() => {
        const tiempoTranscurrido = Date.now() - inicio;
        const tiempoRestante = Math.max(0, TIEMPO_MINIMO - tiempoTranscurrido);
        setTimeout(() => {
          setCargandoInicial(false);
        }, tiempoRestante);
      });
  }, []);

  useEffect(() => {
    if (!fechaSeleccionada || camas.length === 0) return;
    if (seccion === "consolidado") {
      setCargando(true);
      axios
        .get(`${API}/reportes/consolidado-fecha/${fechaSeleccionada}`)
        .then((r) => setConsolidadoFecha(r.data.camas || []))
        .finally(() => setCargando(false));
    }
  }, [fechaSeleccionada, seccion, camas]);

  useEffect(() => {
    if (seccion !== "podas") return;
    const cama = camaFiltro;
    if (!cama) {
      setListaPodas([]);
      setPrecisionPodas({});
      return;
    }
    setCargandoPodas(true);
    Promise.all([
      axios.get(`${API}/podas/${cama}`),
      axios.get(`${API}/reportes/precision-proyeccion/${cama}`),
    ])
      .then(([podasRes, precisionRes]) => {
        setListaPodas(podasRes.data);
        const mapaPorFecha = {};
        precisionRes.data.historial.forEach((p) => {
          mapaPorFecha[p.fecha] = p;
        });
        setPrecisionPodas(mapaPorFecha);
      })
      .finally(() => setCargandoPodas(false));
  }, [camaFiltro, seccion, recargarProyecciones]);

  const consolidadoFiltrado = consolidadoFecha.filter(
    (c) => !camaFiltro || String(c.cama_id) === camaFiltro
  );
  const camasFiltradas = camas.filter((c) => !camaFiltro || String(c.id) === camaFiltro);

  if (cargandoInicial) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#f0f4f0" }}>
        <Player src={animacionCargando} autoplay loop style={{ width: "180px", height: "180px" }} />
        <p style={{ color: "#2d5a27", fontWeight: "600", fontSize: "1rem", marginTop: "16px", letterSpacing: "0.03em" }}>
          Cargando sistema...
        </p>
      </div>
    );
  }

  // Componente reutilizable para los filtros contextuales locales de cada vista
  const FilaFiltros = ({ conFecha = false }) => (
    <div
      style={{
        display: "flex",
        gap: "16px",
        alignItems: "center",
        marginBottom: "20px",
        padding: "12px 16px",
        background: "white",
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        flexWrap: "wrap",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "#4a5568" }}>Cama:</label>
        <select
          value={camaFiltro}
          onChange={(e) => setCamaFiltro(e.target.value)}
          style={{
            padding: "6px 12px",
            borderRadius: "8px",
            border: "1px solid #aac9a0",
            fontSize: "0.9rem",
            cursor: "pointer",
            outline: "none",
          }}
        >
          <option value="">Todas las camas</option>
          {camas.map((c) => (
            <option key={c.id} value={String(c.id)}>
              {c.nombre}
            </option>
          ))}
        </select>
      </div>
      {conFecha && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <label style={{ fontSize: "0.85rem", fontWeight: "600", color: "#4a5568" }}>Fecha:</label>
          <select
            value={fechaSeleccionada || ""}
            onChange={(e) => setFechaSeleccionada(e.target.value)}
            style={{
              padding: "6px 12px",
              borderRadius: "8px",
              border: "1px solid #aac9a0",
              fontSize: "0.9rem",
              cursor: "pointer",
              outline: "none",
            }}
          >
            {fechas.map((f) => {
              const parts = f.split("-");
              const display = `${parts[2]}/${parts[1]}/${parts[0]}`;
              const val = `${parts[2]}-${parts[1]}-${parts[0]}`;
              return (
                <option key={f} value={val}>
                  {display}
                </option>
              );
            })}
          </select>
        </div>
      )}
    </div>
  );

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: "#f0f4f0", fontFamily: "sans-serif" }}>
      {/* Sidebar Colapsable */}
      <Sidebar seccion={seccion} setSeccion={setSeccion} colapsado={colapsado} setColapsado={setColapsado} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Header Limpio */}
        <Header titulo={TITULOS[seccion] || ""} colapsado={colapsado} setColapsado={setColapsado} />

        {/* Content Wrapper */}
        <div style={{ flex: 1, overflow: "auto", padding: "24px" }}>
          
          {seccion === "configuracion" && (
            <ConfiguracionCamas
              onCambio={() => {
                axios.get(`${API}/camas/`).then((r) => setCamas(r.data));
              }}
            />
          )}

          {seccion === "cama_completa" && (
            <IngresoDatos
              camas={camas}
              onCargaExitosa={() => {
                axios.get(`${API}/reportes/fechas-disponibles`).then((r) => {
                  let fs = [...r.data.fechas];
                  const hoyEC = getFechaEcuador();
                  const hoyEC_format = hoyEC.split("-").reverse().join("-");
                  if (!fs.includes(hoyEC_format)) {
                    fs = [hoyEC_format, ...fs];
                  }
                  setFechas(fs);
                  setFechaSeleccionada(hoyEC);
                });
              }}
            />
          )}

          {seccion === "consolidado" && (
            <div>
              <FilaFiltros conFecha={true} />
              <DatosConsolidados consolidadoFiltrado={consolidadoFiltrado} cargando={cargando} />
            </div>
          )}

          {seccion === "podas" && (
            <div>
              <FilaFiltros conFecha={false} />
              <Cosecha
                camas={camas}
                camaFiltro={camaFiltro}
                listaPodas={listaPodas}
                cargandoPodas={cargandoPodas}
                precisionPodas={precisionPodas}
                setRecargarProyecciones={setRecargarProyecciones}
                setListaPodas={setListaPodas}
                setCargandoPodas={setCargandoPodas}
              />
            </div>
          )}

          {seccion === "proyecciones" && (
            <div>
              <FilaFiltros conFecha={false} />
              <Proyecciones camasFiltradas={camasFiltradas} recargarProyecciones={recargarProyecciones} />
            </div>
          )}

          {seccion === "proyeccion_global" && (
            <div>
              <FilaFiltros conFecha={false} />
              <ProyeccionGlobalPage camasFiltradas={camasFiltradas} />
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
