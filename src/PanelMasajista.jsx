import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { supabase } from "./supabaseClient"
import "./PanelMasajista.css"

function PanelMasajista() {
  const navigate = useNavigate()
  const [usuario, setUsuario] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [masajista, setMasajista] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState("")
  const [subiendoFoto, setSubiendoFoto] = useState(false)
  const [subiendoLocal, setSubiendoLocal] = useState(false)
  const [subiendoHistoria, setSubiendoHistoria] = useState(false)
  const [tienePromo, setTienePromo] = useState(false)

  const [form, setForm] = useState({
    nombre: "",
    comuna: "Santiago",
    servicio: "",
    precio: "",
    disponible: true,
    foto_perfil: "",
    foto_historia: [],
    fotos_local: [],
    promocion_activa: "",
  })

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

    if (!perfilData || perfilData.estado_verificacion !== "aprobado") {
      navigate("/verificacion")
      return
    }

    setPerfil(perfilData)

    const { data: masajistaData } = await supabase
      .from("masajistas")
      .select("*")
      .eq("user_id", user.id)
      .single()

    if (masajistaData) {
      setMasajista(masajistaData)
      setForm({
        nombre: masajistaData.nombre || "",
        comuna: masajistaData.comuna || "Santiago",
        servicio: masajistaData.servicio || "",
        precio: masajistaData.precio || "",
        disponible: masajistaData.disponible,
        foto_perfil: masajistaData.foto_perfil || "",
        foto_historia: masajistaData.foto_historia || [],
        fotos_local: masajistaData.fotos_local || [],
        promocion_activa: masajistaData.promocion_activa || "",
      })
      setTienePromo(!!masajistaData.promocion_activa)
    } else if (perfilData) {
      setForm(f => ({ ...f, nombre: perfilData.nombre || "" }))
    }

    setCargando(false)
  }

  const manejarCambio = (e) => {
    const { name, value, type, checked } = e.target
    setForm(f => ({ ...f, [name]: type === "checkbox" ? checked : value }))
  }

  const subirArchivo = async (file, carpeta) => {
    const nombreArchivo = `${usuario.id}/${carpeta}/${Date.now()}-${file.name}`
    const { error } = await supabase.storage
      .from("fotos-masajistas")
      .upload(nombreArchivo, file)

    if (error) throw error

    const { data } = supabase.storage
      .from("fotos-masajistas")
      .getPublicUrl(nombreArchivo)

    return data.publicUrl
  }

  const manejarFotoPerfil = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setSubiendoFoto(true)
    try {
      const url = await subirArchivo(file, "perfil")
      setForm(f => ({ ...f, foto_perfil: url }))
    } catch (err) {
      alert("Error al subir la foto: " + err.message)
    }
    setSubiendoFoto(false)
  }

  const manejarFotosHistoria = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    if (form.foto_historia.length + files.length > 3) {
      alert("Máximo 3 imágenes de historia. Elimina alguna antes de subir más.")
      return
    }

    setSubiendoHistoria(true)
    try {
      const nuevasUrls = []
      for (const file of files) {
        const url = await subirArchivo(file, "historia")
        nuevasUrls.push(url)
      }
      setForm(f => ({ ...f, foto_historia: [...f.foto_historia, ...nuevasUrls] }))
    } catch (err) {
      alert("Error al subir imágenes: " + err.message)
    }
    setSubiendoHistoria(false)
  }

  const quitarFotoHistoria = (index) => {
    setForm(f => ({
      ...f,
      foto_historia: f.foto_historia.filter((_, i) => i !== index)
    }))
  }

  const manejarFotosLocal = async (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    if (form.fotos_local.length + files.length > 10) {
      alert("Máximo 10 fotos del local. Elimina alguna antes de subir más.")
      return
    }

    setSubiendoLocal(true)
    try {
      const nuevasUrls = []
      for (const file of files) {
        const url = await subirArchivo(file, "local")
        nuevasUrls.push(url)
      }
      setForm(f => ({ ...f, fotos_local: [...f.fotos_local, ...nuevasUrls] }))
    } catch (err) {
      alert("Error al subir fotos: " + err.message)
    }
    setSubiendoLocal(false)
  }

  const quitarFotoLocal = (index) => {
    setForm(f => ({
      ...f,
      fotos_local: f.fotos_local.filter((_, i) => i !== index)
    }))
  }

  const guardarPerfil = async (e) => {
    e.preventDefault()
    setGuardando(true)
    setMensaje("")

    const datos = {
      user_id: usuario.id,
      nombre: form.nombre,
      comuna: form.comuna,
      servicio: form.servicio,
      precio: parseInt(form.precio),
      disponible: form.disponible,
      foto_perfil: form.foto_perfil,
      foto_historia: form.foto_historia,
      fotos_local: form.fotos_local,
      promocion_activa: tienePromo ? form.promocion_activa : null,
    }

    let error
    if (masajista) {
      const res = await supabase.from("masajistas").update(datos).eq("user_id", usuario.id)
      error = res.error
    } else {
      const res = await supabase.from("masajistas").insert(datos)
      error = res.error
    }

    setGuardando(false)

    if (error) {
      setMensaje("Error al guardar: " + error.message)
    } else {
      setMensaje("¡Perfil guardado correctamente!")
      cargarDatos()
    }
  }

  const cerrarSesion = async () => {
    await supabase.auth.signOut()
    navigate("/login")
  }

  if (cargando) {
    return (
      <div className="panel-loading">
        <p>Cargando...</p>
      </div>
    )
  }

  return (
    <div className="panel-page">
      <nav className="panel-navbar">
        <div className="logo-lineas">
          <span className="linea-logo small" />
          <span className="logo-texto small">MASSO</span>
          <span className="linea-logo small" />
        </div>
        <div className="panel-nav-right">
          <span className="panel-nombre">{perfil?.nombre}</span>
          <button className="btn-salir" onClick={cerrarSesion}>Cerrar sesión</button>
        </div>
      </nav>

      <div className="panel-content">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="panel-titulo">
            Mi <span className="gold italic">perfil</span>
          </h1>
          <p className="panel-sub">
            {masajista ? "Edita la información que ven los clientes" : "Completa tu perfil para empezar a recibir clientes"}
          </p>

          <div className="panel-grid">
            <div className="panel-card">
              <h3 className="panel-card-titulo">Información pública</h3>

              <form onSubmit={guardarPerfil} className="panel-form">
                <label>Foto de perfil</label>
                <div className="upload-foto-perfil">
                  {form.foto_perfil && (
                    <img src={form.foto_perfil} alt="Perfil" className="preview-foto-perfil" />
                  )}
                  <label className="btn-upload">
                    {subiendoFoto ? "Subiendo..." : form.foto_perfil ? "Cambiar foto" : "Subir foto"}
                    <input type="file" accept="image/*" onChange={manejarFotoPerfil} hidden disabled={subiendoFoto} />
                  </label>
                </div>

                <label>Nombre a mostrar</label>
                <input
                  type="text"
                  name="nombre"
                  value={form.nombre}
                  onChange={manejarCambio}
                  placeholder="Ej: Valentina R."
                  required
                />

                <label>Comuna donde atiendes</label>
                <select name="comuna" value={form.comuna} onChange={manejarCambio}>
                  <option>Santiago</option>
                  <option>Providencia</option>
                  <option>Las Condes</option>
                  <option>Ñuñoa</option>
                  <option>Vitacura</option>
                  <option>Maipú</option>
                  <option>La Florida</option>
                </select>

                <label>Servicios que ofreces</label>
                <input
                  type="text"
                  name="servicio"
                  value={form.servicio}
                  onChange={manejarCambio}
                  placeholder="Ej: Relajación · Descontracturante"
                  required
                />

                <label>Precio por sesión (CLP)</label>
                <input
                  type="number"
                  name="precio"
                  value={form.precio}
                  onChange={manejarCambio}
                  placeholder="Ej: 45000"
                  required
                />

                <div className="panel-switch">
                  <label className="switch-label">
                    <input
                      type="checkbox"
                      name="disponible"
                      checked={form.disponible}
                      onChange={manejarCambio}
                    />
                    <span className="switch-slider"></span>
                    Disponible ahora (visible como "En línea")
                  </label>
                </div>

                <div className="panel-switch">
                  <label className="switch-label">
                    <input
                      type="checkbox"
                      checked={tienePromo}
                      onChange={(e) => setTienePromo(e.target.checked)}
                    />
                    <span className="switch-slider"></span>
                    Tengo una promoción activa
                  </label>
                </div>

                {tienePromo && (
                  <>
                    <label>Describe tu promoción</label>
                    <input
                      type="text"
                      name="promocion_activa"
                      value={form.promocion_activa}
                      onChange={manejarCambio}
                      placeholder="Ej: 20% dcto esta semana"
                      maxLength={60}
                    />
                  </>
                )}

                {mensaje && (
                  <p className={mensaje.includes("Error") ? "panel-error" : "panel-exito"}>
                    {mensaje}
                  </p>
                )}

                <button type="submit" className="btn-primary large full" disabled={guardando}>
                  {guardando ? "Guardando..." : "Guardar cambios"}
                </button>
              </form>
            </div>

            <div className="panel-card panel-preview">
              <h3 className="panel-card-titulo">Así te ven los clientes</h3>
              <div className="preview-card">
                <div className="preview-img">
                  {form.foto_perfil ? (
                    <img src={form.foto_perfil} alt="preview" className="preview-img-real" />
                  ) : (
                    <span>{form.nombre.split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase()}</span>
                  )}
                  <span className={`badge ${form.disponible ? "badge-on" : "badge-off"}`}>
                    {form.disponible ? "● En línea" : "● Ocupada"}
                  </span>
                  {tienePromo && form.promocion_activa && (
                    <span className="badge-promo">🔥 Promo</span>
                  )}
                </div>
                <div className="preview-body">
                  <h4>{form.nombre || "Tu nombre"}</h4>
                  <p className="preview-comuna">📍 {form.comuna}</p>
                  <p className="preview-servicio">{form.servicio || "Tus servicios"}</p>
                  <p className="preview-precio">
                    $ {form.precio ? parseInt(form.precio).toLocaleString("es-CL") : "0"}
                  </p>
                  {tienePromo && form.promocion_activa && (
                    <p className="preview-promo-texto">{form.promocion_activa}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="panel-card panel-card-full">
            <h3 className="panel-card-titulo">Imágenes para historias ({form.foto_historia.length}/3)</h3>
            <p className="panel-card-desc">Estas imágenes aparecen cuando alguien hace clic en tu círculo en el carrusel de historias. Puedes subir hasta 3.</p>

            <div className="fotos-historia-grid">
              {form.foto_historia.map((url, i) => (
                <div key={i} className="foto-historia-item">
                  <img src={url} alt={`Historia ${i + 1}`} />
                  <button type="button" className="btn-quitar-foto" onClick={() => quitarFotoHistoria(i)}>✕</button>
                </div>
              ))}
            </div>

            {form.foto_historia.length < 3 && (
              <label className="btn-upload">
                {subiendoHistoria ? "Subiendo..." : "Agregar imagen de historia"}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={manejarFotosHistoria}
                  hidden
                  disabled={subiendoHistoria}
                />
              </label>
            )}
          </div>

          <div className="panel-card panel-card-full">
            <h3 className="panel-card-titulo">Fotos del local ({form.fotos_local.length}/10)</h3>
            <p className="panel-card-desc">Muestra el espacio donde atiendes para dar más confianza a tus clientes.</p>

            <div className="fotos-local-grid">
              {form.fotos_local.map((url, i) => (
                <div key={i} className="foto-local-item">
                  <img src={url} alt={`Local ${i + 1}`} />
                  <button type="button" className="btn-quitar-foto" onClick={() => quitarFotoLocal(i)}>✕</button>
                </div>
              ))}
            </div>

            {form.fotos_local.length < 10 && (
              <label className="btn-upload">
                {subiendoLocal ? "Subiendo..." : "Agregar fotos del local"}
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={manejarFotosLocal}
                  hidden
                  disabled={subiendoLocal}
                />
              </label>
            )}

            <p className="panel-nota">Recuerda hacer clic en "Guardar cambios" arriba después de subir tus fotos.</p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default PanelMasajista
