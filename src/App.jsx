import { motion, AnimatePresence } from "framer-motion"
import { useState, useRef, useEffect } from "react"
import { supabase } from "./supabaseClient"
import "./App.css"

const demoMasajistas = [
  { id: "d1", nombre: "Demo Uno", comuna: "Providencia", disponible: true, servicio: "Relajación", precio: 40000, promocion_activa: "20% dcto esta semana", categoria: "basica" },
  { id: "d2", nombre: "Demo Dos", comuna: "Las Condes", disponible: false, servicio: "Descontracturante", precio: 45000, categoria: "basica" },
  { id: "d3", nombre: "Demo Tres", comuna: "Ñuñoa", disponible: true, servicio: "Piedras calientes", precio: 50000, categoria: "basica" },
  { id: "d4", nombre: "Demo Cuatro", comuna: "Santiago Centro", disponible: true, servicio: "Relajación", precio: 38000, promocion_activa: "2x1 sesiones dobles", categoria: "basica" },
  { id: "d5", nombre: "Demo Cinco", comuna: "Vitacura", disponible: false, servicio: "Facial", precio: 55000, categoria: "basica" },
  { id: "d6", nombre: "Demo Seis", comuna: "Maipú", disponible: true, servicio: "Deportivo", precio: 35000, categoria: "basica" },
  { id: "d7", nombre: "Demo Siete", comuna: "La Florida", disponible: true, servicio: "Relajación", precio: 42000, categoria: "basica" },
  { id: "d8", nombre: "Demo Ocho", comuna: "Providencia", disponible: false, servicio: "Aromática", precio: 47000, categoria: "basica" },
  { id: "d9", nombre: "Demo Nueve", comuna: "Las Condes", disponible: true, servicio: "Descontracturante", precio: 48000, categoria: "basica" },
  { id: "d10", nombre: "Demo Diez", comuna: "Ñuñoa", disponible: true, servicio: "Piedras calientes", precio: 52000, categoria: "basica" },
  { id: "d11", nombre: "Demo Once", comuna: "Vitacura", disponible: false, servicio: "Relajación", precio: 41000, categoria: "basica" },
  { id: "d12", nombre: "Demo Doce", comuna: "Maipú", disponible: true, servicio: "Facial", precio: 46000, categoria: "basica" },
]

const promosDemo = [
  "20% de descuento esta semana",
  "Nuevo horario disponible",
  "Promoción 2x1 en sesiones dobles",
  "Recién agregué nuevas fotos",
  "Disponible todo el finde",
]

const comunasDisponibles = ["Todas", "Santiago Centro", "Providencia", "Las Condes", "Ñuñoa", "Vitacura", "Maipú", "La Florida"]
const serviciosDisponibles = ["Cualquiera", "Relajación", "Descontracturante", "Piedras calientes", "Deportivo", "Facial", "Aromática", "Reductivo", "Circulatorio", "Prenatal", "Sueco"]

const categoriasInfo = {
  vip: { titulo: "👑 Icónica", clase: "seccion-vip" },
  "super-premium": { titulo: "✨ Prestige", clase: "seccion-super" },
  premium: { titulo: "⭐ Signature", clase: "seccion-premium" },
  basica: { titulo: "Perfiles disponibles", clase: "seccion-basica" },
}

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

function TarjetaMasajista({ m, i, setPerfilAbierto }) {
  return (
    <motion.div
      className={`card card-poster card-${m.categoria || "basica"} ${m.disponible ? "neon-verde" : "neon-rojo"}`}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(i, 8) * 0.05 }}
      whileHover={{ y: -6 }}
      onClick={() => setPerfilAbierto(m)}
    >
      {m.foto_perfil ? (
        <img src={m.foto_perfil} alt={m.nombre} className="card-poster-img" />
      ) : (
        <div className="avatar-placeholder card-poster-img">
          <span>{iniciales(m.nombre)}</span>
        </div>
      )}

      <div className="card-poster-overlay" />

      {m.promocion_activa && (
        <span className="badge-promo-icono" title="Tiene promoción activa">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="8" width="18" height="4" rx="1"/>
            <path d="M12 8v13"/>
            <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/>
            <path d="M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 0 1 0 5"/>
          </svg>
        </span>
      )}

