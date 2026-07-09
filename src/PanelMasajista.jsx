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

  const [form, setForm] = useState({
    nombre: "",
    comuna: "Santiago",
    servicio: "",
    precio: "",
    disponible: true,
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
      })
    } else if (perfilData) {
      setForm(f => ({ ...f, nombre: perfilData.nombre || "" }))
    }

    setCargando(false)
  }

  const manejarCambio = (e) => {
    const { name, value, type, checked } = e.target
    setForm(f => ({ ...f, [name]: type === "checkbox" ? checked : value }))
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
                  <span>{form.nombre.split(" ").map(p => p[0]).join("").slice(0, 2).toUpperCase()}</span>
                  <span className={`badge ${form.disponible ? "badge-on" : "badge-off"}`}>
                    {form.disponible ? "● En línea" : "● Ocupada"}
                  </span>
                </div>
                <div className="preview-body">
                  <h4>{form.nombre || "Tu nombre"}</h4>
                  <p className="preview-comuna">📍 {form.comuna}</p>
                  <p className="preview-servicio">{form.servicio || "Tus servicios"}</p>
                  <p className="preview-precio">
                    $ {form.precio ? parseInt(form.precio).toLocaleString("es-CL") : "0"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default PanelMasajista