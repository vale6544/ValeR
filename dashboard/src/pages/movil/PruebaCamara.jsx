import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function PruebaCamara() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  
  // Estados para las advertencias en pantalla
  const [errorInclinacion, setErrorInclinacion] = useState(false);
  const [errorVelocidad, setErrorVelocidad] = useState(false);
  const [permisosOtorgados, setPermisosOtorgados] = useState(false);

  // Iniciar la cámara trasera del celular
  const iniciarCamara = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" } // Obliga a usar la cámara trasera
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      solicitarSensores();
    } catch (err) {
      alert("Error al acceder a la cámara: " + err.message);
    }
  };

  // Solicitar acceso al giroscopio y acelerómetro (necesario en iOS)
  const solicitarSensores = () => {
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission()
        .then(response => {
          if (response === 'granted') activarListeners();
        }).catch(console.error);
    } else {
      activarListeners(); // Android y navegadores estándar
    }
    setPermisosOtorgados(true);
  };

  const activarListeners = () => {
    // 1. Detección de Inclinación (Giroscopio)
    window.addEventListener('deviceorientation', (event) => {
      // 'beta' es la inclinación de adelante hacia atrás. 
      // 90 grados es perfectamente perpendicular al piso.
      const inclinacion = event.beta; 
      
      // Si se inclina menos de 75 o más de 105 grados, lanza error
      if (inclinacion < 75 || inclinacion > 105) {
        setErrorInclinacion(true);
      } else {
        setErrorInclinacion(false);
      }
    });

    // 2. Detección de Velocidad / Movimiento Brusco (Acelerómetro)
    window.addEventListener('devicemotion', (event) => {
      const { x, y, z } = event.acceleration;
      // En algunos dispositivos acceleration puede venir nulo si no se mueve o falta soporte
      const accX = x || 0;
      const accY = y || 0;
      const accZ = z || 0;
      
      // Calculamos la fuerza total del movimiento
      const aceleracionTotal = Math.sqrt(accX*accX + accY*accY + accZ*accZ);
      
      // Si la aceleración supera el umbral (ej. 5 m/s2), vas muy rápido
      if (aceleracionTotal > 5) {
        setErrorVelocidad(true);
        // Quitamos la alerta después de medio segundo de estar quietos
        setTimeout(() => setErrorVelocidad(false), 500);
      }
    });
  };

  // Limpiar la cámara al desmontar el componente
  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', backgroundColor: '#000', overflow: 'hidden' }}>
      
      {/* Feed de la cámara */}
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
      />

      {/* Botón de Volver (Esquina superior izquierda) */}
      <button
        onClick={() => {
          if (videoRef.current && videoRef.current.srcObject) {
            const tracks = videoRef.current.srcObject.getTracks();
            tracks.forEach(track => track.stop());
          }
          navigate("/movil/mis-camas");
        }}
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          padding: '12px 18px',
          backgroundColor: 'rgba(0,0,0,0.7)',
          color: 'white',
          border: '1px solid rgba(255,255,255,0.4)',
          borderRadius: '8px',
          fontSize: '1rem',
          fontWeight: 'bold',
          cursor: 'pointer',
          pointerEvents: 'auto',
          zIndex: 9999
        }}
      >
        ← Volver
      </button>

      {/* Interfaz superpuesta (HUD) */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
        
        {/* Cruz central de guía */}
        <div style={{ width: '60px', height: '60px', border: '2px solid rgba(255,255,255,0.5)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '6px', height: '6px', backgroundColor: 'white', borderRadius: '50%' }} />
        </div>

        {/* Alertas dinámicas */}
        {errorInclinacion && (
          <div style={{ marginTop: '20px', padding: '12px 24px', backgroundColor: 'rgba(239, 68, 68, 0.95)', color: 'white', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.2rem', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>
            ¡Mantén el celular recto (90°)!
          </div>
        )}

        {errorVelocidad && (
          <div style={{ marginTop: '20px', padding: '12px 24px', backgroundColor: 'rgba(245, 158, 11, 0.95)', color: 'white', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.2rem', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>
            ¡Vas muy rápido! Ve más despacio
          </div>
        )}

      </div>

      {/* Botón de inicio (necesario por seguridad de navegadores) */}
      {!permisosOtorgados && (
        <div style={{ position: 'absolute', bottom: '50px', width: '100%', display: 'flex', justifyContent: 'center', zIndex: 20 }}>
          <button 
            onClick={iniciarCamara} 
            style={{ padding: '16px 32px', fontSize: '1.2rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '30px', cursor: 'pointer', pointerEvents: 'auto', fontWeight: 'bold', boxShadow: '0 4px 15px rgba(16,185,129,0.4)' }}
          >
            Activar Cámara y Sensores
          </button>
        </div>
      )}
    </div>
  );
}
