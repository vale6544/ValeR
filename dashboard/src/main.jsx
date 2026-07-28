import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

// Importamos las vistas del sitio web y el panel de administración unificado
import Registro from './pages/web/Registro.jsx'
import LoginWeb from './pages/web/LoginWeb.jsx'
import Landing from './pages/web/Landing.jsx'
import ConfiguracionFinca from './pages/web/ConfiguracionFinca.jsx'
import MovilPreview from './pages/web/MovilPreview.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Ruta principal del dashboard web real */}
        <Route path="/" element={<App />} />
        
        {/* Registro y Login corporativos */}
        <Route path="/web/registro" element={<Registro />} />
        <Route path="/login" element={<LoginWeb />} />
        <Route path="/landing" element={<Landing />} />
        
        {/* Rutas unificadas bajo el panel de control administrativo */}
        <Route path="/configuracion-finca" element={<ConfiguracionFinca defaultSection="configuracion" />} />
        <Route path="/gestion-personal" element={<ConfiguracionFinca defaultSection="personal" />} />
        <Route path="/membresia" element={<ConfiguracionFinca defaultSection="facturacion" />} />
        
        {/* Vistas agronómicas simuladas con datos quemados (backups) */}
        <Route path="/web/ingreso-datos" element={<ConfiguracionFinca defaultSection="ingreso_datos" />} />
        <Route path="/web/datos-consolidados" element={<ConfiguracionFinca defaultSection="datos_consolidados" />} />
        <Route path="/web/proyecciones" element={<ConfiguracionFinca defaultSection="proyecciones" />} />
        <Route path="/web/cosecha" element={<ConfiguracionFinca defaultSection="cosecha" />} />
        <Route path="/web/poda" element={<ConfiguracionFinca defaultSection="poda" />} />
        <Route path="/web/riego" element={<ConfiguracionFinca defaultSection="riego" />} />
        <Route path="/web/croquis" element={<ConfiguracionFinca defaultSection="croquis" />} />
        <Route path="/web/movil-preview" element={<MovilPreview />} />
        <Route path="/web/permisos" element={<ConfiguracionFinca defaultSection="permisos" />} />
        <Route path="/web/admin-ajustes" element={<ConfiguracionFinca defaultSection="admin_ajustes" />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
