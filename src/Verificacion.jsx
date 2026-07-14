import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { supabase } from "./supabaseClient"
import "./Verificacion.css"

function Verificacion() {
  const navigate = useNavigate()
  const [usuario, setUsuario] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [subiendoDoc, setSubiendoDoc] = useState(false)
  const [subiendoVideo, setSubiendoVideo] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState("")

  const [documentoUrl, setDocumentoUrl] = useState("")
  const [videoUrl, setVideoUrl] = useState("")

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      navigate("/login")
      return
    }

    setUsuario(user)

    const { data: perfilData } = await supabase
      .from("perfiles")
      .select("*")
      .eq("user_id", user.id)
      .single()

    if (perfilData?.rol !== "masajista") {
      navigate("/")
      return
    }

    if (perfilData?.estado_verificacion === "aprobado") {
      navigate("/panel-masajista")
      return
    }

    setPerfil(perfilData)
    setDocumentoUrl(perfilData?.documento_identidad || "")
    setVideoUrl(perfilData?.video_local || "")
    setCargando(false)
  }

  const subirArchivo = async (file, tipo) => {
    const nombreArchivo = `${usuario.id}/${tipo}-${Date.now()}-${file.name}`
    const { error } = await supabase.storage
      .from("documentos-verificacion")
      .upload(nombreArchivo, file)

    if (error) throw error

    const { data } = supabase.storage
      .from("documentos-verificacion")
      .getPublicUrl(nombreArchivo)

    return data.publicUrl
  }

  const manejarDocumento = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setSubiendoDoc(true)
    try {
      const url = await subirArchivo(file, "cedula")
      setDocumentoUrl(url)
    } catch (err) {
      alert("Error al subir el documento: " + err.message)
    }
    setSubiendoDoc(false)
  }

  const manejarVideo = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    if (file.size > 50 * 1024 * 1024) {
      alert("El video no debe superar los 50 MB. Comprímelo antes de subirlo.")
      return
    }

    setSubiendoVideo(true)
    try {
      const url = await subirArchivo(file, "video-local")
      setVideoUrl(url)
    } catch (err) {
      alert("Error al subir el video: " + err.message)
    }
    setSubiendoVideo(false)
  }

  const enviarVerificacion = async (e) => {
    e.preventDefault()

    if (!documentoUrl || !videoUrl) {
      setMensaje("Debes subir ambos: tu documento de identidad y el video del local.")
      return
    }

    setGuardando(true)
    setMensaje("")

    const { error } = await supabase
      .from("perfiles")
      .update({
        documento_identidad: documentoUrl,
        video_local: videoUrl,
        estado_verificacion: "en_revision",
      })
      .eq("user_id", usuario.id)

    setGuardando(false)

    if (error) {
      setMensaje("Error al enviar: " + error.message)
    } else {
      setPerfil(p => ({ ...p, estado_verificacion: "en_revision" }))
    }
  }

  const cerrarSesion = async () => {
    await supabase.auth.signOut()
    navigate("/login")
  }

  if (cargando) {
    return <div className="verif-loading">Cargando...</div>
  }

  const enRevision = perfil?.estado_verificacion === "en_revision"
  const rechazado = perfil?.estado_verificacion === "rechazado"

  return (
    <div className="verif-page">
      <div className="verif-overlay" />
      <motion.div
        className="verif-box"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="logo-lineas verif-logo">
          <span className="linea-logo small" />
          <span className="logo-texto small">MASSO</span>
          <span className="linea-logo small" />
        </div>

        {enRevision ? (
          <div className="verif-estado">
            <span className="verif-icono">⏳</span>
            <h2>Tu solicitud está en revisión</h2>
            <p>Estamos verificando tus documentos. Te avisaremos por correo cuando tu cuenta esté aprobada, normalmente en menos de 48 horas.</p>
            <button className="btn-salir-verif" onClick={cerrarSesion}>Cerrar sesión</button>
          </div>
        ) : (
          <>
            <h2 className="verif-titulo-dorado">Verifica tu cuenta</h2>
            <p className="verif-sub">
              {rechazado
                ? "Tu solicitud anterior fue rechazada. Revisa la información y vuelve a enviarla."
                : "Antes de publicarte en Masso, necesitamos verificar tu identidad y tu lugar de trabajo."}
            </p>

            {rechazado && (
              <div className="verif-rechazado">
                Tu solicitud fue rechazada. Verifica que tus documentos sean claros y correspondan al local donde atenderás.
              </div>
            )}

            <form onSubmit={enviarVerificacion} className="verif-form">
              <div className="verif-campo">
                <label>Documento de identidad (foto o escaneo)</label>
                <p className="verif-desc">Debe verse claramente tu nombre, foto y RUT.</p>
                {documentoUrl && <p className="verif-archivo-ok">✓ Documento cargado</p>}
                <label className="btn-upload-verif">
                  {subiendoDoc ? "Subiendo..." : documentoUrl ? "Cambiar documento" : "Subir documento"}
                  <input type="file" accept="image/*,.pdf" onChange={manejarDocumento} hidden disabled={subiendoDoc} />
                </label>
              </div>

              <div className="verif-campo">
                <label>Video del local</label>
                <p className="verif-desc">Un video corto mostrando el espacio donde atenderás a tus clientes.</p>
                {videoUrl && <p className="verif-archivo-ok">✓ Video cargado</p>}
                <label className="btn-upload-verif">
                  {subiendoVideo ? "Subiendo..." : videoUrl ? "Cambiar video" : "Subir video"}
                  <input type="file" accept="video/*" onChange={manejarVideo} hidden disabled={subiendoVideo} />
                </label>
              </div>

              {mensaje && <p className="verif-error">{mensaje}</p>}

              <button type="submit" className="btn-primary large full" disabled={guardando}>
                {guardando ? "Enviando..." : "Enviar para revisión"}
              </button>
            </form>

            <button className="verif-volver" onClick={cerrarSesion}>← Cerrar sesión</button>
          </>
        )}
      </motion.div>
    </div>
  )
}

export default Verificacion