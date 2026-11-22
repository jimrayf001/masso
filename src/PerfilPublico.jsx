import { useState, useEffect } from "react"
import { useParams, useNavigate, useSearchParams } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { supabase } from "./supabaseClient"
import "./PerfilPublico.css"

const nombresCategoria = {
  basica: "Esencial",
  premium: "Selecta",
  "super-premium": "Exclusiva",
  vip: "Élite",
}

const LIMITE_DESCRIPCION = 220

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
  const [searchParams, setSearchParams] = useSearchParams()
  const visorAbierto = searchParams.get("visor") === "1"
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
  const [pestana, setPestana] = useState("galeria")
  const [descripcionAbierta, setDescripcionAbierta] = useState(false)

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

  const abrirVisor = (fotos, indice) => {
    if (fotos.length === 0) return
    setGaleriaAbierta(fotos)
    setGaleriaIndice(indice)
    setSearchParams({ visor: "1" })
  }

  const abrirGaleriaDesdeGaleria = (indiceInicial) => {
    abrirVisor(masajista.fotos_local || [], indiceInicial)
  }

  const abrirGaleriaDesdePerfil = () => {
    const fotos = [
      ...(masajista.foto_perfil ? [masajista.foto_perfil] : []),
      ...(masajista.fotos_local || [])
    ]
    abrirVisor(fotos, 0)
  }

  const cerrarGaleria = () => {
    navigate(-1)
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
  const fotosGaleria = masajista.fotos_local || []
  const servicios = masajista.servicios && masajista.servicios.length > 0
    ? masajista.servicios
    : (masajista.servicio ? masajista.servicio.split(" · ").filter(Boolean) : [])
  const descripcion = masajista.descripcion || ""
  const descripcionLarga = descripcion.length > LIMITE_DESCRIPCION
  const descripcionVisible = descripcionLarga && !descripcionAbierta
    ? descripcion.slice(0, LIMITE_DESCRIPCION).trim() + "..."
    : descripcion
  
  return (
    <div className="perfil-publico-page">
      {masajista.foto_perfil && (
        <div
          className="perfil-fondo-blur"
          style={{ backgroundImage: `url(${masajista.foto_perfil})` }}
        />
      )}

      <nav className="perfil-navbar">
        <img
          src="/logo-masso.png"
          alt="Masso"
          className="logo-imagen-nav"
          style={{ cursor: "pointer" }}
          onClick={() => navigate("/?entrar=true")}
        />
        <button className="btn-volver-perfil" onClick={() => navigate("/?entrar=true")}>← Volver</button>
      </nav>

      <div className="perfil-wrap">
        <div className="perfil-header">
          {masajista.foto_perfil ? (
            <img
              src={masajista.foto_perfil}
              alt={masajista.nombre}
              className="perfil-avatar"
              onClick={abrirGaleriaDesdePerfil}
            />
          ) : (
            <div className="perfil-avatar perfil-avatar-vacio">
              <span>{iniciales(masajista.nombre)}</span>
            </div>
          )}

          <div className="perfil-datos">
            <div className="perfil-cabecera">
              <div>
                <div className="perfil-nombre-fila">
                  <h1 className="perfil-nombre">{masajista.nombre}</h1>
                  <span className="perfil-badge-categoria">
                    {nombresCategoria[masajista.categoria || "basica"]}
                  </span>
                  <span className={`perfil-estado ${masajista.disponible ? "perfil-estado-on" : "perfil-estado-off"}`}>
                    {masajista.disponible ? "● En línea" : "● Ocupada"}
                  </span>
                </div>
                <p className="perfil-ubicacion">📍 Santiago, {masajista.comuna}</p>
                {promedioEstrellas && (
                  <div className="perfil-rating-linea">
                    <Estrellas calificacion={Math.round(promedioEstrellas)} />
                    <span className="perfil-rating-numero">{promedioEstrellas} ({resenas.length})</span>
                  </div>
                )}
              </div>

              <div className="perfil-precio-bloque">
                <div className="perfil-precio-texto">
                  <p className="perfil-precio-valor">$ {masajista.precio?.toLocaleString("es-CL")}</p>
                  <p className="perfil-precio-unidad">/ 1 h</p>
                </div>
                {masajista.whatsapp && (
                  <a href={generarLinkWhatsapp(masajista.whatsapp, masajista.nombre)} target="_blank" rel="noreferrer" className="perfil-wsp-circulo" title="Contactar por WhatsApp" aria-label="Contactar por WhatsApp"><svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="1.8"><path d="M20 12a8 8 0 1 1-3.5-6.6" /><path d="M20 12a8 8 0 0 1-11.5 7.2L4 20l1-4.2A8 8 0 0 1 20 12Z" /><path d="M9 9.5c0 3.5 2.5 5.5 5.5 5.5" /></svg></a>
                )}
              </div>
            </div>

            {servicios.length > 0 && (
              <div className="perfil-pills">
                {servicios.map((s, i) => (
                  <span key={i} className="perfil-pill">{s}</span>
                ))}
              </div>
            )}

            {masajista.promocion_activa && (
              <p className="perfil-promo-linea">🎁 {masajista.promocion_activa}</p>
            )}

            {descripcion && (
              <p className="perfil-descripcion">
                {descripcionVisible}{" "}
                {descripcionLarga && (
                  <button className="perfil-leer-mas" onClick={() => setDescripcionAbierta(!descripcionAbierta)}>
                    {descripcionAbierta ? "Mostrar menos" : "Continuar leyendo"}
                  </button>
                )}
              </p>
            )}
          </div>
        </div>

        <div className="perfil-tabs">
          <button
            className={pestana === "galeria" ? "perfil-tab perfil-tab-activa" : "perfil-tab"}
            onClick={() => setPestana("galeria")}
          >
            Galería
          </button>
          <button
            className={pestana === "comentarios" ? "perfil-tab perfil-tab-activa" : "perfil-tab"}
            onClick={() => setPestana("comentarios")}
          >
            Comentarios {resenas.length > 0 && `(${resenas.length})`}
          </button>
          <button
            className={pestana === "info" ? "perfil-tab perfil-tab-activa" : "perfil-tab"}
            onClick={() => setPestana("info")}
          >
            Info
          </button>
        </div>

        {pestana === "galeria" && (
          <div className="perfil-panel">
            <span className="perfil-contador">▦ Todo ({fotosGaleria.length})</span>
            {fotosGaleria.length === 0 ? (
              <p className="perfil-vacio">Aún no hay fotos en la galería.</p>
            ) : (
              <div className="perfil-galeria-grid">
                {fotosGaleria.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt={`Foto ${i + 1}`}
                    className="perfil-galeria-item"
                    onClick={() => abrirGaleriaDesdeGaleria(i)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {pestana === "comentarios" && (
          <div className="perfil-panel">
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
                <p className="perfil-vacio">Aún no hay reseñas para este perfil.</p>
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
        )}

        {pestana === "info" && (
          <div className="perfil-panel">
            <div className="perfil-info-lista">
              <div className="perfil-info-fila">
                <span className="perfil-info-etiqueta">Ubicación</span>
                <span className="perfil-info-valor">Santiago, {masajista.comuna}</span>
              </div>
              <div className="perfil-info-fila">
                <span className="perfil-info-etiqueta">Disponibilidad</span>
                <span className="perfil-info-valor">{masajista.disponible ? "En línea" : "Ocupada"}</span>
              </div>
              <div className="perfil-info-fila">
                <span className="perfil-info-etiqueta">Valor</span>
                <span className="perfil-info-valor">$ {masajista.precio?.toLocaleString("es-CL")} / 1 h</span>
              </div>
              <div className="perfil-info-fila">
                <span className="perfil-info-etiqueta">Categoría</span>
                <span className="perfil-info-valor">{nombresCategoria[masajista.categoria || "basica"]}</span>
              </div>
              {masajista.promocion_activa && (
                <div className="perfil-info-fila">
                  <span className="perfil-info-etiqueta">Promoción</span>
                  <span className="perfil-info-valor">{masajista.promocion_activa}</span>
                </div>
              )}
              {servicios.length > 0 && (
                <div className="perfil-info-fila perfil-info-fila-columna">
                  <span className="perfil-info-etiqueta">Servicios</span>
                  <div className="perfil-pills">
                    {servicios.map((s, i) => (
                      <span key={i} className="perfil-pill">{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {galeriaAbierta && visorAbierto && (
          <motion.div
            className="visor-imagen-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={cerrarGaleria}
          >
            <button className="modal-cerrar visor-cerrar" onClick={(e) => { e.stopPropagation(); cerrarGaleria() }}>✕</button>

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
