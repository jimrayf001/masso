import { motion, AnimatePresence } from "framer-motion"
import { useState, useRef, useEffect } from "react"
import { supabase } from "./supabaseClient"
import "./App.css"

const demoMasajistas = [
  { id: "d1", nombre: "Demo Uno", comuna: "Providencia", disponible: true, servicio: "Relajación", precio: 40000, promocion_activa: "20% dcto esta semana" },
  { id: "d2", nombre: "Demo Dos", comuna: "Las Condes", disponible: false, servicio: "Descontracturante", precio: 45000 },
  { id: "d3", nombre: "Demo Tres", comuna: "Ñuñoa", disponible: true, servicio: "Piedras calientes", precio: 50000 },
  { id: "d4", nombre: "Demo Cuatro", comuna: "Santiago Centro", disponible: true, servicio: "Relajación", precio: 38000, promocion_activa: "2x1 sesiones dobles" },
  { id: "d5", nombre: "Demo Cinco", comuna: "Vitacura", disponible: false, servicio: "Facial", precio: 55000 },
  { id: "d6", nombre: "Demo Seis", comuna: "Maipú", disponible: true, servicio: "Deportivo", precio: 35000 },
  { id: "d7", nombre: "Demo Siete", comuna: "La Florida", disponible: true, servicio: "Relajación", precio: 42000 },
  { id: "d8", nombre: "Demo Ocho", comuna: "Providencia", disponible: false, servicio: "Aromática", precio: 47000 },
  { id: "d9", nombre: "Demo Nueve", comuna: "Las Condes", disponible: true, servicio: "Descontracturante", precio: 48000 },
  { id: "d10", nombre: "Demo Diez", comuna: "Ñuñoa", disponible: true, servicio: "Piedras calientes", precio: 52000 },
  { id: "d11", nombre: "Demo Once", comuna: "Vitacura", disponible: false, servicio: "Relajación", precio: 41000 },
  { id: "d12", nombre: "Demo Doce", comuna: "Maipú", disponible: true, servicio: "Facial", precio: 46000 },
]

const promosDemo = [
  "20% de descuento esta semana",
  "Nuevo horario disponible",
  "Promoción 2x1 en sesiones dobles",
  "Recién agregué nuevas fotos",
  "Disponible todo el finde",
]

