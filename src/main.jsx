import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { MotionConfig } from 'framer-motion'
import Lenis from 'lenis'
import './index.css'
import App from './App.jsx'
import Login from './Login.jsx'
import PanelMasajista from './PanelMasajista.jsx'
import PanelAdmin from './PanelAdmin.jsx'
import Verificacion from './Verificacion.jsx'
import PerfilPublico from './PerfilPublico.jsx'
import Favoritos from './Favoritos.jsx'

const reducirMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches

if (!reducirMovimiento) {
  const lenis = new Lenis({
    duration: 1.2,
    smoothWheel: true,
  })

  function animar(tiempo) {
    lenis.raf(tiempo)
    requestAnimationFrame(animar)
  }

  requestAnimationFrame(animar)
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/login" element={<Login />} />
          <Route path="/panel-masajista" element={<PanelMasajista />} />
          <Route path="/admin" element={<PanelAdmin />} />
          <Route path="/verificacion" element={<Verificacion />} />
          <Route path="/perfil/:id" element={<PerfilPublico />} />
                    <Route path="/favoritos" element={<Favoritos />} />
        </Routes>
      </BrowserRouter>
    </MotionConfig>
  </StrictMode>,
)
