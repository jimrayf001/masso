import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { supabase } from "./supabaseClient"
import "./PerfilPublico.css"

function iniciales(nombre) {
  return nombre
    .split(" ")
    .map(p => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

function generarLinkWhatsapp(numero, nombre) {
  const soloNumeros = numero.replace(/\D/g, "")
  const mensaje = "Hola " + nombre + "! Vi tu perfil en Masso y me gustaria agendar una sesion"
  return "https://wa.me/" + soloNumeros + "?text=" + encodeURIComponent(mensaje)
}

function Estrellas({ calificacion }) {
  return (
    <div className="estrellas-visual">
      {[1, 2, 3, 4, 5].map(n => (
        <span key={n} className={n <= calificacion ? "estrella-llena" : "estrella-vacia"}>★</span>
      ))}
    </div>
  )
}

function PerfilPublico() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [masajista, setMasajista] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [galeriaAbierta, setGaleriaAbierta] = useState(null)
  const [galeriaIndice, setGaleriaIndice] = useState(0)
  const [resenas, setResenas] = useState([])
  const [usuario, setUsuario] = useState(null)
  const [perfilUsuario, setPerfilUsuario] = useState(null)
  const [nuevaCalificacion, setNuevaCalificacion] = useState(0)
  const [nuevoComentario, setNuevoComentario] = useState("")
  const [enviandoResena, setEnviandoResena] = useState(false)
  const [mensajeResena, setMensajeResena] = useState("")

  useEffect(() => {
    cargarMasajista()
    cargarResenas()
    cargarUsuario()
  }, [id])

  const cargarMasajista = async () => {
    const { data, error } = await supabase
      .from("masajistas")
      .select("*")
      .eq("id", id)
      .single()

    if (!error && data) {
      setMasajista(data)
    }
    setCargando(false)
  }

  const cargarResenas = async () => {
    const { data } = await supabase
      .from("resenas")
      .select("*")
      .eq("masajista_id", id)
      .order("created_at", { ascending: false })

    setResenas(data || [])
  }

  const cargarUsuario = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setUsuario(user)

    const { data: perfilData } = await supabase
      .from("perfiles")
      .select("*")
      .eq("user_id", user.id)
      .single()

    setPerfilUsuario(perfilData)
  }

  const enviarResena = async (e) => {
    e.preventDefault()
    if (nuevaCalificacion === 0) {
      setMensajeResena("Selecciona una calificación de estrellas.")
      return
    }

    setEnviandoResena(true)
    setMensajeResena("")

    const { error } = await supabase.from("resenas").insert({
      masajista_id: parseInt(id),
      cliente_id: usuario.id,
      cliente_nombre: perfilUsuario?.nombre || "Cliente",
      calificacion: nuevaCalificacion,
      comentario: nuevoComentario,
    })

    setEnviandoResena(false)

    if (error) {
      setMensajeResena("Error al enviar: " + error.message)
    } else {
      setNuevaCalificacion(0)
      setNuevoComentario("")
      setMensajeResena("¡Gracias por tu reseña!")
      cargarResenas()
    }
  }

const abrirGaleriaDesdeGaleria = (indiceInicial) => {
    const fotos = masajista.fotos_local || []
    setGaleriaAbierta(fotos)
    setGaleriaIndice(indiceInicial)
  }

  const abrirGaleriaDesdePerfil = () => {
    const fotos = [
      ...(masajista.foto_perfil ? [masajista.foto_perfil] : []),
      ...(masajista.fotos_local || [])
    ]
    setGaleriaAbierta(fotos)
    setGaleriaIndice(0)
  }

  const siguienteFoto = () => {
    setGaleriaIndice(idx => (idx + 1) % galeriaAbierta.length)
  }

  const anteriorFoto = () => {
    setGaleriaIndice(idx => (idx - 1 + galeriaAbierta.length) % galeriaAbierta.length)
  }

  const promedioEstrellas = resenas.length > 0
    ? (resenas.reduce((sum, r) => sum + r.calificacion, 0) / resenas.length).toFixed(1)
    : null

  if (cargando) {
    return <div className="perfil-loading">Cargando...</div>
  }

  if (!masajista) {
    return (
      <div className="perfil-loading">
        <p>No se encontró este perfil.</p>
        <button className="btn-volver-perfil" onClick={() => navigate("/?entrar=true")}>← Volver al inicio</button>
      </div>
    )
  }

  const puedeComentar = usuario && perfilUsuario?.rol === "cliente"

  return (
    <div className="perfil-publico-page">
      {masajista.foto_perfil && (
        <div
          className="perfil-fondo-blur"
          style={{ backgroundImage: `url(${masajista.foto_perfil})` }}
        />
      )}

      <nav className="perfil-navbar">
        <div className="logo-lineas" onClick={() => navigate("/")}>
          <span className="linea-logo small" />
          <span className="logo-texto small">MASSO</span>
          <span className="linea-logo small" />
        </div>
        <button className="btn-volver-perfil" onClick={() => navigate("/?entrar=true")}>← Volver</button>
      </nav>

      <div className="perfil-hero">
        {masajista.foto_perfil ? (
          <img
            src={masajista.foto_perfil}
            alt={masajista.nombre}
            className="perfil-hero-img"
            onClick={() => masajista.fotos_local && masajista.fotos_local.length > 0 && abrirGaleria(0)}
          />
        ) : (
          <div className="avatar-placeholder perfil-hero-img">
            <span>{iniciales(masajista.nombre)}</span>
          </div>
        )}
        <div className="perfil-hero-overlay" />
        <div className="perfil-hero-info">
          <span className={`badge ${masajista.disponible ? "badge-on" : "badge-off"}`}>
            {masajista.disponible ? "● En línea" : "● Ocupada"}
          </span>
          <h1 className="perfil-hero-nombre">{masajista.nombre}</h1>
          <p className="perfil-hero-comuna">📍 {masajista.comuna}</p>
          {promedioEstrellas && (
            <div className="perfil-hero-rating">
              <Estrellas calificacion={Math.round(promedioEstrellas)} />
              <span className="perfil-hero-rating-numero">{promedioEstrellas} ({resenas.length})</span>
            </div>
          )}
        </div>
      </div>

      <div className="perfil-contenido-unico">

        {/* PRECIO + WHATSAPP DESTACADO */}
        <div className="perfil-accion-box">
          <div>
            <p className="perfil-precio-numero">$ {masajista.precio?.toLocaleString("es-CL")}</p>
            <p className="perfil-precio-detalle">por sesión de 60 min</p>
          </div>
          {masajista.whatsapp ? (
            <a href={generarLinkWhatsapp(masajista.whatsapp, masajista.nombre)} target="_blank" rel="noreferrer" className="btn-primary large btn-whatsapp">Contactar por WhatsApp</a>
          ) : (
            <button className="btn-primary large" disabled>WhatsApp no disponible</button>
          )}
        </div>

        {/* SOBRE MÍ */}
        {masajista.descripcion && (
          <div className="perfil-seccion">
            <h3 className="perfil-seccion-titulo">Sobre mí</h3>
            <p className="perfil-descripcion-texto">{masajista.descripcion}</p>
          </div>
        )}

        {/* GALERÍA */}
        {masajista.fotos_local && masajista.fotos_local.length > 0 && (
          <div className="perfil-seccion">
            <h3 className="perfil-seccion-titulo">Galería</h3>
            <div className="perfil-galeria-grid">
              {masajista.fotos_local.map((url, i) => (
                <img
                  key={i}
                  src={url}
                  alt={`Foto ${i + 1}`}
                  className="perfil-galeria-item"
                  onClick={() => abrirGaleria(i)}
                />
              ))}
            </div>
          </div>
        )}

        {/* SERVICIOS */}
        <div className="perfil-seccion">
          <h3 className="perfil-seccion-titulo">Servicios</h3>
          <div className="perfil-servicios-tags">
            {masajista.servicios && masajista.servicios.length > 0 ? (
              masajista.servicios.map((s, i) => (
                <span key={i} className="perfil-tag">{s}</span>
              ))
            ) : (
              <p className="perfil-descripcion-texto">{masajista.servicio}</p>
            )}
          </div>
        </div>

        {/* PROMOCIÓN */}
        {masajista.promocion_activa && (
          <div className="perfil-promo-box">🔥 {masajista.promocion_activa}</div>
        )}

        {/* RESEÑAS */}
        <div className="perfil-seccion">
          <h3 className="perfil-seccion-titulo">
            Reseñas {resenas.length > 0 && `(${resenas.length})`}
          </h3>

          {puedeComentar && (
            <form onSubmit={enviarResena} className="resena-form">
              <p className="resena-form-label">Tu calificación</p>
              <div className="estrellas-input">
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    type="button"
                    key={n}
                    className={n <= nuevaCalificacion ? "estrella-btn-llena" : "estrella-btn-vacia"}
                    onClick={() => setNuevaCalificacion(n)}
                  >
                    ★
                  </button>
                ))}
              </div>
              <textarea
                value={nuevoComentario}
                onChange={(e) => setNuevoComentario(e.target.value)}
                placeholder="Cuéntale a otros cómo fue tu experiencia (opcional)"
                rows={3}
                maxLength={300}
              />
              {mensajeResena && <p className="resena-mensaje">{mensajeResena}</p>}
              <button type="submit" className="btn-primary" disabled={enviandoResena}>
                {enviandoResena ? "Enviando..." : "Publicar reseña"}
              </button>
            </form>
          )}

          {!usuario && (
            <p className="resena-aviso">
              <span onClick={() => navigate("/login")} className="resena-link">Inicia sesión</span> como cliente para dejar una reseña.
            </p>
          )}

          <div className="resenas-lista">
            {resenas.length === 0 ? (
              <p className="perfil-descripcion-texto">Aún no hay reseñas para este perfil.</p>
            ) : (
              resenas.map((r) => (
                <div key={r.id} className="resena-item">
                  <div className="resena-item-header">
                    <span className="resena-item-nombre">{r.cliente_nombre}</span>
                    <Estrellas calificacion={r.calificacion} />
                  </div>
                  {r.comentario && <p className="resena-item-comentario">{r.comentario}</p>}
                  {r.respuesta_masajista && (
                    <div className="resena-respuesta">
                      <span className="resena-respuesta-label">Respuesta de {masajista.nombre}:</span>
                      <p>{r.respuesta_masajista}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

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
              <button className="historia-flecha visor-flecha-izq" onClick={(e) => { e.stopPropagation(); anteriorFoto() }}>‹</button>
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
              <button className="historia-flecha visor-flecha-der" onClick={(e) => { e.stopPropagation(); siguienteFoto() }}>›</button>
            )}

            {galeriaAbierta.length > 1 && (
              <div className="visor-contador">{galeriaIndice + 1} / {galeriaAbierta.length}</div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default PerfilPublico