function iniciales(nombre) {
  return nombre
    .split(" ")
    .map(p => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

function RedesSociales() {
  return (
    <div className="redes-sociales">
      <a href="#" className="red-icon" aria-label="Instagram">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
        </svg>
      </a>
      <a href="#" className="red-icon" aria-label="TikTok">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M16 3v10.5a3.5 3.5 0 1 1-3.5-3.5" />
          <path d="M16 3c0 2.5 2 4.5 4.5 4.5" />
        </svg>
      </a>
      <a href="#" className="red-icon" aria-label="WhatsApp">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M20 12a8 8 0 1 1-3.5-6.6" />
          <path d="M20 12a8 8 0 0 1-11.5 7.2L4 20l1-4.2A8 8 0 0 1 20 12Z" />
          <path d="M9 9.5c0 3.5 2.5 5.5 5.5 5.5" />
        </svg>
      </a>
    </div>
  )
}

function App() {
  const [entro, setEntro] = useState(false)
  const [comuna, setComuna] = useState("Santiago")
  const [perfilAbierto, setPerfilAbierto] = useState(null)
  const [registroAbierto, setRegistroAbierto] = useState(false)
  const [registroEnviado, setRegistroEnviado] = useState(false)
  const [masajistas, setMasajistas] = useState([])
  const [cargandoMasajistas, setCargandoMasajistas] = useState(true)
  const [historiaAbierta, setHistoriaAbierta] = useState(null)
  const [soloOportunidades, setSoloOportunidades] = useState(false)
  const masajistasRef = useRef(null)

  useEffect(() => {
    cargarMasajistas()
  }, [])

  const cargarMasajistas = async () => {
    const { data, error } = await supabase
      .from("masajistas")
      .select("*")
      .order("created_at", { ascending: false })

    if (!error && data) {
      setMasajistas([...data, ...demoMasajistas])
    } else {
      setMasajistas(demoMasajistas)
    }
    setCargandoMasajistas(false)
  }

  const irAMasajistas = () => {
    setSoloOportunidades(false)
    setEntro(true)
    setTimeout(() => {
      masajistasRef.current?.scrollIntoView({ behavior: "smooth" })
    }, 100)
  }

  const irAOportunidades = () => {
    setSoloOportunidades(true)
    setEntro(true)
    setTimeout(() => {
      masajistasRef.current?.scrollIntoView({ behavior: "smooth" })
    }, 100)
  }

  const enviarRegistro = (e) => {
    e.preventDefault()
    setRegistroEnviado(true)
    setTimeout(() => {
      setRegistroAbierto(false)
      setRegistroEnviado(false)
    }, 2000)
  }

  const masajistasMostradas = soloOportunidades
    ? masajistas.filter(m => m.promocion_activa)
    : masajistas

  return (
    <div className="app">
      <video className="video-bg" autoPlay muted loop playsInline>
        <source src="/video01.mp4" type="video/mp4" />
      </video>
      <div className="video-overlay" />

      <AnimatePresence>
        {!entro && (
          <motion.div
            className="entrada"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="entrada-content"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="logo-entrada">
                <div className="logo-lineas">
                  <span className="linea-logo" />
                  <span className="logo-texto">MASSO</span>
                  <span className="linea-logo" />
                </div>
                <p className="logo-sub">MASAJES · PREMIUM</p>
              </div>

              <p className="entrada-aviso">Al entrar declaras ser mayor de 18 años.</p>

              <div className="entrada-selector">
                <span className="selector-icon">📍</span>
                <select value={comuna} onChange={e => setComuna(e.target.value)}>
                  <option>Santiago</option>
                  <option>Providencia</option>
                  <option>Las Condes</option>
                  <option>Ñuñoa</option>
                  <option>Vitacura</option>
                  <option>Maipú</option>
                  <option>La Florida</option>
                </select>
              </div>

              <button className="btn-entrar" onClick={() => setEntro(true)}>
                ENTRAR
              </button>

              <div className="entrada-bloques">
                <div
                  className="bloque"
                  onClick={irAOportunidades}
                  style={{ backgroundImage: "url('https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400')" }}
                >
                  <span>OPORTUNIDADES</span>
                </div>
                <div
                  className="bloque"
                  onClick={irAMasajistas}
                  style={{ backgroundImage: "url('https://images.unsplash.com/photo-1591343395082-e120087004b4?w=400')" }}
                >
                  <span>NOVEDADES</span>
                </div>
                <div
                  className="bloque"
                  onClick={() => window.location.href = "/login"}
                  style={{ backgroundImage: "url('https://images.unsplash.com/photo-1519824145371-296894a0daa9?w=400')" }}
                >
                  <span>PUBLÍCATE</span>
                </div>
              </div>

              <RedesSociales />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {entro && (
        <motion.div
          className="main-content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <nav className="navbar">
            <div className="logo-nav">
              <div className="logo-lineas">
                <span className="linea-logo small" />
                <span className="logo-texto small">MASSO</span>
                <span className="linea-logo small" />
              </div>
            </div>
            <div className="nav-links">
              <a href="#" onClick={(e) => { e.preventDefault(); irAOportunidades() }}>Oportunidades</a>
              <a href="#" onClick={(e) => { e.preventDefault(); masajistasRef.current?.scrollIntoView({ behavior: "smooth" }) }}>Ubica tu servicio ideal</a>
              <button className="btn-primary" onClick={() => window.location.href = "/login"}>Registrarse</button>
            </div>
          </nav>

          <section className="seccion-masajistas" ref={masajistasRef}>

            {!cargandoMasajistas && masajistas.length > 0 && (
              <div className="stories-wrapper">
                <div className="stories-track">
                  {masajistas.map((m, i) => (
                    <button
                      key={m.id}
                      className="story-item"
                      onClick={() => setHistoriaAbierta({ ...m, promo: m.promocion_activa || promosDemo[i % promosDemo.length] })}
                    >
                      <span className={`story-ring ${m.promocion_activa ? "story-ring-promo" : ""}`}>
                        <span className="story-avatar">{iniciales(m.nombre)}</span>
                      </span>
                      <span className="story-nombre">{m.nombre.split(" ")[0]}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <motion.div className="seccion-header"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="seccion-tag gold">
                {soloOportunidades ? "Ofertas activas ahora" : `Disponibles ahora · ${comuna}`}
              </span>
              <h2 className="seccion-titulo gold-solido">
                {soloOportunidades ? "Oportunidades del momento" : "Conoce a nuestras masajistas"}
              </h2>
              {soloOportunidades && (
                <button className="btn-ver-todas" onClick={irAMasajistas}>Ver todas las masajistas</button>
              )}
            </motion.div>

            {cargandoMasajistas ? (
              <p className="cargando-texto">Cargando masajistas...</p>
            ) : masajistasMostradas.length === 0 ? (
              <p className="cargando-texto">
                {soloOportunidades ? "No hay promociones activas por el momento." : "Aún no hay masajistas registradas. ¡Sé la primera!"}
              </p>
            ) : (
              <div className="cards-grid">
                {masajistasMostradas.map((m, i) => (
                  <motion.div
                    key={m.id}
                    className="card"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: Math.min(i, 8) * 0.05 }}
                    whileHover={{ y: -6 }}
                  >
                    <div className="card-img">
                      <div className="avatar-placeholder">
                        <span>{iniciales(m.nombre)}</span>
                      </div>
                      <span className={`badge ${m.disponible ? "badge-on" : "badge-off"}`}>
                        {m.disponible ? "● En línea" : "● Ocupada"}
                      </span>
                      {m.promocion_activa && (
                        <span className="badge-promo-card">🔥 Promo</span>
                      )}
                    </div>
                    <div className="card-body">
                      <h3 className="card-nombre">{m.nombre}</h3>
                      <p className="card-comuna">📍 {m.comuna}</p>
                      <p className="card-servicio">{m.servicio}</p>
                      {m.promocion_activa && (
                        <p className="card-promo-texto">{m.promocion_activa}</p>
                      )}
                      <div className="card-footer">
                        <span className="card-precio">$ {m.precio?.toLocaleString("es-CL")}</span>
                        <button className="btn-card" onClick={() => setPerfilAbierto(m)}>Ver perfil</button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </section>

          <footer className="footer">
            <RedesSociales />
            <p className="footer-texto">© 2026 Masso · Santiago, Chile</p>
          </footer>
        </motion.div>
      )}

      {/* HISTORIA A PANTALLA COMPLETA */}
      <AnimatePresence>
        {historiaAbierta && (
          <motion.div
            className="historia-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setHistoriaAbierta(null)}
          >
            <motion.div
              className="historia-card"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="historia-barra-progreso">
                <span className="historia-barra-fill" />
              </div>
              <button className="modal-cerrar" onClick={() => setHistoriaAbierta(null)}>✕</button>
              <div className="historia-header">
                <span className="historia-avatar">{iniciales(historiaAbierta.nombre)}</span>
                <div>
                  <p className="historia-nombre">{historiaAbierta.nombre}</p>
                  <p className="historia-comuna">📍 {historiaAbierta.comuna}</p>
                </div>
              </div>
              <div className="historia-body">
                <p className="historia-promo">{historiaAbierta.promo}</p>
                <p className="historia-servicio">{historiaAbierta.servicio}</p>
                <p className="historia-precio">$ {historiaAbierta.precio?.toLocaleString("es-CL")}</p>
              </div>
              <button
                className="btn-primary large full historia-cta"
                onClick={() => { setPerfilAbierto(historiaAbierta); setHistoriaAbierta(null) }}
              >
                Ver perfil completo
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL: VER PERFIL */}
      <AnimatePresence>
        {perfilAbierto && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPerfilAbierto(null)}
          >
            <motion.div
              className="modal-perfil"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="modal-cerrar" onClick={() => setPerfilAbierto(null)}>✕</button>
              <div className="avatar-placeholder modal-avatar">
                <span>{iniciales(perfilAbierto.nombre)}</span>
              </div>
              <div className="modal-info">
                <span className={`badge ${perfilAbierto.disponible ? "badge-on" : "badge-off"}`}>
                  {perfilAbierto.disponible ? "● En línea" : "● Ocupada"}
                </span>
                <h3>{perfilAbierto.nombre}</h3>
                <p className="modal-comuna">📍 {perfilAbierto.comuna}</p>
                <p className="modal-servicio">{perfilAbierto.servicio}</p>
                {perfilAbierto.promocion_activa && (
                  <p className="modal-promo">🔥 {perfilAbierto.promocion_activa}</p>
                )}
                <p className="modal-precio">$ {perfilAbierto.precio?.toLocaleString("es-CL")} <span>/ 60 min</span></p>
                <button className="btn-primary large full">Contactar por WhatsApp</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL: REGISTRO (rápido, opcional — el registro real está en /login) */}
      <AnimatePresence>
        {registroAbierto && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setRegistroAbierto(false)}
          >
            <motion.div
              className="modal-registro"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="modal-cerrar" onClick={() => setRegistroAbierto(false)}>✕</button>

              {!registroEnviado ? (
                <>
                  <h3 className="modal-titulo">Únete a <span className="gold italic">Masso</span></h3>
                  <p className="modal-sub">Completa tus datos y te contactaremos</p>
                  <form onSubmit={enviarRegistro} className="form-registro">
                    <input type="text" placeholder="Nombre completo" required />
                    <input type="email" placeholder="Correo electrónico" required />
                    <input type="tel" placeholder="Teléfono" required />
                    <select required defaultValue="">
                      <option value="" disabled>¿Cómo quieres unirte?</option>
                      <option value="cliente">Como cliente</option>
                      <option value="masajista">Como masajista</option>
                    </select>
                    <button type="submit" className="btn-primary large full">Enviar</button>
                  </form>
                </>
              ) : (
                <div className="registro-exito">
                  <span className="check-icon">✓</span>
                  <p>¡Listo! Te contactaremos pronto.</p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default App