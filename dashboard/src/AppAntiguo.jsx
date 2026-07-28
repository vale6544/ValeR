import { useEffect, useState } from "react"
import axios from "axios"
import {
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie
} from "recharts"
import { Player } from "@lottiefiles/react-lottie-player"
import animacionCargando from "./cargando.json"

import Sidebar from "./components/Sidebar"
import Header from "./components/Header"
import ConfiguracionCamas from "./pages/ConfiguracionCamas"






const API = "http://127.0.0.1:8000"

const ETIQUETAS = {
  cosecha:      "Cosecha",
  estrella:     "Estrella",
  rayando:      "Rayando color",
  rayando_color:"Rayando color",
  garbanzo:     "Garbanzo",
  alberja:      "Alberja",
  arroz:        "Arroz",
  sin_boton:    "Sin boton",
  boton_arroz:         "Boton arroz",
  boton_alberja:       "Boton alberja",
  boton_garbanzo:      "Boton garbanzo",
  boton_rayando_color: "Boton rayando color",
  boton_estrella:      "Boton estrella",
  boton_cosecha:       "Boton cosecha",
  en_apertura:         "En apertura",
  boton_cerrado:       "Boton cerrado",
  flor_abierta:        "Flor abierta",
}

const COLORES = {
  cosecha:      "#ec4899",
  estrella:     "#a78bfa",
  rayando:      "#f97316",
  rayando_color:"#f97316",
  garbanzo:     "#fca5a5",
  alberja:      "#86efac",
  arroz:        "#fde68a",
  sin_boton:    "#e5e7eb",
}

const BOTONES_LIST = [
  {key:"cosecha",   label:"Cosecha",       color:"#ec4899"},
  {key:"estrella",  label:"Estrella",      color:"#a78bfa"},
  {key:"rayando",   label:"Rayando color", color:"#f97316"},
  {key:"garbanzo",  label:"Garbanzo",      color:"#fca5a5"},
  {key:"alberja",   label:"Alberja",       color:"#86efac"},
  {key:"arroz",     label:"Arroz",         color:"#fde68a"},
  {key:"sin_boton", label:"Sin boton",     color:"#e5e7eb"},
]

const TALLOS_LIST = [
  {key:"tallo_largo", label:"Tallo largo", color:"#d1fae5"},
  {key:"tallo_medio", label:"Tallo medio", color:"#dbeafe"},
  {key:"tallo_corto", label:"Tallo corto", color:"#fef3c7"},
]

