import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Demostracion() {
  const [camas, setCamas] = useState([]);
  const [camaId, setCamaId] = useState('');
  const [secciones, setSecciones] = useState([]);
  const [seccionSeleccionada, setSeccionSeleccionada] = useState('');
  
  // Listas de archivos para cada lado (múltiples tramos)
  const [videosA, setVideosA] = useState([{ id: 1, file: null }]);
  const [videosB, setVideosB] = useState([{ id: 1, file: null }]);
  
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState(null);

  // Obtener las camas disponibles para el dropdown
  useEffect(() => {
    axios.get('http://localhost:8000/configuracion/camas/')
      .then(res => {
        setCamas(res.data);
        if (res.data.length > 0) {
          const primerCama = res.data[0];
          setCamaId(primerCama.id);
          setSecciones(primerCama.secciones || []);
          if (primerCama.secciones && primerCama.secciones.length > 0) {
            setSeccionSeleccionada(primerCama.secciones[0].nombre);
          }
        }
      })
      .catch(err => {
        console.error("Error al obtener camas:", err);
        setError("No se pudo conectar con el servidor local. Asegúrate de tener FastAPI ejecutándose en el puerto 8000.");
      });
  }, []);

  // Actualizar las secciones cuando cambia la cama
  const handleCamaChange = (id) => {
    setCamaId(id);
    const camaSelected = camas.find(c => c.id === parseInt(id));
    if (camaSelected) {
      setSecciones(camaSelected.secciones || []);
      if (camaSelected.secciones && camaSelected.secciones.length > 0) {
        setSeccionSeleccionada(camaSelected.secciones[0].nombre);
      } else {
        setSeccionSeleccionada('');
      }
    }
  };

  // Agregar un nuevo input de tramo
  const agregarTramo = (lado) => {
    if (lado === 'A') {
      setVideosA([...videosA, { id: Date.now(), file: null }]);
    } else {
      setVideosB([...videosB, { id: Date.now(), file: null }]);
    }
  };

  // Quitar un tramo
  const removerTramo = (lado, id) => {
    if (lado === 'A') {
      if (videosA.length === 1) return;
      setVideosA(videosA.filter(v => v.id !== id));
    } else {
      if (videosB.length === 1) return;
      setVideosB(videosB.filter(v => v.id !== id));
    }
  };

  // Cambiar el archivo de un tramo
  const handleFileChange = (lado, id, file) => {
    if (lado === 'A') {
      setVideosA(videosA.map(v => v.id === id ? { ...v, file } : v));
    } else {
      setVideosB(videosB.map(v => v.id === id ? { ...v, file } : v));
    }
  };

  const handleAnalizar = async (e) => {
    e.preventDefault();
    
    // Filtrar archivos válidos cargados
    const filesA = videosA.map(v => v.file).filter(Boolean);
    const filesB = videosB.map(v => v.file).filter(Boolean);

    if (!camaId || filesA.length === 0 || filesB.length === 0) {
      alert("Por favor selecciona una cama y sube al menos un video por cada lado.");
      return;
    }

    setLoading(true);
    setResultado(null);
    setError(null);

    const formData = new FormData();
    formData.append('cama_id', camaId);
    if (seccionSeleccionada) {
      formData.append('segmento', seccionSeleccionada);
    }
    
    // Añadir lista de videos del Lado A
    filesA.forEach(file => {
      formData.append('video_a', file);
    });

    // Añadir lista de videos del Lado B
    filesB.forEach(file => {
      formData.append('video_b', file);
    });

    try {
      const response = await axios.post('http://localhost:8000/registros/cargar-bloque-demo/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setResultado(response.data);
    } catch (err) {
      console.error("Error en el análisis:", err);
      const msg = err.response?.data?.detail || "Ocurrió un error al procesar el censo unificado.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f0f4f0', minHeight: '100vh', padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ backgroundColor: 'white', width: '100%', maxWidth: '850px', padding: '40px', borderRadius: '16px', boxShadow: '0 8px 30px rgba(0,0,0,0.06)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '35px' }}>
          <span style={{ fontSize: '3rem' }}>...</span>
          <h2 style={{ color: '#2d5a27', fontSize: '2rem', margin: '10px 0 5px 0' }}>Análisis Combinado de Sección Larga</h2>
          <p style={{ color: '#666', margin: 0, fontSize: '1rem' }}>Sube múltiples videos por cada lado para analizar una sección completa (ej. 10m) en un solo censo.</p>
        </div>

        {error && (
          <div style={{ padding: '15px', backgroundColor: '#fee2e2', borderLeft: '5px solid #ef4444', color: '#991b1b', borderRadius: '6px', marginBottom: '25px', fontSize: '0.95rem' }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        <form onSubmit={handleAnalizar} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
          
          {/* Cama */}
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#374151', fontSize: '0.95rem' }}>Cama:</label>
            <select 
              value={camaId} 
              onChange={e => handleCamaChange(e.target.value)}
              style={{ width: '100%', padding: '12px', border: '1px solid #aac9a0', borderRadius: '8px', fontSize: '1rem', background: '#f8fafc' }}
            >
              {camas.map(cama => (
                <option key={cama.id} value={cama.id}>
                  {cama.nombre} ({cama.variedad || 'Sin variedad'})
                </option>
              ))}
            </select>
          </div>

          {/* Sección */}
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#374151', fontSize: '0.95rem' }}>Sección / Segmento:</label>
            <select 
              value={seccionSeleccionada} 
              onChange={e => setSeccionSeleccionada(e.target.value)}
              style={{ width: '100%', padding: '12px', border: '1px solid #aac9a0', borderRadius: '8px', fontSize: '1rem', background: '#f8fafc' }}
            >
              {secciones.length === 0 ? (
                <option value="">Sin secciones configuradas</option>
              ) : (
                secciones.map(sec => (
                  <option key={sec.id} value={sec.nombre}>{sec.nombre}</option>
                ))
              )}
            </select>
          </div>

          {/* LADO A */}
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '20px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h4 style={{ margin: 0, color: '#166534', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #bbf7d0', paddingBottom: '8px' }}>
              <VideoIcon /> Lado A (Videos Tramos)
            </h4>
            
            {videosA.map((tramo, index) => (
              <div key={tramo.id} style={{ background: 'white', padding: '12px', borderRadius: '6px', border: '1px solid #d1d5db', display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#666' }}>Tramo {index + 1}:</span>
                <input 
                  type="file" 
                  accept="video/*" 
                  onChange={e => handleFileChange('A', tramo.id, e.target.files[0])}
                  style={{ fontSize: '0.85rem' }}
                  required
                />
                {videosA.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => removerTramo('A', tramo.id)}
                    style={{ position: 'absolute', top: '8px', right: '8px', border: 'none', background: 'none', color: '#dc2626', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}
                  >
                    Quitar
                  </button>
                )}
              </div>
            ))}

            <button 
              type="button" 
              onClick={() => agregarTramo('A')}
              style={{ backgroundColor: '#e0f2fe', color: '#0369a1', border: '1px dashed #0369a1', padding: '10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem' }}
            >
              + Añadir siguiente tramo (Lado A)
            </button>
          </div>

          {/* LADO B */}
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '20px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <h4 style={{ margin: 0, color: '#166534', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #bbf7d0', paddingBottom: '8px' }}>
              <VideoIcon /> Lado B (Videos Tramos)
            </h4>
            
            {videosB.map((tramo, index) => (
              <div key={tramo.id} style={{ background: 'white', padding: '12px', borderRadius: '6px', border: '1px solid #d1d5db', display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#666' }}>Tramo {index + 1}:</span>
                <input 
                  type="file" 
                  accept="video/*" 
                  onChange={e => handleFileChange('B', tramo.id, e.target.files[0])}
                  style={{ fontSize: '0.85rem' }}
                  required
                />
                {videosB.length > 1 && (
                  <button 
                    type="button" 
                    onClick={() => removerTramo('B', tramo.id)}
                    style={{ position: 'absolute', top: '8px', right: '8px', border: 'none', background: 'none', color: '#dc2626', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}
                  >
                    Quitar
                  </button>
                )}
              </div>
            ))}

            <button 
              type="button" 
              onClick={() => agregarTramo('B')}
              style={{ backgroundColor: '#e0f2fe', color: '#0369a1', border: '1px dashed #0369a1', padding: '10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.9rem' }}
            >
              + Añadir siguiente tramo (Lado B)
            </button>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ gridColumn: '1 / -1', padding: '16px', background: '#2d5a27', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.2rem', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, transition: 'background 0.2s', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}
          >
            {loading ? (
              <>
                <Spinner /> Procesando tramos concatenados con Claude...
              </>
            ) : (
              <>
                <PlayIcon /> Iniciar Análisis de Sección Unificada
              </>
            )}
          </button>
        </form>

        {/* Sección de Resultados */}
        {resultado && (
          <div style={{ borderTop: '2px solid #e2e8f0', paddingTop: '30px', marginTop: '30px' }}>
            <h3 style={{ color: '#2d5a27', fontSize: '1.5rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              Resultados del Censo Unificado ({seccionSeleccionada || 'Bloque'})
            </h3>

            {/* Fila de Totales */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
              <div style={{ backgroundColor: '#2d5a27', color: 'white', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.9rem', opacity: 0.8, textTransform: 'uppercase', fontWeight: 'bold' }}>Total Tallos Censados</span>
                <h1 style={{ margin: '5px 0 0 0', fontSize: '3rem' }}>{resultado.total_global?.tallos || 0}</h1>
              </div>
              <div style={{ backgroundColor: '#e5f0e4', color: '#2d5a27', padding: '20px', borderRadius: '12px', textAlign: 'center', border: '1px solid #aac9a0' }}>
                <span style={{ fontSize: '0.9rem', textTransform: 'uppercase', fontWeight: 'bold' }}>Total Botones Florales</span>
                <h1 style={{ margin: '5px 0 0 0', fontSize: '3rem' }}>{resultado.total_global?.botones || 0}</h1>
              </div>
            </div>

            {/* Detalle por Lados */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
              
              {/* LADO A */}
              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 15px 0', borderBottom: '2px solid #2d5a27', paddingBottom: '8px', color: '#2d5a27' }}>Lado A (Concatenado)</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.95rem' }}>
                  <div><strong>Total Tallos:</strong> {resultado.lado_A?.total_tallos || 0}</div>
                  <div><strong>Total Botones:</strong> {resultado.lado_A?.total_botones || 0}</div>
                  <div><strong>Etapa Dominante:</strong> <span style={{ textTransform: 'capitalize', color: '#166534', fontWeight: 'bold' }}>{resultado.lado_A?.etapa_dominante?.replace('_', ' ') || 'Ninguna'}</span></div>
                </div>
              </div>

              {/* LADO B */}
              <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 15px 0', borderBottom: '2px solid #2d5a27', paddingBottom: '8px', color: '#2d5a27' }}>Lado B (Concatenado)</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.95rem' }}>
                  <div><strong>Total Tallos:</strong> {resultado.lado_B?.total_tallos || 0}</div>
                  <div><strong>Total Botones:</strong> {resultado.lado_B?.total_botones || 0}</div>
                  <div><strong>Etapa Dominante:</strong> <span style={{ textTransform: 'capitalize', color: '#166534', fontWeight: 'bold' }}>{resultado.lado_B?.etapa_dominante?.replace('_', ' ') || 'Ninguna'}</span></div>
                </div>
              </div>

            </div>

            {/* Razonamiento de la IA */}
            <div style={{ backgroundColor: '#f8fafc', padding: '25px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.9rem', lineHeight: '1.6', color: '#334155' }}>
              <h4 style={{ margin: '0 0 15px 0', color: '#1e293b', borderBottom: '1px solid #cbd5e1', paddingBottom: '5px' }}>Análisis Unificado de Tramos (CoT)</h4>
              <div style={{ marginBottom: '15px' }}>
                <strong style={{ color: '#2d5a27' }}>Deduplicación Lado A:</strong>
                <p style={{ margin: '5px 0 0 0' }}>{resultado.razonamiento_previo?.analisis_lado_A}</p>
              </div>
              <div>
                <strong style={{ color: '#2d5a27' }}>Deduplicación Lado B:</strong>
                <p style={{ margin: '5px 0 0 0' }}>{resultado.razonamiento_previo?.analisis_lado_B}</p>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

// Icons
function VideoIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="23 7 16 12 23 17 23 7"></polygon>
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="5 3 19 12 5 21 5 3"></polygon>
    </svg>
  );
}

function Spinner() {
  return (
    <div style={{
      border: '4px solid rgba(255, 255, 255, 0.3)',
      width: '20px',
      height: '20px',
      borderRadius: '50%',
      borderLeftColor: 'white',
      animation: 'spin 1s linear infinite',
      display: 'inline-block'
    }}>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}