{m.categoria === "vip" && (
        <span className="badge-categoria badge-vip badge-categoria-poster">
          <svg className="corona-icono" viewBox="0 0 24 24" fill="none">
            <path d="M3 8L7 11L12 4L17 11L21 8L19 18H5L3 8Z" fill="#0a0a0a"/>
            <circle cx="12" cy="4" r="1.4" fill="#0a0a0a"/>
            <circle cx="3" cy="8" r="1.2" fill="#0a0a0a"/>
            <circle cx="21" cy="8" r="1.2" fill="#0a0a0a"/>
          </svg>
          ICÓNICA
        </span>
      )}
      {m.categoria === "super-premium" && (
        <span className="badge-categoria badge-super badge-categoria-poster">✨ PRESTIGE</span>
      )}
      {m.categoria === "premium" && (
        <span className="badge-categoria badge-premium-tag badge-categoria-poster">⭐ SIGNATURE</span>
      )}

      <div className="card-poster-info">
        <h3 className="card-poster-nombre">{m.nombre}</h3>
        <p className="card-poster-comuna">📍 {m.comuna}</p>
      </div>
    </motion.div>
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
  const [historiaIndice, setHistoriaIndice] = useState(0)
  const [galeriaAbierta, setGaleriaAbierta] = useState(null)
  const [galeriaIndice, setGaleriaIndice] = useState(0)
  const generarLinkWhatsapp = (numero) => {
    const soloNumeros = numero.replace(/\D/g, "")
    const mensaje = "Hola! Vi tu perfil en Masso y me gustaria agendar una sesion"
    return "https://wa.me/" + soloNumeros + "?text=" + encodeURIComponent(mensaje)
  }
  const [soloOportunidades, setSoloOportunidades] = useState(false)
  const [filtroDisponible, setFiltroDisponible] = useState("todas")
  const [filtroComuna, setFiltroComuna] = useState("Todas")
  const [quizAbierto, setQuizAbierto] = useState(false)
  const [quizPaso, setQuizPaso] = useState(0)
  const [quizRespuestas, setQuizRespuestas] = useState({ servicio: "Cualquiera", comuna: "Todas", promo: "no-importa" })
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

  const abrirQuiz = () => {
    setQuizPaso(0)
    setQuizRespuestas({ servicio: "Cualquiera", comuna: "Todas", promo: "no-importa" })
    setQuizAbierto(true)
  }

  const aplicarQuiz = () => {
    setEntro(true)
    setSoloOportunidades(quizRespuestas.promo === "si")
    setFiltroComuna(quizRespuestas.comuna)
    setQuizAbierto(false)
    setTimeout(() => {
      masajistasRef.current?.scrollIntoView({ behavior: "smooth" })
    }, 150)
  }

  const enviarRegistro = (e) => {
    e.preventDefault()
    setRegistroEnviado(true)
    setTimeout(() => {
      setRegistroAbierto(false)
      setRegistroEnviado(false)
    }, 2000)
  }

  const abrirHistoria = (m, i) => {
    setHistoriaIndice(0)
    setHistoriaAbierta({ ...m, promo: m.promocion_activa || promosDemo[i % promosDemo.length] })
  }

  const siguienteImagenHistoria = () => {
    if (!historiaAbierta?.foto_historia) return
    setHistoriaIndice(idx => (idx + 1) % historiaAbierta.foto_historia.length)
  }

  const anteriorImagenHistoria = () => {
    if (!historiaAbierta?.foto_historia) return
    setHistoriaIndice(idx => (idx - 1 + historiaAbierta.foto_historia.length) % historiaAbierta.foto_historia.length)
  }

  const abrirGaleria = (masajista, indiceInicial) => {
    const fotos = [
      ...(masajista.foto_perfil ? [masajista.foto_perfil] : []),
      ...(masajista.fotos_local || [])
    ]
    setGaleriaAbierta(fotos)
    setGaleriaIndice(indiceInicial)
  }

  const siguienteFotoGaleria = () => {
    if (!galeriaAbierta) return
    setGaleriaIndice(idx => (idx + 1) % galeriaAbierta.length)
  }

  const anteriorFotoGaleria = () => {
    if (!galeriaAbierta) return
    setGaleriaIndice(idx => (idx - 1 + galeriaAbierta.length) % galeriaAbierta.length)
  }

  const historiasVisibles = masajistas.filter(m => {
    if (!m.historia_actualizada_en) return true
    const horasTranscurridas = (Date.now() - new Date(m.historia_actualizada_en).getTime()) / (1000 * 60 * 60)
    return horasTranscurridas < 24
  })

  const ordenCategorias = ["vip", "super-premium", "premium", "basica"]

  const masajistasFiltradas = masajistas
    .filter(m => soloOportunidades ? m.promocion_activa : true)
    .filter(m => filtroDisponible === "en-linea" ? m.disponible : filtroDisponible === "ocupadas" ? !m.disponible : true)
    .filter(m => filtroComuna === "Todas" ? true : m.comuna === filtroComuna)
    .filter(m => quizRespuestas.servicio === "Cualquiera" ? true : (m.servicios?.includes(quizRespuestas.servicio) || m.servicio?.toLowerCase().includes(quizRespuestas.servicio.toLowerCase())))

  const gruposPorCategoria = ordenCategorias
    .map(cat => ({
      categoria: cat,
      items: masajistasFiltradas.filter(m => (m.categoria || "basica") === cat)
    }))
    .filter(grupo => grupo.items.length > 0)

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
            <div
              className="logo-nav logo-nav-clicable"
              onClick={() => { setEntro(false); setSoloOportunidades(false) }}
            >
              <div className="logo-lineas">
                <span className="linea-logo small" />
                <span className="logo-texto small">MASSO</span>
                <span className="linea-logo small" />
              </div>
            </div>
            <div className="nav-links">
              <button className="nav-link-btn" onClick={irAOportunidades}>
                <span className="nav-link-icon">🔥</span> Oportunidades
              </button>
              <button className="nav-link-btn" onClick={abrirQuiz}>
                <span className="nav-link-icon">✨</span> Ubica tu servicio ideal
              </button>
              <button className="btn-primary" onClick={() => window.location.href = "/login"}>Registrarse</button>
            </div>
          </nav>

          <section className="seccion-masajistas" ref={masajistasRef}>

            {!cargandoMasajistas && historiasVisibles.length > 0 && (
              <div className="stories-wrapper">
                <div className="stories-track">
                  {historiasVisibles.map((m, i) => (
                    <button
                      key={m.id}
                      className="story-item"
                      onClick={() => abrirHistoria(m, i)}
                    >
                      <span className={`story-ring ${m.promocion_activa ? "story-ring-promo" : ""}`}>
                        {m.foto_perfil ? (
                          <img src={m.foto_perfil} alt={m.nombre} className="story-avatar-img" />
                        ) : (
                          <span className="story-avatar">{iniciales(m.nombre)}</span>
                        )}
                      </span>
                      <span className="story-nombre">{m.nombre.split(" ")[0]}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {soloOportunidades && (
              <motion.div className="seccion-header"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <span className="seccion-tag gold">Ofertas activas ahora</span>
                <h2 className="seccion-titulo gold-solido">Oportunidades del momento</h2>
                <button className="btn-ver-todas" onClick={irAMasajistas}>Ver todas las masajistas</button>
              </motion.div>
            )}

            <div className="filtros-wrapper">
              <div className="filtro-grupo">
                <span className="filtro-label">Disponibilidad</span>
                <div className="filtro-botones">
                  <button
                    className={filtroDisponible === "todas" ? "filtro-btn-activo" : "filtro-btn"}
                    onClick={() => setFiltroDisponible("todas")}
                  >
                    Todas
                  </button>
                  <button
                    className={filtroDisponible === "en-linea" ? "filtro-btn-activo" : "filtro-btn"}
                    onClick={() => setFiltroDisponible("en-linea")}
                  >
                    ● En línea
                  </button>
                  <button
                    className={filtroDisponible === "ocupadas" ? "filtro-btn-activo" : "filtro-btn"}
                    onClick={() => setFiltroDisponible("ocupadas")}
                  >
                    Ocupadas
                  </button>
                </div>
              </div>

              <div className="filtro-grupo">
                <span className="filtro-label">Comuna</span>
                <select
                  className="filtro-select"
                  value={filtroComuna}
                  onChange={(e) => setFiltroComuna(e.target.value)}
                >
                  {comunasDisponibles.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <button className="btn-quiz" onClick={abrirQuiz}>
                ✨ Ubica tu servicio ideal
              </button>
            </div>

            {cargandoMasajistas ? (
              <p className="cargando-texto">Cargando masajistas...</p>
            ) : masajistasFiltradas.length === 0 ? (
              <p className="cargando-texto">
                No hay masajistas que coincidan con estos filtros.
              </p>
            ) : (
              gruposPorCategoria.map((grupo) => (
                <div key={grupo.categoria} className={`grupo-categoria ${categoriasInfo[grupo.categoria].clase}`}>
                  {categoriasInfo[grupo.categoria].titulo && (
                    <h3 className="titulo-grupo-categoria">
                      {categoriasInfo[grupo.categoria].titulo}
                    </h3>
                  )}
                  <div className="cards-grid">
                    {grupo.items.map((m, i) => (
                      <TarjetaMasajista key={m.id} m={m} i={i} setPerfilAbierto={setPerfilAbierto} />
                    ))}
                  </div>
                </div>
              ))
            )}
          </section>

          <footer className="footer">
            <RedesSociales />
            <p className="footer-texto">© 2026 Masso · Santiago, Chile</p>
          </footer>
        </motion.div>
      )}

      {/* QUIZ: UBICA TU SERVICIO IDEAL */}
      <AnimatePresence>
        {quizAbierto && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setQuizAbierto(false)}
          >
            <motion.div
              className="quiz-card"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="modal-cerrar" onClick={() => setQuizAbierto(false)}>✕</button>

              <div className="quiz-progreso">
                {[0, 1, 2].map(p => (
                  <span key={p} className={`quiz-punto ${p <= quizPaso ? "quiz-punto-activo" : ""}`} />
                ))}
              </div>

              {quizPaso === 0 && (
                <div className="quiz-paso">
                  <h3 className="quiz-titulo">¿Qué tipo de servicio buscas?</h3>
                  <div className="quiz-opciones">
                    {serviciosDisponibles.map(s => (
                      <button
                        key={s}
                        className={quizRespuestas.servicio === s ? "quiz-opcion-activa" : "quiz-opcion"}
                        onClick={() => setQuizRespuestas(r => ({ ...r, servicio: s }))}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  <button className="btn-primary large full quiz-siguiente" onClick={() => setQuizPaso(1)}>
                    Siguiente
                  </button>
                </div>
              )}

              {quizPaso === 1 && (
                <div className="quiz-paso">
                  <h3 className="quiz-titulo">¿En qué comuna?</h3>
                  <div className="quiz-opciones">
                    {comunasDisponibles.map(c => (
                      <button
                        key={c}
                        className={quizRespuestas.comuna === c ? "quiz-opcion-activa" : "quiz-opcion"}
                        onClick={() => setQuizRespuestas(r => ({ ...r, comuna: c }))}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                  <div className="quiz-nav">
                    <button className="btn-quiz-atras" onClick={() => setQuizPaso(0)}>← Atrás</button>
                    <button className="btn-primary large quiz-siguiente" onClick={() => setQuizPaso(2)}>
                      Siguiente
                    </button>
                  </div>
                </div>
              )}

              {quizPaso === 2 && (
                <div className="quiz-paso">
                  <h3 className="quiz-titulo">¿Buscas algo con promoción?</h3>
                  <div className="quiz-opciones">
                    <button
                      className={quizRespuestas.promo === "si" ? "quiz-opcion-activa" : "quiz-opcion"}
                      onClick={() => setQuizRespuestas(r => ({ ...r, promo: "si" }))}
                    >
                      Sí, con descuento
                    </button>
                    <button
                      className={quizRespuestas.promo === "no-importa" ? "quiz-opcion-activa" : "quiz-opcion"}
                      onClick={() => setQuizRespuestas(r => ({ ...r, promo: "no-importa" }))}
                    >
                      No importa
                    </button>
                  </div>
                  <div className="quiz-nav">
                    <button className="btn-quiz-atras" onClick={() => setQuizPaso(1)}>← Atrás</button>
                    <button className="btn-primary large quiz-siguiente" onClick={aplicarQuiz}>
                      Ver resultados
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
                {historiaAbierta.foto_historia && historiaAbierta.foto_historia.length > 0 ? (
                  historiaAbierta.foto_historia.map((_, idx) => (
                    <span
                      key={idx}
                      className={`historia-barra-fill ${idx < historiaIndice ? "barra-completa" : idx === historiaIndice ? "barra-activa" : "barra-pendiente"}`}
                    />
                  ))
                ) : (
                  <span className="historia-barra-fill barra-activa" />
                )}
              </div>
              <button className="modal-cerrar" onClick={() => setHistoriaAbierta(null)}>✕</button>
              <div className="historia-header">
                <span className="historia-avatar">{iniciales(historiaAbierta.nombre)}</span>
                <div>
                  <p className="historia-nombre">{historiaAbierta.nombre}</p>
                  <p className="historia-comuna">📍 {historiaAbierta.comuna}</p>
                </div>
              </div>

              {historiaAbierta.foto_historia && historiaAbierta.foto_historia.length > 0 ? (
                <div className="historia-imagen-wrapper">
                  {historiaAbierta.foto_historia.length > 1 && (
                    <button className="historia-flecha historia-flecha-izq" onClick={anteriorImagenHistoria}>‹</button>
                  )}
                  <img
                    src={historiaAbierta.foto_historia[historiaIndice]}
                    alt="Historia"
                    className="historia-imagen-real"
                  />
                  {historiaAbierta.foto_historia.length > 1 && (
                    <button className="historia-flecha historia-flecha-der" onClick={siguienteImagenHistoria}>›</button>
                  )}
                </div>
              ) : (
                <div className="historia-body">
                  <p className="historia-promo">{historiaAbierta.promo}</p>
                  <p className="historia-servicio">{historiaAbierta.servicio}</p>
                  <p className="historia-precio">$ {historiaAbierta.precio?.toLocaleString("es-CL")}</p>
                </div>
              )}

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
              {perfilAbierto.foto_perfil ? (
                <img
                  src={perfilAbierto.foto_perfil}
                  alt={perfilAbierto.nombre}
                  className="modal-img"
                  onClick={() => abrirGaleria(perfilAbierto, 0)}
                />
              ) : (
                <div className="avatar-placeholder modal-avatar">
                  <span>{iniciales(perfilAbierto.nombre)}</span>
                </div>
              )}
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
                {perfilAbierto.descripcion && (
                  <p className="modal-descripcion">{perfilAbierto.descripcion}</p>
                )}
                <p className="modal-precio">$ {perfilAbierto.precio?.toLocaleString("es-CL")} <span>/ 60 min</span></p>

                {perfilAbierto.fotos_local && perfilAbierto.fotos_local.length > 0 && (
                  <div className="modal-fotos-local">
                    {perfilAbierto.fotos_local.map((url, i) => (
                      <img
                        key={i}
                        src={url}
                        alt={`Local ${i + 1}`}
                        className="modal-foto-local-item"
                        onClick={() => abrirGaleria(perfilAbierto, (perfilAbierto.foto_perfil ? 1 : 0) + i)}
                      />
                    ))}
                  </div>
                )}

{perfilAbierto.whatsapp ? (
                  
                    href={generarLinkWhatsapp(perfilAbierto.whatsapp)}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-primary large full btn-whatsapp"
                  >
                    Contactar por WhatsApp
                  </a>
                ) : (
                  <button className="btn-primary large full" disabled>WhatsApp no disponible</button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* VISOR DE GALERÍA CON NAVEGACIÓN */}
      <AnimatePresence>
        {galeriaAbierta && (
          <motion.div
            className="visor-imagen-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setGaleriaAbierta(null)}
          >
            <button className="modal-cerrar visor-cerrar" onClick={() => setGaleriaAbierta(null)}>✕</button>

            {galeriaAbierta.length > 1 && (
              <button className="historia-flecha visor-flecha-izq" onClick={(e) => { e.stopPropagation(); anteriorFotoGaleria() }}>‹</button>
            )}

            <motion.img
              key={galeriaIndice}
              src={galeriaAbierta[galeriaIndice]}
              alt="Vista ampliada"
              className="visor-imagen-real"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            />

            {galeriaAbierta.length > 1 && (
              <button className="historia-flecha visor-flecha-der" onClick={(e) => { e.stopPropagation(); siguienteFotoGaleria() }}>›</button>
            )}

            {galeriaAbierta.length > 1 && (
              <div className="visor-contador">{galeriaIndice + 1} / {galeriaAbierta.length}</div>
            )}
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