function MatrizTalloBoton({datos, titulo}) {
  if (!datos) return null
  const getCampo = (tallo, boton) => datos[`${tallo}_${boton}`] || 0
  const totalPorBoton = {}
  const totalPorTallo = {}
  let granTotal = 0
  BOTONES_LIST.forEach(b => {
    totalPorBoton[b.key] = TALLOS_LIST.reduce((s, t) => s + getCampo(t.key, b.key), 0)
  })
  TALLOS_LIST.forEach(t => {
    totalPorTallo[t.key] = BOTONES_LIST.reduce((s, b) => s + getCampo(t.key, b.key), 0)
    granTotal += totalPorTallo[t.key]
  })
  if (granTotal === 0) return (
    <div className="grafico-card">
      <h2>{titulo}</h2>
      <p style={{color:"#999"}}>Sin datos combinados para este registro</p>
    </div>
  )
  return (
    <div className="grafico-card">
      <h2>{titulo}</h2>
      <div style={{overflowX:"auto"}}>
        <table className="tabla">
          <thead>
            <tr>
              <th style={{minWidth:"130px"}}>Tallo</th>
              {BOTONES_LIST.map(b => (
                <th key={b.key} style={{background: b.color + "44", textAlign:"center", minWidth:"75px"}}>{b.label}</th>
              ))}
              <th style={{textAlign:"center", background:"#f0f4f0"}}>Total</th>
            </tr>
          </thead>
          <tbody>
            {TALLOS_LIST.map(t => (
              <tr key={t.key}>
                <td style={{background: t.color, fontWeight:"600"}}>{t.label}</td>
                {BOTONES_LIST.map(b => {
                  const val = getCampo(t.key, b.key)
                  return (
                    <td key={b.key} style={{textAlign:"center", background: val > 0 ? b.color + "33" : "white"}}>
                      {val > 0 ? <strong>{val}</strong> : <span style={{color:"#ddd"}}>-</span>}
                    </td>
                  )
                })}
                <td style={{textAlign:"center", fontWeight:"700", color:"#2d5a27", background:"#f0f4f0"}}>
                  {totalPorTallo[t.key]}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{background:"#f0f4f0", fontWeight:"700"}}>
              <td>Total boton</td>
              {BOTONES_LIST.map(b => (
                <td key={b.key} style={{textAlign:"center"}}>
                  {totalPorBoton[b.key] > 0 ? totalPorBoton[b.key] : "-"}
                </td>
              ))}
              <td style={{textAlign:"center", color:"#2d5a27", fontSize:"1.1rem"}}>{granTotal}</td>
            </tr>
          </tfoot>
        </table>
        <div style={{marginTop:"12px", padding:"10px 14px", background:"#f0fdf4", borderRadius:"8px", borderLeft:"4px solid #2d5a27"}}>
          <span style={{fontWeight:"600", color:"#2d5a27"}}>Listos para cosechar: </span>
          <span style={{fontSize:"1.2rem", fontWeight:"700", color:"#2d5a27"}}>{totalPorBoton["cosecha"] || 0}</span>
          <span style={{color:"#666", fontSize:"0.85rem", marginLeft:"8px"}}>
            ({getCampo("tallo_largo","cosecha")} largo · {getCampo("tallo_medio","cosecha")} medio · {getCampo("tallo_corto","cosecha")} corto)
          </span>
        </div>
      </div>
    </div>
  )
}

function Distribucion({datos, titulo}) {
  const pieData = BOTONES_LIST
    .filter(b => b.key !== "sin_boton")
    .map(b => {
      const val = TALLOS_LIST.reduce((s, t) => s + (datos[`${t.key}_${b.key}`] || 0), 0)
      return {name: b.label, value: val, fill: b.color}
    })
    .filter(d => d.value > 0)
  const total = pieData.reduce((s, d) => s + d.value, 0)
  if (total === 0) return (
    <div className="grafico-card">
      <h2>{titulo}</h2>
      <p style={{color:"#999"}}>Sin datos para mostrar</p>
    </div>
  )
  return (
    <div className="grafico-card">
      <h2>{titulo}</h2>
      <div style={{display:"flex", alignItems:"center", gap:"32px", flexWrap:"wrap"}}>
        <ResponsiveContainer width={260} height={260}>
          <PieChart>
            <Pie data={pieData} cx="50%" cy="50%" innerRadius={65} outerRadius={110}
              dataKey="value" label={({name, value}) => `${name}: ${value}`}>
              {pieData.map((d, i) => <Cell key={i} fill={d.fill} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        <div style={{flex:1, minWidth:"180px"}}>
          {pieData.map(d => (
            <div key={d.name} style={{display:"flex", alignItems:"center", gap:"8px", marginBottom:"8px"}}>
              <div style={{width:"12px", height:"12px", borderRadius:"3px", background:d.fill, flexShrink:0}}></div>
              <div style={{flex:1, fontSize:"0.88rem"}}>{d.name}</div>
              <div style={{fontWeight:"700", minWidth:"28px", textAlign:"right"}}>{d.value}</div>
              <div style={{color:"#999", fontSize:"0.78rem", minWidth:"42px", textAlign:"right"}}>
                {((d.value/total)*100).toFixed(1)}%
              </div>
            </div>
          ))}
          <div style={{borderTop:"2px solid #e8f0e8", marginTop:"8px", paddingTop:"8px", display:"flex", justifyContent:"space-between", fontWeight:"700", color:"#2d5a27"}}>
            <span>Total</span><span>{total}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function ProyeccionCama({camaId, camaNombre, recargar}) {
  const [datos, setDatos] = useState(null)
  const [precision, setPrecision] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!camaId) return
    setDatos(null)
    setError(null)
    axios.get(`${API}/reportes/proyeccion-diaria/${camaId}?dias=14`)
      .then(r => setDatos(r.data))
      .catch(e => setError(e.response?.data?.detail || "Error al cargar la proyeccion"))
    axios.get(`${API}/reportes/precision-proyeccion/${camaId}`)
      .then(r => setPrecision(r.data.historial))
      .catch(() => setPrecision([]))
  }, [camaId, recargar])

  if (error) return (
    <div className="grafico-card">
      <h2>{camaNombre}</h2>
      <p style={{color:"#999"}}>{error} - sube al menos una foto para esta cama</p>
    </div>
  )

  if (!datos) return <div className="cargando">Cargando proyeccion...</div>

  const totalProyectado = datos.dias.reduce((s, d) => s + d.botones_proyectados, 0)

  return (
    <div className="grafico-card">
      <h2>{camaNombre} - Proyeccion diaria (proximos 14 dias)</h2>

      <p style={{color:"#666", fontSize:"0.85rem", marginBottom:"4px"}}>
        Dia consolidado: {datos.dia_consolidado} · {datos.total_registros_consolidados} fotos analizadas ({datos.secciones_incluidas?.join(", ")})
      </p>
      <p style={{color:"#999", fontSize:"0.78rem", marginBottom:"12px"}}>
        Botones actuales por etapa: Cosecha {datos.botones_actuales_por_etapa?.cosecha} · Estrella {datos.botones_actuales_por_etapa?.estrella} · Rayando {datos.botones_actuales_por_etapa?.rayando} · Garbanzo {datos.botones_actuales_por_etapa?.garbanzo} · Alberja {datos.botones_actuales_por_etapa?.alberja} · Arroz {datos.botones_actuales_por_etapa?.arroz}
      </p>

      <div style={{background:"#f0fdf4", borderRadius:"10px", padding:"12px 16px", marginBottom:"16px"}}>
        <div style={{fontWeight:"600", color:"#2d5a27", marginBottom:"8px", fontSize:"0.88rem"}}>
          Ciclo aprendido de esta cama (dias hasta cosecha)
        </div>
        <div style={{display:"flex", gap:"16px", flexWrap:"wrap"}}>
          {[
            {label:"Arroz", val: datos.ciclo_actual.arroz},
            {label:"Alberja", val: datos.ciclo_actual.alberja},
            {label:"Garbanzo", val: datos.ciclo_actual.garbanzo},
            {label:"Rayando color", val: datos.ciclo_actual.rayando},
            {label:"Estrella", val: datos.ciclo_actual.estrella},
          ].map(c => (
            <div key={c.label} style={{textAlign:"center"}}>
              <div style={{fontWeight:"700", fontSize:"1.1rem", color:"#2d5a27"}}>{c.val}</div>
              <div style={{fontSize:"0.75rem", color:"#666"}}>{c.label}</div>
            </div>
          ))}
        </div>
        <div style={{fontSize:"0.75rem", color:"#999", marginTop:"8px"}}>
          Ultima actualizacion: {datos.ultima_actualizacion_ciclo} · Se ajusta automaticamente con cada poda registrada
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={datos.dias} margin={{top:5, right:20, left:0, bottom:5}}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e8f0e8" />
          <XAxis dataKey="fecha" tick={{fontSize:10}} angle={-45} textAnchor="end" height={60} />
          <YAxis />
          <Tooltip />
          <Bar dataKey="botones_proyectados" name="Botones proyectados">
            {datos.dias.map((d, i) => (
              <Cell key={i} fill={d.es_hoy ? "#2d5a27" : "#86efac"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div style={{textAlign:"center", margin:"12px 0", fontWeight:"700", color:"#2d5a27"}}>
        Total proyectado proximos 14 dias: {totalProyectado} botones
      </div>

      <table className="tabla">
        <thead>
          <tr>
            <th>Fecha</th>
            <th style={{textAlign:"center"}}>Botones proyectados</th>
            <th>Origen (etapa actual)</th>
          </tr>
        </thead>
        <tbody>
          {datos.dias.filter(d => d.botones_proyectados > 0 || d.es_hoy).map((d, i) => (
            <tr key={i} style={{background: d.es_hoy ? "#f0fdf4" : "white", fontWeight: d.es_hoy ? "700" : "400"}}>
              <td>{d.fecha} {d.es_hoy && <span style={{color:"#2d5a27", fontSize:"0.75rem"}}>(hoy)</span>}</td>
              <td style={{textAlign:"center"}}>
                {d.botones_proyectados > 0
                  ? <span style={{display:"inline-block", padding:"3px 12px", borderRadius:"20px",
                      background: d.es_hoy ? "#2d5a27" : "#d1fae5",
                      color: d.es_hoy ? "white" : "#065f46", fontWeight:"700"}}>{d.botones_proyectados}</span>
                  : <span style={{color:"#ddd"}}>-</span>}
              </td>
              <td style={{fontSize:"0.82rem", color:"#666"}}>
                {Object.entries(d.origen_etapas).map(([etapa, cant]) => (
                  <span key={etapa} style={{display:"inline-block", marginRight:"4px", padding:"1px 7px",
                    borderRadius:"10px", background: COLORES[etapa] ? COLORES[etapa]+"44" : "#f3f4f6", fontSize:"0.76rem"}}>
                    {ETIQUETAS[etapa] || etapa}: {cant}
                  </span>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {precision && precision.length > 0 && (
        <div style={{marginTop:"24px"}}>
          <h2 style={{fontSize:"0.95rem", color:"#2d5a27", marginBottom:"12px"}}>Comparación Visual: Proyección vs Cosecha Real</h2>
          
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={precision.slice().reverse()} margin={{top:5, right:20, left:0, bottom:5}}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8f0e8" />
              <XAxis dataKey="fecha" tick={{fontSize:10}} />
              <YAxis />
              <Tooltip />
              <Legend wrapperStyle={{fontSize: 12}} />
              <Bar dataKey="proyectado" fill="#86efac" name="Proyectado (IA)" />
              <Bar dataKey="real" fill="#2d5a27" name="Real (Cosechado)" />
            </BarChart>
          </ResponsiveContainer>

          <h2 style={{fontSize:"0.95rem", marginTop:"16px", marginBottom:"8px"}}>Desglose Detallado de Precisión</h2>
          <table className="tabla">
            <thead>
              <tr>
                <th>Fecha</th>
                <th style={{textAlign:"center"}}>Proyectado (IA)</th>
                <th style={{textAlign:"center"}}>Real (Cosechado)</th>
                <th style={{textAlign:"center"}}>Desviación / Error</th>
              </tr>
            </thead>
            <tbody>
              {precision.map((p, i) => (
                <tr key={i}>
                  <td>{p.fecha}</td>
                  <td style={{textAlign:"center"}}>{p.proyectado}</td>
                  <td style={{textAlign:"center", fontWeight:"700"}}>{p.real ?? "-"}</td>
                  <td style={{textAlign:"center", color: p.error_porcentual > 30 ? "#dc2626" : "#166534", fontWeight:"600"}}>
                    {p.error_porcentual !== null ? `${p.error_porcentual}%` : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function ProyeccionGlobal({camas}) {
  const [datos, setDatos] = useState([])
  useEffect(() => {
    if (camas.length === 0) return
    Promise.all(camas.map(c => axios.get(`${API}/reportes/proyeccion/${c.id}`)))
      .then(resultados => {
        const semanas = {}
        resultados.forEach(r => {
          r.data.semanas?.forEach(s => {
            if (!semanas[s.numero_semana]) {
              semanas[s.numero_semana] = {...s, botones_para_cosecha: 0, detalle_etapas: {}, camas: []}
            }
            semanas[s.numero_semana].botones_para_cosecha += s.botones_para_cosecha
            semanas[s.numero_semana].camas.push({nombre: r.data.cama_nombre, cantidad: s.botones_para_cosecha})
            Object.entries(s.detalle_etapas).forEach(([k, v]) => {
              semanas[s.numero_semana].detalle_etapas[k] = (semanas[s.numero_semana].detalle_etapas[k] || 0) + v
            })
          })
        })
        setDatos(Object.values(semanas))
      })
  }, [camas])
  if (datos.length === 0) return <div className="cargando">Cargando proyeccion global...</div>
  const totalGlobal = datos.reduce((s, d) => s + d.botones_para_cosecha, 0)
  return (
    <div className="grafico-card">
      <h2>Proyeccion global - todas las camas</h2>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={datos} margin={{top:10, right:20, left:0, bottom:5}}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e8f0e8" />
          <XAxis dataKey="numero_semana" tickFormatter={v => `Sem ${v}`} />
          <YAxis />
          <Tooltip labelFormatter={v => `Semana ${v}`} />
          <Bar dataKey="botones_para_cosecha" name="Botones para cosecha" fill="#2d5a27" radius={[4,4,0,0]} />
        </BarChart>
      </ResponsiveContainer>
      <table className="tabla" style={{marginTop:"16px"}}>
        <thead>
          <tr>
            <th>Semana</th><th>Mes</th><th>Fecha</th>
            <th style={{textAlign:"center"}}>Total cosecha</th>
            <th>Por cama</th>
          </tr>
        </thead>
        <tbody>
          {datos.map((s, i) => (
            <tr key={i} style={{background: s.es_semana_actual ? "#f0fdf4" : "white", fontWeight: s.es_semana_actual ? "700" : "400"}}>
              <td><span style={{display:"inline-block", padding:"2px 10px", borderRadius:"20px",
                background: s.es_semana_actual ? "#2d5a27" : "#e8f0e8",
                color: s.es_semana_actual ? "white" : "#2d5a27", fontSize:"0.85rem"}}>Sem {s.numero_semana}</span></td>
              <td>{s.mes}</td>
              <td>{s.fecha}</td>
              <td style={{textAlign:"center"}}>
                {s.botones_para_cosecha > 0
                  ? <span style={{display:"inline-block", padding:"3px 12px", borderRadius:"20px",
                      background: s.es_semana_actual ? "#2d5a27" : "#d1fae5",
                      color: s.es_semana_actual ? "white" : "#065f46", fontWeight:"700"}}>{s.botones_para_cosecha}</span>
                  : <span style={{color:"#ddd"}}>-</span>}
              </td>
              <td style={{fontSize:"0.82rem", color:"#666"}}>
                {s.camas?.filter(c => c.cantidad > 0).map(c => (
                  <span key={c.nombre} style={{display:"inline-block", marginRight:"4px", padding:"1px 7px",
                    borderRadius:"10px", background:"#f3f4f6", fontSize:"0.76rem"}}>{c.nombre}: {c.cantidad}</span>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr style={{background:"#f0f4f0", fontWeight:"700"}}>
            <td colSpan="3">Total proyectado todas las camas</td>
            <td style={{textAlign:"center", color:"#2d5a27", fontSize:"1.1rem"}}>{totalGlobal}</td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

function RegistroPoda({camas, camaFiltro, onPodaRegistrada}) {
  const [camaId, setCamaId] = useState(camaFiltro || "")
  const [largos, setLargos] = useState("")
  const [medios, setMedios] = useState("")
  const [cortos, setCortos] = useState("")
  const [obs, setObs] = useState("")
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState(null)

  useEffect(() => { if (camaFiltro) setCamaId(camaFiltro) }, [camaFiltro])

  const guardar = () => {
    if (!camaId) return setMensaje({tipo:"error", texto:"Selecciona una cama"})
    const total = (parseInt(largos)||0) + (parseInt(medios)||0) + (parseInt(cortos)||0)
    if (total === 0) return setMensaje({tipo:"error", texto:"Ingresa al menos un tallo podado"})
    setGuardando(true)
    axios.post(`${API}/podas/`, {
      cama_id: parseInt(camaId),
      tallos_largos: parseInt(largos) || 0,
      tallos_medios: parseInt(medios) || 0,
      tallos_cortos: parseInt(cortos) || 0,
      observaciones: obs || null
    }).then(r => {
      setMensaje({tipo:"ok", texto:`Poda registrada - ${r.data.total_podados} tallos en ${r.data.cama}`})
      setLargos(""); setMedios(""); setCortos(""); setObs("")
      onPodaRegistrada(camaId)
    }).catch(() => {
      setMensaje({tipo:"error", texto:"Error al guardar la poda"})
    }).finally(() => setGuardando(false))
  }

  return (
    <div className="grafico-card" style={{marginBottom:"24px"}}>
      <h2>Registrar Cosecha / Poda del día</h2>
      <div style={{display:"flex", gap:"12px", flexWrap:"wrap", alignItems:"flex-end"}}>
        <div>
          <div style={{fontSize:"0.82rem", color:"#666", marginBottom:"4px"}}>Cama</div>
          <select value={camaId} onChange={e => setCamaId(e.target.value)}
            style={{padding:"8px 12px", borderRadius:"8px", border:"1px solid #aac9a0", fontSize:"0.9rem"}}>
            <option value="">Seleccionar...</option>
            {camas.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
        </div>
        {[
          {label:"Tallos largos", val:largos, set:setLargos},
          {label:"Tallos medios", val:medios, set:setMedios},
          {label:"Tallos cortos", val:cortos, set:setCortos},
        ].map(f => (
          <div key={f.label}>
            <div style={{fontSize:"0.82rem", color:"#666", marginBottom:"4px"}}>{f.label}</div>
            <input type="number" min="0" value={f.val} onChange={e => f.set(e.target.value)}
              style={{width:"90px", padding:"8px 10px", borderRadius:"8px", border:"1px solid #aac9a0", fontSize:"0.9rem"}}
              placeholder="0" />
          </div>
        ))}
        <div style={{flex:1, minWidth:"150px"}}>
          <div style={{fontSize:"0.82rem", color:"#666", marginBottom:"4px"}}>Observaciones</div>
          <input type="text" value={obs} onChange={e => setObs(e.target.value)}
            style={{width:"100%", padding:"8px 10px", borderRadius:"8px", border:"1px solid #aac9a0", fontSize:"0.9rem"}}
            placeholder="Opcional" />
        </div>
        <button onClick={guardar} disabled={guardando}
          style={{padding:"8px 20px", background:"#2d5a27", color:"white", border:"none",
            borderRadius:"8px", cursor:"pointer", fontWeight:"600", fontSize:"0.9rem",
            opacity: guardando ? 0.7 : 1}}>
          {guardando ? "Guardando..." : "Registrar poda"}
        </button>
      </div>
      {mensaje && (
        <div style={{marginTop:"12px", padding:"8px 14px", borderRadius:"8px",
          background: mensaje.tipo === "ok" ? "#f0fdf4" : "#fef2f2",
          color: mensaje.tipo === "ok" ? "#065f46" : "#991b1b",
          fontSize:"0.88rem", fontWeight:"600"}}>
          {mensaje.texto}
        </div>
      )}
    </div>
  )
}

function ComparativaCamas({camas}) {
  const [datos, setDatos] = useState(null)

  useEffect(() => {
    axios.get(`${API}/reportes/comparativa-camas`).then(r => setDatos(r.data))
  }, [camas])

  if (!datos) return <div className="cargando">Cargando comparativa...</div>

  const nombresCamas = Object.keys(datos)
  const COLORES_CAMAS = ["#2d5a27", "#3b82f6", "#f97316", "#a78bfa", "#ec4899", "#10b981"]

  const todasFechas = [...new Set(
    nombresCamas.flatMap(n => datos[n].historial.map(h => h.fecha))
  )].sort((a, b) => {
    const [da, ma, ya] = a.split("/")
    const [db, mb, yb] = b.split("/")
    return new Date(`${ya}-${ma}-${da}`) - new Date(`${yb}-${mb}-${db}`)
  })

  const datosLinea = todasFechas.map(fecha => {
    const fila = {fecha}
    nombresCamas.forEach(nombre => {
      const registro = datos[nombre].historial.find(h => h.fecha === fecha)
      fila[nombre] = registro ? registro.total_botones : null
    })
    return fila
  })

  const datosBarras = nombresCamas.map(nombre => ({
    cama: nombre,
    total: datos[nombre].ultimo_total,
    cosecha: datos[nombre].ultimo_cosecha,
  }))

  const iconoTendencia = (t) => {
    if (t === "subiendo") return {icon:"Subiendo", color:"#065f46", bg:"#d1fae5"}
    if (t === "bajando")  return {icon:"Bajando",  color:"#991b1b", bg:"#fee2e2"}
    if (t === "estable")  return {icon:"Estable",  color:"#1e40af", bg:"#dbeafe"}
    return {icon:"Sin datos", color:"#666", bg:"#f3f4f6"}
  }

  return (
    <div>
      <div style={{display:"flex", gap:"16px", marginBottom:"24px", flexWrap:"wrap"}}>
        {nombresCamas.map((nombre, i) => {
          const cama = datos[nombre]
          const t = iconoTendencia(cama.tendencia)
          return (
            <div key={nombre} style={{background:"white", borderRadius:"12px", padding:"16px 20px",
              boxShadow:"0 2px 8px rgba(0,0,0,0.07)", flex:1, minWidth:"180px",
              borderTop:`4px solid ${COLORES_CAMAS[i % COLORES_CAMAS.length]}`}}>
              <div style={{fontWeight:"700", color:"#2d5a27", marginBottom:"8px"}}>{nombre}</div>
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"6px"}}>
                <span style={{fontSize:"0.82rem", color:"#666"}}>Total botones</span>
                <span style={{fontWeight:"700", fontSize:"1.2rem"}}>{cama.ultimo_total}</span>
              </div>
              <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"10px"}}>
                <span style={{fontSize:"0.82rem", color:"#666"}}>Listos cosecha</span>
                <span style={{fontWeight:"700", fontSize:"1.1rem", color:"#ec4899"}}>{cama.ultimo_cosecha}</span>
              </div>
              <div style={{display:"flex", alignItems:"center", gap:"6px"}}>
                <span style={{background:t.bg, color:t.color, padding:"3px 10px",
                  borderRadius:"20px", fontWeight:"700", fontSize:"0.85rem"}}>
                  {t.icon}
                </span>
                <span style={{fontSize:"0.75rem", color:"#999"}}>ultimos dias</span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grafico-card">
        <h2>Evolucion de botones por cama en el tiempo</h2>
        {datosLinea.length < 2
          ? <p style={{color:"#999"}}>Se necesitan al menos 2 fechas de registro para mostrar tendencias</p>
          : <ResponsiveContainer width="100%" height={280}>
              <BarChart data={datosLinea} margin={{top:10, right:20, left:0, bottom:5}}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8f0e8" />
                <XAxis dataKey="fecha" tick={{fontSize:11}} />
                <YAxis />
                <Tooltip />
                <Legend />
                {nombresCamas.map((nombre, i) => (
                  <Bar key={nombre} dataKey={nombre} name={nombre}
                    fill={COLORES_CAMAS[i % COLORES_CAMAS.length]} radius={[4,4,0,0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
        }
      </div>

      <div className="grafico-card">
        <h2>Comparativa actual - Total vs Cosecha por cama</h2>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={datosBarras} margin={{top:10, right:20, left:0, bottom:5}}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e8f0e8" />
            <XAxis dataKey="cama" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="total"   name="Total botones"    fill="#2d5a27" radius={[4,4,0,0]} />
            <Bar dataKey="cosecha" name="Listos cosecha"   fill="#ec4899" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grafico-card">
        <h2>Resumen de tendencias por cama</h2>
        <table className="tabla">
          <thead>
            <tr>
              <th>Cama</th>
              <th style={{textAlign:"center"}}>Ultimo total</th>
              <th style={{textAlign:"center"}}>Listos cosecha</th>
              <th style={{textAlign:"center"}}>% cosecha</th>
              <th style={{textAlign:"center"}}>Tendencia</th>
              <th style={{textAlign:"center"}}>Dias registrados</th>
            </tr>
          </thead>
          <tbody>
            {nombresCamas.map((nombre, i) => {
              const cama = datos[nombre]
              const t = iconoTendencia(cama.tendencia)
              const pct = cama.ultimo_total > 0
                ? ((cama.ultimo_cosecha / cama.ultimo_total) * 100).toFixed(1)
                : 0
              return (
                <tr key={nombre}>
                  <td style={{fontWeight:"600"}}>
                    <span style={{display:"inline-block", width:"10px", height:"10px",
                      borderRadius:"50%", background:COLORES_CAMAS[i % COLORES_CAMAS.length],
                      marginRight:"8px"}}></span>
                    {nombre}
                  </td>
                  <td style={{textAlign:"center", fontWeight:"700"}}>{cama.ultimo_total}</td>
                  <td style={{textAlign:"center", fontWeight:"700", color:"#ec4899"}}>{cama.ultimo_cosecha}</td>
                  <td style={{textAlign:"center"}}>{pct}%</td>
                  <td style={{textAlign:"center"}}>
                    <span style={{background:t.bg, color:t.color, padding:"3px 12px",
                      borderRadius:"20px", fontWeight:"700", fontSize:"0.85rem"}}>
                      {t.icon}
                    </span>
                  </td>
                  <td style={{textAlign:"center", color:"#666"}}>{cama.historial.length}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const INFO_VIDEO = (
  <div style={{fontSize:"0.88rem", color:"#374151", lineHeight:"1.7"}}>
    <strong style={{display:"block", marginBottom:"8px", color:"#2d5a27"}}>Cuando usar video</strong>
    <p style={{margin:"0 0 8px"}}>Para secciones de mas de 0.5 metros de largo. El video permite cubrir toda la cama en un solo recorrido sin duplicar el conteo.</p>
    <strong style={{display:"block", margin:"12px 0 6px", color:"#2d5a27"}}>Especificaciones</strong>
    <ul style={{margin:0, paddingLeft:"18px"}}>
      <li>Camina a paso constante sin detenerte ni retroceder</li>
      <li>Mantén el celular a 1 - 1.5 metros de las plantas</li>
      <li>Angulo frontal o ligeramente diagonal, nunca desde arriba</li>
      <li>Duracion recomendada: entre 30 segundos y 2 minutos por lado</li>
      <li>Incluye la vara de referencia de 100 cm visible al inicio del recorrido</li>
      <li>Graba un video por cada lado (A y B)</li>
    </ul>
  </div>
)

const INFO_FOTO = (
  <div style={{fontSize:"0.88rem", color:"#374151", lineHeight:"1.7"}}>
    <strong style={{display:"block", marginBottom:"8px", color:"#2d5a27"}}>Cuando usar foto</strong>
    <p style={{margin:"0 0 8px"}}>Solo cuando la seccion completa cabe en una sola toma. Recomendado para secciones de maximo 0.5 metros de largo.</p>
    <strong style={{display:"block", margin:"12px 0 6px", color:"#2d5a27"}}>Especificaciones</strong>
    <ul style={{margin:0, paddingLeft:"18px"}}>
      <li>Longitud maxima de la seccion: 0.5 metros</li>
      <li>Distancia recomendada: entre 1 y 1.5 metros de la planta</li>
      <li>Angulo frontal o ligeramente diagonal, nunca desde arriba</li>
      <li>Evita sombras directas o luz solar intensa</li>
      <li>La foto debe incluir la vara de referencia de 100 cm en el borde de la cama</li>
      <li>Sube una foto por cada lado (A y B) en el mismo registro</li>
    </ul>
    <p style={{margin:"12px 0 0", padding:"8px", background:"#fef9c3", borderRadius:"6px", color:"#854d0e", fontSize:"0.82rem"}}>
      Si la cama mide mas de 0.5 metros usa el metodo de video para evitar registros incompletos.
    </p>
  </div>
)

function IngresoDatos({ camas, onCargaExitosa }) {
  const [paso, setPaso] = useState(1)
  const [camaId, setCamaId] = useState("")
  const [secciones, setSecciones] = useState([])
  const [seccion, setSeccion] = useState("")
  const [metodo, setMetodo] = useState("")
  const [infoPanel, setInfoPanel] = useState(null)

  const [archivoA, setArchivoA] = useState(null)
  const [archivoB, setArchivoB] = useState(null)
  const [videoA, setVideoA] = useState(null)
  const [videoB, setVideoB] = useState(null)

  const [cargando, setCargando] = useState(false)
  const [mensaje, setMensaje] = useState(null)

  const colorPrincipal = "#16a34a"
  const colorInactivo = "#d1d5db"

  useEffect(() => {
    if (!camaId) { setSecciones([]); setSeccion(""); return }
    axios.get(`${API}/configuracion/camas/`).then(r => {
      const cama = r.data.find(c => String(c.id) === String(camaId))
      setSecciones(cama?.secciones || [])
      setSeccion("")
    })
  }, [camaId])

  const procesarDatos = async () => {
    setCargando(true)
    setMensaje(null)

    try {
      if (metodo === "video") {
        const llamadas = []

        if (videoA) {
          const fd = new FormData()
          fd.append("cama_id", camaId)
          fd.append("segmento", seccion)
          fd.append("lado", "A")
          fd.append("video", videoA)
          fd.append("cantidad_fotogramas", 8)
          llamadas.push(axios.post(`${API}/registros/cargar-video-combinado/`, fd, {
            headers: {"Content-Type": "multipart/form-data"}, timeout: 300000
          }))
        }

        if (videoB) {
          const fd = new FormData()
          fd.append("cama_id", camaId)
          fd.append("segmento", seccion)
          fd.append("lado", "B")
          fd.append("video", videoB)
          fd.append("cantidad_fotogramas", 8)
          llamadas.push(axios.post(`${API}/registros/cargar-video-combinado/`, fd, {
            headers: {"Content-Type": "multipart/form-data"}, timeout: 300000
          }))
        }

        const resultados = await Promise.all(llamadas)
        const totalTallos = resultados.reduce((s, r) => s + (r.data.total_tallos || 0), 0)
        const lados = [videoA ? "Lado A" : null, videoB ? "Lado B" : null].filter(Boolean).join(" y ")
        setMensaje({ tipo: "ok", texto: `Analisis completado. ${lados} procesados. Total detectado: ${totalTallos} tallos.` })

      } else {
        const fd = new FormData()
        fd.append("cama_id", camaId)
        fd.append("segmento", seccion)
        fd.append("imagen_a", archivoA)
        fd.append("imagen_b", archivoB)
        const r = await axios.post(`${API}/registros/cargar-imagen-doble/`, fd, {
          headers: {"Content-Type": "multipart/form-data"}, timeout: 300000
        })
        const totalTallos = (r.data.lado_A?.total_tallos || 0) + (r.data.lado_B?.total_tallos || 0)
        const lados = "Lado A y Lado B"
        setMensaje({ tipo: "ok", texto: `Analisis completado. ${lados} procesados. Total detectado: ${totalTallos} tallos.` })
      }

      resetFormulario()
      onCargaExitosa()

    } catch (e) {
      setMensaje({ tipo: "error", texto: e.response?.data?.detail || "Ocurrio un error al procesar el archivo." })
    } finally {
      setCargando(false)
    }
  }

  const resetFormulario = () => {
    setPaso(1); setCamaId(""); setSeccion(""); setMetodo(""); setInfoPanel(null)
    setArchivoA(null); setArchivoB(null); setVideoA(null); setVideoB(null)
  }

  const botonProcesarDeshabilitado = cargando ||
    (metodo === "video" ? (!videoA && !videoB) : (!archivoA || !archivoB))

  return (
    <div className="grafico-card" style={{ maxWidth: "800px", margin: "0 auto", marginBottom: "24px", background: "#ffffff", border: "1px solid #e5e7eb" }}>
      <h2 style={{ color: "#1f2937", borderBottom: "1px solid #e5e7eb", paddingBottom: "16px", marginBottom: "24px", fontSize: "1.25rem" }}>
        Registro de Cama
      </h2>

      <div style={{ display: "flex", gap: "12px", marginBottom: "32px", color: "#6b7280", fontWeight: "600", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
        <span style={{ color: paso >= 1 ? colorPrincipal : "inherit" }}>1. Ubicacion</span>
        <span style={{opacity: 0.5}}>/</span>
        <span style={{ color: paso >= 2 ? colorPrincipal : "inherit" }}>2. Metodo</span>
        <span style={{opacity: 0.5}}>/</span>
        <span style={{ color: paso >= 3 ? colorPrincipal : "inherit" }}>3. Archivos</span>
      </div>

      {/* PASO 1 */}
      {paso === 1 && (
        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: "200px" }}>
            <label style={{ display: "block", marginBottom: "8px", color: "#374151", fontWeight: "500", fontSize: "0.95rem" }}>Seleccionar Cama</label>
            <select value={camaId} onChange={e => setCamaId(e.target.value)} style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #d1d5db", backgroundColor: "#f9fafb", fontSize: "0.95rem" }}>
              <option value="">Elegir cama...</option>
              {camas.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>
          <div style={{ flex: 1, minWidth: "200px" }}>
            <label style={{ display: "block", marginBottom: "8px", color: "#374151", fontWeight: "500", fontSize: "0.95rem" }}>Seccion</label>
            <select value={seccion} onChange={e => setSeccion(e.target.value)} disabled={!camaId} style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #d1d5db", backgroundColor: !camaId ? "#e5e7eb" : "#f9fafb", fontSize: "0.95rem" }}>
              <option value="">Elegir seccion...</option>
              {secciones.map(s => <option key={s.id} value={s.nombre}>{s.nombre}</option>)}
            </select>
          </div>
          <div style={{ width: "100%", marginTop: "16px", display: "flex", justifyContent: "flex-end" }}>
            <button onClick={() => setPaso(2)} disabled={!camaId || !seccion} style={{ padding: "12px 32px", background: (!camaId || !seccion) ? colorInactivo : colorPrincipal, color: "white", border: "none", borderRadius: "8px", cursor: (!camaId || !seccion) ? "not-allowed" : "pointer", fontWeight: "600", fontSize: "0.95rem" }}>
              Siguiente paso
            </button>
          </div>
        </div>
      )}

      {/* PASO 2 */}
      {paso === 2 && (
        <div>
          <p style={{ color: "#374151", fontWeight: "600", fontSize: "1.05rem", marginBottom: "6px" }}>
            Selecciona el metodo de captura
          </p>
          <p style={{ color: "#6b7280", fontSize: "0.88rem", marginBottom: "20px" }}>
            Usa video para camas de mas de 0.5 metros. Usa foto solo cuando la seccion completa cabe en una sola toma.
          </p>

          <div style={{ display: "flex", gap: "20px", marginBottom: "16px" }}>
            <div style={{ flex: 1 }}>
              <div
                onClick={() => { setMetodo("video"); setInfoPanel(null); setPaso(3) }}
                style={{ padding: "28px 24px", border: `2px solid ${metodo === "video" ? colorPrincipal : "#e5e7eb"}`, borderRadius: "12px", textAlign: "center", cursor: "pointer", backgroundColor: "#f8fafc", transition: "all 0.2s" }}
                onMouseOver={e => { e.currentTarget.style.borderColor = colorPrincipal; e.currentTarget.style.backgroundColor = "#f0fdf4" }}
                onMouseOut={e => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.backgroundColor = "#f8fafc" }}
              >
                <h3 style={{ margin: "0 0 6px", color: "#1f2937", fontSize: "1rem" }}>Recorrido en Video</h3>
                <p style={{ fontSize: "0.82rem", color: "#6b7280", margin: "0 0 12px" }}>Recomendado para camas largas</p>
                <span style={{ fontSize: "0.78rem", color: colorPrincipal, fontWeight: "600", textTransform: "uppercase" }}>Continuar con video</span>
              </div>
              <button
                onClick={e => { e.stopPropagation(); setInfoPanel(infoPanel === "video" ? null : "video") }}
                style={{ marginTop: "8px", width: "100%", padding: "6px", background: "transparent", border: "1px solid #d1d5db", borderRadius: "6px", cursor: "pointer", fontSize: "0.8rem", color: "#6b7280" }}>
                Ver especificaciones de video
              </button>
            </div>

            <div style={{ flex: 1 }}>
              <div
                onClick={() => { setMetodo("foto"); setInfoPanel(null); setPaso(3) }}
                style={{ padding: "28px 24px", border: `2px solid ${metodo === "foto" ? colorPrincipal : "#e5e7eb"}`, borderRadius: "12px", textAlign: "center", cursor: "pointer", backgroundColor: "#f8fafc", transition: "all 0.2s" }}
                onMouseOver={e => { e.currentTarget.style.borderColor = colorPrincipal; e.currentTarget.style.backgroundColor = "#f0fdf4" }}
                onMouseOut={e => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.backgroundColor = "#f8fafc" }}
              >
                <h3 style={{ margin: "0 0 6px", color: "#1f2937", fontSize: "1rem" }}>Fotografia Doble</h3>
                <p style={{ fontSize: "0.82rem", color: "#6b7280", margin: "0 0 12px" }}>Solo para secciones de max 0.5 m</p>
                <span style={{ fontSize: "0.78rem", color: colorPrincipal, fontWeight: "600", textTransform: "uppercase" }}>Continuar con foto</span>
              </div>
              <button
                onClick={e => { e.stopPropagation(); setInfoPanel(infoPanel === "foto" ? null : "foto") }}
                style={{ marginTop: "8px", width: "100%", padding: "6px", background: "transparent", border: "1px solid #d1d5db", borderRadius: "6px", cursor: "pointer", fontSize: "0.8rem", color: "#6b7280" }}>
                Ver especificaciones de foto
              </button>
            </div>
          </div>

          {infoPanel && (
            <div style={{ padding: "20px", background: "#f8fafc", border: "1px solid #e5e7eb", borderRadius: "10px", marginBottom: "16px" }}>
              {infoPanel === "video" ? INFO_VIDEO : INFO_FOTO}
            </div>
          )}

          <button onClick={() => setPaso(1)} style={{ padding: "10px 24px", background: "transparent", color: "#4b5563", border: "1px solid #d1d5db", borderRadius: "8px", cursor: "pointer", fontWeight: "500", fontSize: "0.95rem" }}>
            Volver atras
          </button>
        </div>
      )}

      {/* PASO 3 */}
      {paso === 3 && (
        <div>
          <div style={{ padding: "12px 16px", backgroundColor: "#f0fdf4", borderRadius: "8px", marginBottom: "24px", border: "1px solid #bbf7d0" }}>
            <p style={{ margin: 0, color: "#166534", fontSize: "0.9rem", fontWeight: "500" }}>
              Metodo seleccionado: <strong>{metodo === "video" ? "Recorrido en Video" : "Fotografia Doble"}</strong>
              {" · "} Cama: <strong>{camas.find(c => String(c.id) === String(camaId))?.nombre}</strong>
              {" · "} Seccion: <strong>{seccion}</strong>
            </p>
          </div>

          {metodo === "video" ? (
            <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: "240px" }}>
                <label style={{ display: "block", marginBottom: "8px", color: "#374151", fontWeight: "500", fontSize: "0.95rem" }}>
                  Video Lado A
                  {videoA && <span style={{ marginLeft: "8px", fontSize: "0.8rem", color: colorPrincipal }}>Listo</span>}
                </label>
                <input
                  type="file" accept="video/*"
                  onChange={e => setVideoA(e.target.files[0] || null)}
                  style={{ padding: "12px", border: "2px dashed #d1d5db", borderRadius: "8px", width: "100%", backgroundColor: "#f9fafb", color: "#4b5563" }}
                />
              </div>
              <div style={{ flex: 1, minWidth: "240px" }}>
                <label style={{ display: "block", marginBottom: "8px", color: "#374151", fontWeight: "500", fontSize: "0.95rem" }}>
                  Video Lado B
                  {videoB && <span style={{ marginLeft: "8px", fontSize: "0.8rem", color: colorPrincipal }}>Listo</span>}
                </label>
                <input
                  type="file" accept="video/*"
                  onChange={e => setVideoB(e.target.files[0] || null)}
                  style={{ padding: "12px", border: "2px dashed #d1d5db", borderRadius: "8px", width: "100%", backgroundColor: "#f9fafb", color: "#4b5563" }}
                />
              </div>
              <p style={{ width: "100%", fontSize: "0.82rem", color: "#6b7280", margin: "0" }}>
                Puedes subir uno o ambos lados en la misma operacion. Cada video se procesara de forma independiente.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: "240px" }}>
                <label style={{ display: "block", marginBottom: "8px", color: "#374151", fontWeight: "500", fontSize: "0.95rem" }}>Foto Lado A *</label>
                <input type="file" accept="image/*" onChange={e => setArchivoA(e.target.files[0] || null)} style={{ padding: "12px", border: "2px dashed #d1d5db", borderRadius: "8px", width: "100%", backgroundColor: "#f9fafb", color: "#4b5563" }} />
              </div>
              <div style={{ flex: 1, minWidth: "240px" }}>
                <label style={{ display: "block", marginBottom: "8px", color: "#374151", fontWeight: "500", fontSize: "0.95rem" }}>Foto Lado B *</label>
                <input type="file" accept="image/*" onChange={e => setArchivoB(e.target.files[0] || null)} style={{ padding: "12px", border: "2px dashed #d1d5db", borderRadius: "8px", width: "100%", backgroundColor: "#f9fafb", color: "#4b5563" }} />
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: "16px", marginTop: "32px", justifyContent: "space-between" }}>
            <button onClick={() => setPaso(2)} disabled={cargando} style={{ padding: "12px 24px", background: "transparent", color: "#4b5563", border: "1px solid #d1d5db", borderRadius: "8px", cursor: "pointer", fontWeight: "500" }}>
              Volver atras
            </button>
            <button
              onClick={procesarDatos}
              disabled={botonProcesarDeshabilitado}
              style={{ padding: "12px 32px", background: botonProcesarDeshabilitado ? colorInactivo : colorPrincipal, color: "white", border: "none", borderRadius: "8px", cursor: botonProcesarDeshabilitado ? "not-allowed" : "pointer", fontWeight: "600", fontSize: "1rem" }}>
              {cargando ? "Analizando con IA..." : "Procesar Registro"}
            </button>
          </div>

          {cargando && (
            <div style={{ marginTop: "16px", padding: "12px", background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: "8px", color: "#92400e", fontSize: "0.88rem" }}>
              Procesando... El analisis con IA puede tomar entre 30 segundos y 5 minutos segun el tamanio del archivo. No cierres esta ventana.
            </div>
          )}
        </div>
      )}

      {mensaje && (
        <div style={{ marginTop: "24px", padding: "16px", borderRadius: "8px", background: mensaje.tipo === "ok" ? "#f0fdf4" : "#fef2f2", color: mensaje.tipo === "ok" ? "#166534" : "#991b1b", borderLeft: `4px solid ${mensaje.tipo === "ok" ? colorPrincipal : "#ef4444"}`, fontWeight: "500" }}>
          {mensaje.texto}
        </div>
      )}
    </div>
  )
}

function PruebaCamaCompleta({ camas, onCargaExitosa }) {
  const [camaId, setCamaId] = useState("")
  const [videoA, setVideoA] = useState(null)
  const [videoB, setVideoB] = useState(null)
  const [cargando, setCargando] = useState(false)
  const [mensaje, setMensaje] = useState(null)
  const [historial, setHistorial] = useState([])
  const [registroActivo, setRegistroActivo] = useState(null)

  const colorPrincipal = "#16a34a"
  const colorInactivo = "#d1d5db"

  const cargarHistorial = () => {
    axios.get(`${API}/registros/cama-completa/`)
      .then(r => setHistorial(r.data))
      .catch(err => console.error("Error cargando historial de cama completa", err))
  }

  useEffect(() => {
    cargarHistorial()
  }, [])

  const procesarDatos = async (e) => {
    e.preventDefault()
    if (!camaId || !videoA || !videoB) {
      alert("Por favor selecciona una cama y sube los videos de ambos lados (A y B).")
      return
    }

    setCargando(true)
    setMensaje(null)
    setRegistroActivo(null)

    const fd = new FormData()
    fd.append("cama_id", camaId)
    fd.append("video_a", videoA)
    fd.append("video_b", videoB)

    try {
      const r = await axios.post(`${API}/registros/cargar-cama-completa/`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 600000 // 10 minutos
      })
      
      setMensaje({
        tipo: "ok",
        texto: `Análisis consolidado completado con éxito.`
      })
      setVideoA(null)
      setVideoB(null)
      cargarHistorial()
      
      // Consultar el registro recién creado para establecerlo como activo
      axios.get(`${API}/registros/cama-completa/`)
        .then(res => {
          const rec = res.data.find(item => String(item.id) === String(r.data.registro_id))
          if (rec) {
            setRegistroActivo(rec)
          }
        })
      onCargaExitosa()
    } catch (err) {
      console.error(err)
      setMensaje({
        tipo: "error",
        texto: err.response?.data?.detail || "Ocurrió un error al procesar el análisis de cama completa."
      })
    } finally {
      setCargando(false)
    }
  }

  const eliminarRegistro = async (id) => {
    if (!window.confirm("¿Estás seguro de eliminar este registro?")) return
    try {
      await axios.delete(`${API}/registros/${id}`)
      if (registroActivo && registroActivo.id === id) {
        setRegistroActivo(null)
      }
      cargarHistorial()
    } catch (err) {
      console.error("Error al eliminar", err)
      alert("No se pudo eliminar el registro.")
    }
  }

  return (
    <div style={{ display: "flex", gap: "24px", flexDirection: "column", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
        
        {/* FORMULARIO DE CARGA */}
        <div className="grafico-card" style={{ flex: "1 1 500px", background: "#ffffff", border: "1px solid #e5e7eb", padding: "24px", borderRadius: "12px", boxSizing: "border-box" }}>
          <h2 style={{ color: "#1f2937", borderBottom: "1px solid #e5e7eb", paddingBottom: "16px", marginBottom: "24px", fontSize: "1.2rem" }}>
            Nueva Captura:
          </h2>

          <form onSubmit={procesarDatos} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <label style={{ display: "block", marginBottom: "8px", color: "#374151", fontWeight: "500", fontSize: "0.95rem" }}>
                1. Seleccionar Cama
              </label>
              <select 
                value={camaId} 
                onChange={e => setCamaId(e.target.value)} 
                style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #d1d5db", backgroundColor: "#f9fafb", fontSize: "0.95rem" }}
                required
              >
                <option value="">Elegir cama...</option>
                {camas.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "block", marginBottom: "8px", color: "#374151", fontWeight: "500", fontSize: "0.9rem" }}>
                  2. Video Lado A *
                </label>
                <input 
                  type="file" 
                  accept="video/*" 
                  onChange={e => setVideoA(e.target.files[0] || null)} 
                  style={{ padding: "12px", border: "2px dashed #d1d5db", borderRadius: "8px", width: "100%", backgroundColor: "#f9fafb", color: "#4b5563", boxSizing: "border-box" }}
                  required
                />
              </div>

              <div>
                <label style={{ display: "block", marginBottom: "8px", color: "#374151", fontWeight: "500", fontSize: "0.9rem" }}>
                  3. Video Lado B *
                </label>
                <input 
                  type="file" 
                  accept="video/*" 
                  onChange={e => setVideoB(e.target.files[0] || null)} 
                  style={{ padding: "12px", border: "2px dashed #d1d5db", borderRadius: "8px", width: "100%", backgroundColor: "#f9fafb", color: "#4b5563", boxSizing: "border-box" }}
                  required
                />
              </div>
            </div>

            <p style={{ fontSize: "0.8rem", color: "#6b7280", margin: 0 }}>
              Sube los videos completos de ambos pasillos. El sistema extraerá los fotogramas y enviará un censo unificado consolidado a Claude.
            </p>

            <button 
              type="submit" 
              disabled={cargando || !camaId || !videoA || !videoB}
              style={{ padding: "14px", background: (cargando || !camaId || !videoA || !videoB) ? colorInactivo : colorPrincipal, color: "white", border: "none", borderRadius: "8px", cursor: (cargando || !camaId || !videoA || !videoB) ? "not-allowed" : "pointer", fontWeight: "600", fontSize: "1rem" }}
            >
              {cargando ? "Analizando Cama Completa con IA..." : "Iniciar Censo de Cama Completa"}
            </button>
          </form>

          {cargando && (
            <div style={{ marginTop: "16px", padding: "12px", background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: "8px", color: "#92400e", fontSize: "0.88rem" }}>
              Procesando... La extracción de fotogramas dinámica y el análisis unificado de ambos lados puede tomar entre 45 segundos y 4 minutos. No cierres esta pestaña.
            </div>
          )}

          {mensaje && (
            <div style={{ marginTop: "24px", padding: "16px", borderRadius: "8px", background: mensaje.tipo === "ok" ? "#f0fdf4" : "#fef2f2", color: mensaje.tipo === "ok" ? "#166534" : "#991b1b", borderLeft: `4px solid ${mensaje.tipo === "ok" ? colorPrincipal : "#ef4444"}`, fontWeight: "500" }}>
              {mensaje.texto}
            </div>
          )}
        </div>

        {/* HISTORIAL LATERAL */}
        <div className="grafico-card" style={{ flex: "1 1 300px", background: "#ffffff", border: "1px solid #e5e7eb", padding: "24px", borderRadius: "12px", boxSizing: "border-box", display: "flex", flexDirection: "column", maxHeight: "550px" }}>
          <h2 style={{ color: "#1f2937", borderBottom: "1px solid #e5e7eb", paddingBottom: "16px", marginBottom: "16px", fontSize: "1.2rem" }}>
            Historial de Registros
          </h2>
          <div style={{ overflowY: "auto", flex: 1, paddingRight: "4px" }}>
            {historial.length === 0 ? (
              <p style={{ color: "#999", fontSize: "0.9rem", textAlign: "center", marginTop: "20px" }}>No se han realizado análisis bajo este formato.</p>
            ) : (
              historial.map((h) => (
                <div 
                  key={h.id} 
                  onClick={() => setRegistroActivo(h)}
                  style={{ 
                    padding: "12px", 
                    cursor: "pointer", 
                    borderBottom: "1px solid #f0f0f0", 
                    background: registroActivo?.id === h.id ? "#f0fdf4" : "white",
                    borderLeft: registroActivo?.id === h.id ? `4px solid ${colorPrincipal}` : "4px solid transparent",
                    borderRadius: "4px",
                    marginBottom: "6px",
                    transition: "all 0.15s"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: "700", color: "#2d5a27", fontSize: "0.9rem" }}>{h.cama_nombre}</span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); eliminarRegistro(h.id) }} 
                      style={{ background: "transparent", border: "none", color: "#ef4444", fontSize: "0.8rem", cursor: "pointer", fontWeight: "600" }}
                    >
                      Eliminar
                    </button>
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#666", marginTop: "2px" }}>{h.fecha}</div>
                  <div style={{ display: "flex", gap: "8px", marginTop: "6px" }}>
                    <span style={{ background: "#ec489922", color: "#be185d", padding: "1px 6px", borderRadius: "10px", fontSize: "0.7rem", fontWeight: "600" }}>
                      Tallos: {h.total_tallos}
                    </span>
                    <span style={{ background: "#e0f2fe", color: "#0369a1", padding: "1px 6px", borderRadius: "10px", fontSize: "0.7rem", fontWeight: "600" }}>
                      Confianza: {h.confianza}%
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* MATRIZ TALLO X BOTÓN DEL REGISTRO SELECCIONADO */}
      {registroActivo && (
        <div style={{ width: "100%", marginTop: "12px" }}>
          <div style={{ display: "flex", gap: "16px", marginBottom: "16px", padding: "16px", background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px" }}>
            <div>
              <span style={{ color: "#666", fontSize: "0.8rem" }}>Cama seleccionada:</span>
              <div style={{ fontWeight: "700", color: "#2d5a27" }}>{registroActivo.cama_nombre}</div>
            </div>
            <div>
              <span style={{ color: "#666", fontSize: "0.8rem" }}>Fecha de análisis:</span>
              <div style={{ fontWeight: "600" }}>{registroActivo.fecha}</div>
            </div>
            <div>
              <span style={{ color: "#666", fontSize: "0.8rem" }}>Etapa dominante:</span>
              <div style={{ fontWeight: "600", textTransform: "capitalize" }}>{registroActivo.etapa_dominante}</div>
            </div>
            <div style={{ marginLeft: "auto", textAlign: "right" }}>
              <span style={{ color: "#666", fontSize: "0.8rem" }}>Confianza promedio:</span>
              <div style={{ fontWeight: "700", color: colorPrincipal }}>{registroActivo.confianza}%</div>
            </div>
          </div>
          
          <MatrizTalloBoton datos={registroActivo} titulo="Desglose Consolidado (Matriz Tallo x Botón)" />
        </div>
      )}
    </div>
  )
}


function ComparativaSecciones({camaId, camaNombre, fecha}) {
  const [datos, setDatos] = useState(null)
  const [cargando, setCargando] = useState(false)

  useEffect(() => {
    if (!camaId || !fecha) { setDatos(null); return }
    setCargando(true)
    axios.get(`${API}/reportes/comparativa-secciones/${camaId}/${fecha}`)
      .then(r => setDatos(r.data))
      .catch(() => setDatos(null))
      .finally(() => setCargando(false))
  }, [camaId, fecha])

  if (!camaId) return (
    <div style={{background:"white", borderRadius:"12px", padding:"40px", textAlign:"center", color:"#999"}}>
      Selecciona una cama en el filtro superior para ver la comparativa
    </div>
  )

  if (cargando) return <div className="cargando">Cargando comparativa...</div>
  if (!datos || datos.secciones.length === 0) return (
    <div style={{background:"white", borderRadius:"12px", padding:"40px", textAlign:"center", color:"#999"}}>
      No hay registros para {camaNombre} en la fecha seleccionada
    </div>
  )

  const getVal = (lado, tallo, boton) => lado ? (lado[`${tallo}_${boton}`] || 0) : 0

  return (
    <div>
      <h2 style={{color:"#2d5a27", marginBottom:"16px", fontSize:"1rem"}}>
        {camaNombre} - Comparativa por seccion
      </h2>

      {datos.secciones.map((sec, i) => {
        const totalA = sec.lado_A?.total_tallos || 0
        const totalB = sec.lado_B?.total_tallos || 0
        const botonesA = sec.lado_A?.total_botones || 0
        const botonesB = sec.lado_B?.total_botones || 0

        return (
          <div key={i} className="grafico-card">
            <h2>Seccion {sec.seccion}</h2>

            <div style={{display:"flex", gap:"16px", marginBottom:"16px", flexWrap:"wrap"}}>
              <div style={{background:"#f0f4f0", padding:"10px 16px", borderRadius:"10px", flex:1, minWidth:"160px"}}>
                <div style={{fontSize:"0.82rem", color:"#666", marginBottom:"4px"}}>Lado A</div>
                <div style={{fontWeight:"700", fontSize:"1.2rem", color:"#2d5a27"}}>{totalA} tallos - {botonesA} botones</div>
                {sec.lado_A && <div style={{fontSize:"0.75rem", color:"#999"}}>{sec.lado_A.fecha}</div>}
                {!sec.lado_A && <div style={{fontSize:"0.78rem", color:"#dc2626"}}>Sin registro cargado</div>}
              </div>
              <div style={{background:"#f0f4f0", padding:"10px 16px", borderRadius:"10px", flex:1, minWidth:"160px"}}>
                <div style={{fontSize:"0.82rem", color:"#666", marginBottom:"4px"}}>Lado B</div>
                <div style={{fontWeight:"700", fontSize:"1.2rem", color:"#2d5a27"}}>{totalB} tallos - {botonesB} botones</div>
                {sec.lado_B && <div style={{fontSize:"0.75rem", color:"#999"}}>{sec.lado_B.fecha}</div>}
                {!sec.lado_B && <div style={{fontSize:"0.78rem", color:"#dc2626"}}>Sin registro cargado</div>}
              </div>
              <div style={{background:"#f0fdf4", padding:"10px 16px", borderRadius:"10px", flex:1, minWidth:"160px", border:"2px solid #2d5a27"}}>
                <div style={{fontSize:"0.82rem", color:"#2d5a27", marginBottom:"4px"}}>Total seccion</div>
                <div style={{fontWeight:"700", fontSize:"1.2rem", color:"#2d5a27"}}>{totalA + totalB} tallos - {botonesA + botonesB} botones</div>
              </div>
            </div>

            <div style={{overflowX:"auto"}}>
              <table className="tabla">
                <thead>
                  <tr>
                    <th rowSpan={2} style={{verticalAlign:"middle"}}>Tallo</th>
                    {BOTONES_LIST.map(b => (
                      <th key={b.key} colSpan={3} style={{textAlign:"center", background: b.color + "44"}}>{b.label}</th>
                    ))}
                  </tr>
                  <tr>
                    {BOTONES_LIST.map(b => (
                      <>
                        <th key={b.key+"A"} style={{textAlign:"center", fontSize:"0.78rem", background: b.color + "22"}}>A</th>
                        <th key={b.key+"B"} style={{textAlign:"center", fontSize:"0.78rem", background: b.color + "22"}}>B</th>
                        <th key={b.key+"T"} style={{textAlign:"center", fontSize:"0.78rem", background: b.color + "44", fontWeight:"700"}}>Total</th>
                      </>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {TALLOS_LIST.map(t => (
                    <tr key={t.key}>
                      <td style={{background: t.color, fontWeight:"600"}}>{t.label}</td>
                      {BOTONES_LIST.map(b => {
                        const valA = getVal(sec.lado_A, t.key, b.key)
                        const valB = getVal(sec.lado_B, t.key, b.key)
                        const total = valA + valB
                        return (
                          <>
                            <td key={b.key+"A"} style={{textAlign:"center", background: valA > 0 ? b.color+"22" : "white"}}>
                              {valA > 0 ? valA : <span style={{color:"#ddd"}}>-</span>}
                            </td>
                            <td key={b.key+"B"} style={{textAlign:"center", background: valB > 0 ? b.color+"22" : "white"}}>
                              {valB > 0 ? valB : <span style={{color:"#ddd"}}>-</span>}
                            </td>
                            <td key={b.key+"T"} style={{textAlign:"center", background: total > 0 ? b.color+"44" : "white", fontWeight:"700"}}>
                              {total > 0 ? total : <span style={{color:"#ddd"}}>-</span>}
                            </td>
                          </>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{background:"#f0f4f0", fontWeight:"700"}}>
                    <td>Total boton</td>
                    {BOTONES_LIST.map(b => {
                      const totalA = TALLOS_LIST.reduce((s, t) => s + getVal(sec.lado_A, t.key, b.key), 0)
                      const totalB = TALLOS_LIST.reduce((s, t) => s + getVal(sec.lado_B, t.key, b.key), 0)
                      const totalGeneral = totalA + totalB
                      return (
                        <>
                          <td key={b.key+"A"} style={{textAlign:"center", color:"#666"}}>
                            {totalA > 0 ? totalA : <span style={{color:"#ddd"}}>-</span>}
                          </td>
                          <td key={b.key+"B"} style={{textAlign:"center", color:"#666"}}>
                            {totalB > 0 ? totalB : <span style={{color:"#ddd"}}>-</span>}
                          </td>
                          <td key={b.key+"T"} style={{textAlign:"center", color:"#2d5a27", fontSize:"1rem"}}>
                            {totalGeneral > 0 ? totalGeneral : <span style={{color:"#ddd"}}>-</span>}
                          </td>
                        </>
                      )
                    })}
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )
      })}
    </div>
  )
}


export default function App() {
  const [cargandoInicial, setCargandoInicial] = useState(true)
  const [colapsado, setColapsado] = useState(false)
  const [seccion, setSeccion] = useState("cama_completa")
  const [camas, setCamas] = useState([])
  const [fechas, setFechas] = useState([])
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null)
  const [registrosDia, setRegistrosDia] = useState([])
  const [registroActivo, setRegistroActivo] = useState(null)
  const [consolidadoFecha, setConsolidadoFecha] = useState([])
  const [cargando, setCargando] = useState(false)
  const [recargarProyecciones, setRecargarProyecciones] = useState(0)
  const [camaFiltro, setCamaFiltro] = useState("")
  const [listaPodas, setListaPodas] = useState([])
  const [precisionPodas, setPrecisionPodas] = useState({})
  const [cargandoPodas, setCargandoPodas] = useState(false)

  const getFechaEcuador = () => {
    const d = new Date()
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Guayaquil',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
    return formatter.format(d) // YYYY-MM-DD
  }

  useEffect(() => {
    const TIEMPO_MINIMO = 2000;
    const inicio = Date.now();

    Promise.all([
      axios.get(`${API}/camas/`),
      axios.get(`${API}/reportes/fechas-disponibles`)
    ]).then(([c, f]) => {
      setCamas(c.data)
      let fs = [...f.data.fechas]
      const hoyEC = getFechaEcuador()
      const hoyEC_format = hoyEC.split("-").reverse().join("-") // DD-MM-YYYY
      if (!fs.includes(hoyEC_format)) {
        fs = [hoyEC_format, ...fs]
      }
      setFechas(fs)
      setFechaSeleccionada(hoyEC)
    }).finally(() => {
      const tiempoTranscurrido = Date.now() - inicio;
      const tiempoRestante = Math.max(0, TIEMPO_MINIMO - tiempoTranscurrido);

      setTimeout(() => {
        setCargandoInicial(false);
      }, tiempoRestante);
    });
  }, []);


  useEffect(() => {
    if (!fechaSeleccionada || camas.length === 0) return
    if (seccion === "cargas") {
      setCargando(true)
      setRegistroActivo(null)
      const [d, m, y] = fechaSeleccionada.split("-")
      Promise.all(camas.map(c => axios.get(`${API}/reportes/resumen-cama/${c.id}`)))
        .then(resultados => {
          const todos = resultados.flatMap(r =>
            r.data.historial.filter(h => h.fecha_dia === `${d}/${m}/${y}`)
              .map(h => ({...h, cama_nombre: r.data.cama_nombre, cama_id: r.data.cama_id}))
          )
          setRegistrosDia(todos)
        }).finally(() => setCargando(false))
    } else if (seccion === "consolidado") {
      setCargando(true)
      axios.get(`${API}/reportes/consolidado-fecha/${fechaSeleccionada}`)
        .then(r => setConsolidadoFecha(r.data.camas || []))
        .finally(() => setCargando(false))
    }
  }, [fechaSeleccionada, seccion, camas])

  useEffect(() => {
    if (seccion !== "podas") return
    const cama = camaFiltro
    if (!cama) { setListaPodas([]); setPrecisionPodas({}); return }
    setCargandoPodas(true)
    Promise.all([
      axios.get(`${API}/podas/${cama}`),
      axios.get(`${API}/reportes/precision-proyeccion/${cama}`)
    ]).then(([podasRes, precisionRes]) => {
      setListaPodas(podasRes.data)
      const mapaPorFecha = {}
      precisionRes.data.historial.forEach(p => { mapaPorFecha[p.fecha] = p })
      setPrecisionPodas(mapaPorFecha)
    }).finally(() => setCargandoPodas(false))
  }, [camaFiltro, seccion, recargarProyecciones])

  const registrosFiltrados = registrosDia.filter(r => !camaFiltro || String(r.cama_id) === camaFiltro)
  const consolidadoFiltrado = consolidadoFecha.filter(c => !camaFiltro || String(c.cama_id) === camaFiltro)
  const camasFiltradas = camas.filter(c => !camaFiltro || String(c.id) === camaFiltro)
  const fechaDisplay = fechaSeleccionada ? fechaSeleccionada.split("-").join("/") : ""

      if (cargandoInicial) return ( 
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#f0f4f0" }}> 
          <Player src={animacionCargando} autoplay loop style={{ width: '180px', height: '180px' }} /> 
          <p style={{ color: "#2d5a27", fontWeight: "600", fontSize: "1rem", marginTop: "16px", letterSpacing: "0.03em" }}> Cargando sistema... </p> 
        </div> 
      )


  const MENU = [
    {key:"configuracion",     label:"Configuración de Camas"},
    {key:"cama_completa",     label:"Ingreso de Datos"},
    {key:"consolidado",       label:"Datos Consolidados"},
    {key:"proyecciones",      label:"Proyecciones por Cama"},
    {key:"proyeccion_global", label:"Proyección Global"},
    {key:"podas",             label:"Cosecha / Poda"},
  ]

  const TITULOS = {
    configuracion:     "Configuración de Camas",
    cama_completa:     "Ingreso de Datos",
    consolidado:       "Datos Consolidados",
    podas:             "Registro de Cosecha / Poda",
    proyecciones:      "Proyección por Cama",
    proyeccion_global: "Proyección Global",
  }

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
        flexWrap: "wrap"
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
            outline: "none"
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
              outline: "none"
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
    <div style={{ display: "flex", minHeight: "100vh", background: "#f0f4f0" }}>
      <Sidebar
        seccion={seccion}
        setSeccion={setSeccion}
        colapsado={colapsado}
        setColapsado={setColapsado}
      />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <Header
          titulo={TITULOS[seccion] || ""}
          colapsado={colapsado}
          setColapsado={setColapsado}
        />

        <div style={{ flex: 1, overflow: "auto", padding: "24px" }}>
          
          {seccion === "configuracion" && (
            <ConfiguracionCamas onCambio={() => {
              axios.get(`${API}/camas/`).then(r => setCamas(r.data))
            }} />
          )}

          {seccion === "cama_completa" && (
            <div>
              <PruebaCamaCompleta camas={camas} onCargaExitosa={() => {
                axios.get(`${API}/reportes/fechas-disponibles`).then(r => {
                  let fs = [...r.data.fechas]
                  const hoyEC = getFechaEcuador()
                  const hoyEC_format = hoyEC.split("-").reverse().join("-")
                  if (!fs.includes(hoyEC_format)) {
                    fs = [hoyEC_format, ...fs]
                  }
                  setFechas(fs)
                  setFechaSeleccionada(hoyEC)
                })
              }} />
            </div>
          )}

          {seccion === "cargas" && (
            <div>
              <IngresoDatos camas={camas} onCargaExitosa={() => {
                axios.get(`${API}/reportes/fechas-disponibles`).then(r => {
                  const fs = r.data.fechas
                  setFechas(fs)
                  if (fs.length > 0) {
                    const hoy = fs[0].split("-").reverse().join("-")
                    setFechaSeleccionada(hoy)
                    const [d, m, y] = hoy.split("-")
                    setCargando(true)
                    setRegistroActivo(null)
                    Promise.all(
                      camas.map(c => axios.get(`${API}/reportes/resumen-cama/${c.id}`))
                    ).then(resultados => {
                      const todos = resultados.flatMap(r =>
                        r.data.historial.filter(h => h.fecha_dia === `${d}/${m}/${y}`)
                          .map(h => ({...h, cama_nombre: r.data.cama_nombre, cama_id: r.data.cama_id}))
                      )
                      setRegistrosDia(todos)
                    }).finally(() => setCargando(false))
                  }
                })
              }} />

              {/*alignItems - flex-start para que la lista no se estire a lo alto de la tabla */}
              <div style={{display:"flex", gap:"20px", alignItems:"flex-start"}}>
                <div style={{width:"320px", flexShrink:0}}>
                  {/* Se agregó display flex, flexDirection column y maxHeight */}
                  <div style={{background:"white", borderRadius:"12px", boxShadow:"0 2px 8px rgba(0,0,0,0.07)", display:"flex", flexDirection:"column", maxHeight:"600px"}}>
                    <div style={{padding:"14px 16px", background:"#f0f4f0", fontWeight:"600", color:"#2d5a27", fontSize:"0.9rem", flexShrink:0}}>
                      Registros del {fechaDisplay}
                      {camaFiltro && <span style={{fontWeight:"400", marginLeft:"8px", fontSize:"0.8rem"}}>- {camas.find(c => String(c.id) === camaFiltro)?.nombre}</span>}
                    </div>
                    
                    {/* contenedor con scroll (Slide bar) exclusivo para la lista */}
                    <div style={{overflowY:"auto", flex:1}}>
                      {cargando && <div style={{padding:"20px", color:"#999", textAlign:"center"}}>Cargando...</div>}
                      {!cargando && registrosFiltrados.length === 0 && (
                        <div style={{padding:"20px", color:"#999", textAlign:"center", fontSize:"0.9rem"}}>No hay registros para esta fecha</div>
                      )}
                      {registrosFiltrados.map((r, i) => (
                        <div key={i} onClick={() => setRegistroActivo(r)}
                          style={{padding:"12px 16px", cursor:"pointer", borderBottom:"1px solid #f0f0f0",
                            background: registroActivo === r ? "#f0fdf4" : "white",
                            borderLeft: registroActivo === r ? "4px solid #2d5a27" : "4px solid transparent"}}>
                          <div style={{fontWeight:"600", fontSize:"0.88rem", color:"#2d5a27"}}>{r.cama_nombre}</div>
                          <div style={{fontSize:"0.82rem", color:"#666", marginTop:"2px"}}>{r.fecha} - Seg: {r.segmento}</div>
                          <div style={{display:"flex", gap:"8px", marginTop:"6px", flexWrap:"wrap"}}>
                            <span style={{background:"#ec489922", color:"#be185d", padding:"2px 7px", borderRadius:"10px", fontSize:"0.75rem", fontWeight:"600"}}>
                              Cosecha: {(r.tallo_largo_cosecha||0) + (r.tallo_medio_cosecha||0) + (r.tallo_corto_cosecha||0)}
                            </span>
                            <span style={{background:"#f0fdf4", color:"#166534", padding:"2px 7px", borderRadius:"10px", fontSize:"0.75rem"}}>
                              Total: {r.total_botones || r.total_tallos}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* minWidth: 0 para evitar el desbordamiento horizontal */}
                <div style={{flex:1, minWidth: 0}}>
                  {!registroActivo && (
                    <div style={{background:"white", borderRadius:"12px", padding:"40px", textAlign:"center", color:"#999", boxShadow:"0 2px 8px rgba(0,0,0,0.07)"}}>
                      <div style={{marginBottom:"12px"}}>Selecciona un registro de la lista para ver su analisis</div>
                    </div>
                  )}
                  {registroActivo && (
                    <>
                      <div style={{background:"white", borderRadius:"12px", padding:"14px 16px", marginBottom:"16px",
                        boxShadow:"0 2px 8px rgba(0,0,0,0.07)", display:"flex", gap:"16px", alignItems:"center", flexWrap:"wrap"}}>
                        <div><span style={{color:"#666", fontSize:"0.82rem"}}>Cama</span><div style={{fontWeight:"700", color:"#2d5a27"}}>{registroActivo.cama_nombre}</div></div>
                        <div><span style={{color:"#666", fontSize:"0.82rem"}}>Fecha y hora</span><div style={{fontWeight:"600"}}>{registroActivo.fecha}</div></div>
                        <div><span style={{color:"#666", fontSize:"0.82rem"}}>Segmento</span><div style={{fontWeight:"600"}}>{registroActivo.segmento}</div></div>
                        <div><span style={{color:"#666", fontSize:"0.82rem"}}>Etapa dominante</span><div style={{fontWeight:"600"}}>{ETIQUETAS[registroActivo.etapa_dominante] || registroActivo.etapa_dominante || "-"}</div></div>
                        <button
                          onClick={() => {
                            if (!window.confirm(`Eliminar este registro de ${registroActivo.cama_nombre} (${registroActivo.fecha})? Esta accion no se puede deshacer. El archivo se conservara en el disco.`)) return
                            axios.delete(`${API}/registros/${registroActivo.registro_id || registroActivo.id}`)
                              .then(() => {
                                setRegistrosDia(prev => prev.filter(r => r !== registroActivo))
                                setRegistroActivo(null)
                              })
                              .catch(() => alert("Error al eliminar el registro"))
                          }}
                          style={{marginLeft:"auto", padding:"7px 14px", background:"#fee2e2", color:"#991b1b",
                            border:"none", borderRadius:"8px", cursor:"pointer", fontWeight:"600", fontSize:"0.85rem"}}>
                          Eliminar registro
                        </button>
                      </div>
                      <MatrizTalloBoton datos={registroActivo} titulo="Matriz - Tallo x Boton" />
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {seccion === "consolidado" && (
            <div>
              <FilaFiltros conFecha={true} />
              {cargando && <div className="cargando">Cargando datos consolidados...</div>}
              {!cargando && consolidadoFiltrado.length === 0 && (
                <div style={{background:"white", borderRadius:"12px", padding:"40px", textAlign:"center", color:"#999"}}>
                  No hay datos para la fecha y cama seleccionada
                </div>
              )}
              {consolidadoFiltrado.map((cama, i) => (
                <div key={i} style={{marginBottom:"32px"}}>
                  <div style={{background:"#2d5a27", color:"white", padding:"10px 16px", borderRadius:"10px 10px 0 0", fontWeight:"600", fontSize:"1rem"}}>
                    {cama.cama_nombre} - {cama.total_registros} registro{cama.total_registros > 1 ? "s" : ""}
                  </div>
                  <MatrizTalloBoton datos={cama} titulo="Matriz - Tallo x Boton (suma del dia)" />
                  <Distribucion datos={cama} titulo="Distribucion de la toma (suma del dia)" />
                </div>
              ))}
            </div>
          )}

          {seccion === "podas" && (
            <div>
              <FilaFiltros conFecha={false} />
              <RegistroPoda camas={camas} camaFiltro={camaFiltro} onPodaRegistrada={(camaId) => {
                setRecargarProyecciones(r => r + 1)
                if (camaId) {
                  setCargandoPodas(true)
                  axios.get(`${API}/podas/${camaId}`).then(r => setListaPodas(r.data)).finally(() => setCargandoPodas(false))
                }
              }} />
              <div className="grafico-card">
                <h2>Registros de cosecha</h2>
                {!camaFiltro && (
                  <p style={{color:"#999", textAlign:"center", padding:"20px"}}>
                    Selecciona una cama en el filtro superior para ver el historial
                  </p>
                )}
                {camaFiltro && cargandoPodas && <div className="cargando">Cargando podas...</div>}
                {camaFiltro && !cargandoPodas && listaPodas.length === 0 && (
                  <p style={{color:"#999", textAlign:"center", padding:"20px"}}>No hay podas registradas para esta cama</p>
                )}
                {camaFiltro && !cargandoPodas && listaPodas.length > 0 && (
                  <>
                    <div style={{display:"flex", gap:"12px", marginBottom:"16px", flexWrap:"wrap"}}>
                      {[
                        {label:"Total registros", valor: listaPodas.length, color:"#f0f4f0", text:"#2d5a27"},
                        {label:"Total largos",    valor: listaPodas.reduce((s,p) => s + p.tallos_largos, 0), color:"#d1fae5", text:"#065f46"},
                        {label:"Total medios",    valor: listaPodas.reduce((s,p) => s + p.tallos_medios, 0), color:"#dbeafe", text:"#1e40af"},
                        {label:"Total cortos",    valor: listaPodas.reduce((s,p) => s + p.tallos_cortos, 0), color:"#fef3c7", text:"#92400e"},
                        {label:"Total podados",   valor: listaPodas.reduce((s,p) => s + p.total_podados, 0), color:"#f0fdf4", text:"#2d5a27"},
                      ].map(t => (
                        <div key={t.label} style={{background:t.color, padding:"10px 16px", borderRadius:"10px", textAlign:"center", minWidth:"110px"}}>
                          <div style={{fontSize:"1.3rem", fontWeight:"700", color:t.text}}>{t.valor}</div>
                          <div style={{fontSize:"0.78rem", color:t.text}}>{t.label}</div>
                        </div>
                      ))}
                    </div>
                    <table className="tabla">
                      <thead>
                        <tr>
                          <th>Fecha</th>
                          <th style={{textAlign:"center", background:"#d1fae544"}}>Largos</th>
                          <th style={{textAlign:"center", background:"#dbeafe44"}}>Medios</th>
                          <th style={{textAlign:"center", background:"#fef3c744"}}>Cortos</th>
                          <th style={{textAlign:"center", background:"#f0fdf444"}}>Total podados</th>
                          <th style={{textAlign:"center"}}>Proyeccion IA</th>
                          <th style={{textAlign:"center"}}>Desviacion</th>
                          <th>Observaciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {listaPodas.map((p, i) => {
                          const comparacion = precisionPodas[p.fecha.split(" ")[0]]
                          return (
                            <tr key={i}>
                              <td>{p.fecha}</td>
                              <td style={{textAlign:"center", background:"#d1fae522"}}>{p.tallos_largos}</td>
                              <td style={{textAlign:"center", background:"#dbeafe22"}}>{p.tallos_medios}</td>
                              <td style={{textAlign:"center", background:"#fef3c722"}}>{p.tallos_cortos}</td>
                              <td style={{textAlign:"center", background:"#f0fdf422", fontWeight:"700"}}>{p.total_podados}</td>
                              <td style={{textAlign:"center"}}>{comparacion ? comparacion.proyectado : "-"}</td>
                              <td style={{textAlign:"center"}}>
                                {comparacion
                                  ? <span style={{
                                      color: Math.abs(p.total_podados - comparacion.proyectado) > 10 ? "#dc2626" : "#166534",
                                      fontWeight:"700"
                                    }}>
                                      {p.total_podados - comparacion.proyectado >= 0 ? "+" : ""}{p.total_podados - comparacion.proyectado} ({comparacion.error_porcentual}%)
                                    </span>
                                  : <span style={{color:"#ddd"}}>-</span>}
                              </td>
                              <td style={{color:"#666", fontSize:"0.85rem"}}>{p.observaciones || "-"}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </>
                )}
              </div>
            </div>
          )}

          {seccion === "proyecciones" && (
            <div>
              <FilaFiltros conFecha={false} />
              <h2 style={{color:"#2d5a27", marginBottom:"16px", fontSize:"1rem"}}>Proyección por Cama</h2>
              {camasFiltradas.map(c => (
                <ProyeccionCama key={c.id} camaId={c.id} camaNombre={c.nombre} recargar={recargarProyecciones} />
              ))}
            </div>
          )}

          {seccion === "proyeccion_global" && (
            <div>
              <FilaFiltros conFecha={false} />
              <h2 style={{color:"#2d5a27", marginBottom:"16px", fontSize:"1rem"}}>Proyección Global de Cosecha</h2>
              <ProyeccionGlobal camas={camasFiltradas} />
              <h2 style={{color:"#2d5a27", margin:"32px 0 16px", fontSize:"1rem"}}>Comparativa entre Camas</h2>
              <ComparativaCamas camas={camasFiltradas} />
            </div>
          )}

        </div>
      </div>
    </div>
  )
}