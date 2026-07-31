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

function generarLinkWhatsapp(numero) {
  const soloNumeros = numero.replace(/\D/g, "")
  const mensaje = "Hola! Vi tu perfil en Masso y me gustaria agendar una sesion"
  return "https://wa.me/" + soloNumeros + "?text=" + encodeURIComponent(mensaje)
}

function PerfilPublico() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [masajista, setMasajista] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [galeriaAbierta, setGaleriaAbierta] = useState(null)
  const [galeriaIndice, setGaleriaIndice] = useState(0)

  useEffect(() => {
    cargarMasajista()
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

  const abrirGaleria = (indiceInicial) => {
    const fotos = [
      ...(masajista.foto_perfil ? [masajista.foto_perfil] : []),
      ...(masajista.fotos_local || [])
    ]
    setGaleriaAbierta(fotos)
    setGaleriaIndice(indiceInicial)
  }

  const siguienteFoto = () => {
    setGaleriaIndice(idx => (idx + 1) % galeriaAbierta.length)
  }

  const anteriorFoto = () => {
    setGaleriaIndice(idx => (idx - 1 + galeriaAbierta.length) % galeriaAbierta.length)
  }

  if (cargando) {
    return <div className="perfil-loading">Cargando...</div>
  }

  if (!masajista) {
    return (
      <div className="perfil-loading">
        <p>No se encontró este perfil.</p>
        <button className="btn-volver-perfil" onClick={() => navigate("/")}>← Volver al inicio</button>
      </div>
    )
  }

  return (
    <div className="perfil-publico-page">
      <nav className="perfil-navbar">
        <div className="logo-lineas" onClick={() => navigate("/")}>
          <span className="linea-logo small" />
          <span className="logo-texto small">MASSO</span>
          <span className="linea-logo small" />
        </div>
        <button className="btn-volver-perfil" onClick={() => navigate("/")}>← Volver</button>
      </nav>

      <div className="perfil-hero">
        {masajista.foto_perfil ? (
          <img
            src={masajista.foto_perfil}
            alt={masajista.nombre}
            className="perfil-hero-img"
            onClick={() => abrirGaleria(0)}
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
        </div>
      </div>

      <div className="perfil-contenido">
        <div className="perfil-columna-principal">
          {masajista.promocion_activa && (
            <div className="perfil-promo-box">🔥 {masajista.promocion_activa}</div>
          )}

          {masajista.descripcion && (
            <div className="perfil-seccion">
              <h3 className="perfil-seccion-titulo">Sobre mí</h3>
              <p className="perfil-descripcion-texto">{masajista.descripcion}</p>
            </div>
          )}

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
                    onClick={() => abrirGaleria((masajista.foto_perfil ? 1 : 0) + i)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="perfil-columna-lateral">
          <div className="perfil-card-precio">
            <p className="perfil-precio-numero">$ {masajista.precio?.toLocaleString("es-CL")}</p>
            <p className="perfil-precio-detalle">por sesión de 60 min</p>

            {masajista.whatsapp ? (
              
                href={generarLinkWhatsapp(masajista.whatsapp)}
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
