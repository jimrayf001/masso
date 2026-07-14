import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { supabase } from "./supabaseClient"
import "./PanelAdmin.css"

function iniciales(nombre) {
  return nombre
    .split(" ")
    .map(p => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

function PanelAdmin() {
  const navigate = useNavigate()
  const [perfil, setPerfil] = useState(null)
  const [masajistas, setMasajistas] = useState([])
  const [pendientes, setPendientes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [filtro, setFiltro] = useState("todas")
  const [busqueda, setBusqueda] = useState("")
  const [vista, setVista] = useState("verificaciones")
  const [cargandoDoc, setCargandoDoc] = useState(null)

  useEffect(() => {
    verificarAcceso()
  }, [])

  const verificarAcceso = async () => {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      navigate("/login")
      return
    }

    const { data: perfilData } = await supabase
      .from("perfiles")
      .select("*")
      .eq("user_id", user.id)
      .single()

    if (perfilData?.rol !== "admin") {
      navigate("/")
      return
    }

    setPerfil(perfilData)
    cargarTodo()
  }

  const cargarTodo = async () => {
    const { data: masajistasData } = await supabase
      .from("masajistas")
      .select("*")
      .order("created_at", { ascending: false })

    const { data: pendientesData } = await supabase
      .from("perfiles")
      .select("*")
      .eq("rol", "masajista")
      .in("estado_verificacion", ["pendiente", "en_revision", "rechazado"])
      .order("created_at", { ascending: false })

    setMasajistas(masajistasData || [])
    setPendientes(pendientesData || [])
    setCargando(false)
  }

const extraerRutaArchivo = (url) => {
    const partes = url.split("/documentos-verificacion/")
    return partes[1] ? decodeURIComponent(partes[1]) : null
  }

  const abrirDocumento = async (url, tipo) => {
    setCargandoDoc(url)
    const ruta = extraerRutaArchivo(url)

    if (!ruta) {
      alert("No se pudo procesar el enlace del archivo.")
      setCargandoDoc(null)
      return
    }

    const { data, error } = await supabase.storage
      .from("documentos-verificacion")
      .createSignedUrl(ruta, 300)

    setCargandoDoc(null)

    if (error) {
      alert("Error al abrir el archivo: " + error.message)
      return
    }

    window.open(data.signedUrl, "_blank")
  }

  const aprobarSolicitud = async (user_id) => {
    await supabase
      .from("perfiles")
      .update({ estado_verificacion: "aprobado" })
      .eq("user_id", user_id)
    cargarTodo()
  }

  const rechazarSolicitud = async (user_id) => {
    if (!confirm("¿Rechazar esta solicitud? La persona deberá volver a enviar sus documentos.")) return
    await supabase
      .from("perfiles")
      .update({ estado_verificacion: "rechazado" })
      .eq("user_id", user_id)
    cargarTodo()
  }

  const cambiarDisponibilidad = async (id, valorActual) => {
    await supabase
      .from("masajistas")
      .update({ disponible: !valorActual })
      .eq("id", id)
    cargarTodo()
  }

  const eliminarMasajista = async (id, nombre) => {
    if (!confirm(`¿Eliminar el perfil de ${nombre}? Esta acción no se puede deshacer.`)) return
    await supabase.from("masajistas").delete().eq("id", id)
    cargarTodo()
  }

  const cerrarSesion = async () => {
    await supabase.auth.signOut()
    navigate("/login")
  }

  const masajistasFiltradas = masajistas.filter(m => {
    const coincideBusqueda = m.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
                              m.comuna?.toLowerCase().includes(busqueda.toLowerCase())
    if (filtro === "en-linea") return coincideBusqueda && m.disponible
    if (filtro === "ocupadas") return coincideBusqueda && !m.disponible
    return coincideBusqueda
  })

  const stats = {
    total: masajistas.length,
    enLinea: masajistas.filter(m => m.disponible).length,
    ocupadas: masajistas.filter(m => !m.disponible).length,
    pendientes: pendientes.filter(p => p.estado_verificacion === "en_revision" || p.estado_verificacion === "pendiente").length,
  }

  const etiquetaEstado = (estado) => {
    if (estado === "pendiente") return { texto: "Sin enviar", clase: "estado-pendiente" }
    if (estado === "en_revision") return { texto: "En revisión", clase: "estado-revision" }
    if (estado === "rechazado") return { texto: "Rechazado", clase: "estado-rechazado" }
    return { texto: estado, clase: "" }
  }

  if (cargando) {
    return <div className="admin-loading">Cargando...</div>
  }

  return (
    <div className="admin-page">
      <nav className="admin-navbar">
        <div className="logo-lineas">
          <span className="linea-logo small" />
          <span className="logo-texto small">MASSO</span>
          <span className="linea-logo small" />
        </div>
        <div className="admin-nav-right">
          <span className="admin-badge-rol">Administrador</span>
          <span className="admin-nombre">{perfil?.nombre}</span>
          <button className="btn-salir" onClick={cerrarSesion}>Cerrar sesión</button>
        </div>
      </nav>

      <div className="admin-content">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="admin-titulo">
            Panel de <span className="gold italic">administración</span>
          </h1>
          <p className="admin-sub">Gestiona todas las masajistas de la plataforma</p>

          <div className="admin-stats">
            <div className="stat-card">
              <span className="stat-numero">{stats.total}</span>
              <span className="stat-label">Total masajistas</span>
            </div>
            <div className="stat-card">
              <span className="stat-numero stat-verde">{stats.enLinea}</span>
              <span className="stat-label">En línea</span>
            </div>
            <div className="stat-card">
              <span className="stat-numero stat-gris">{stats.ocupadas}</span>
              <span className="stat-label">Ocupadas</span>
            </div>
            <div className="stat-card">
              <span className="stat-numero stat-amarillo">{stats.pendientes}</span>
              <span className="stat-label">Por verificar</span>
            </div>
          </div>

          <div className="admin-tabs-vista">
            <button
              className={vista === "verificaciones" ? "tab-vista-activo" : ""}
              onClick={() => setVista("verificaciones")}
            >
              Solicitudes de verificación {pendientes.length > 0 && `(${pendientes.length})`}
            </button>
            <button
              className={vista === "masajistas" ? "tab-vista-activo" : ""}
              onClick={() => setVista("masajistas")}
            >
              Masajistas activas
            </button>
          </div>

          {vista === "verificaciones" && (
            <div>
              {pendientes.length === 0 ? (
                <p className="admin-vacio">No hay solicitudes de verificación pendientes.</p>
              ) : (
                <div className="verif-lista">
                  {pendientes.map((p) => {
                    const estado = etiquetaEstado(p.estado_verificacion)
                    return (
                      <div key={p.user_id} className="verif-item">
                        <div className="verif-item-info">
                          <div className="tabla-avatar">{iniciales(p.nombre || "?")}</div>
                          <div>
                            <p className="verif-item-nombre">{p.nombre}</p>
                            <p className="verif-item-tel">{p.telefono}</p>
                          </div>
                          <span className={`estado-pill ${estado.clase}`}>{estado.texto}</span>
                        </div>

                        <div className="verif-item-docs">
                          {p.documento_identidad ? (
                            <button
                              className="link-doc"
                              onClick={() => abrirDocumento(p.documento_identidad, "documento")}
                              disabled={cargandoDoc === p.documento_identidad}
                            >
                              {cargandoDoc === p.documento_identidad ? "Abriendo..." : "Ver documento"}
                            </button>
                          ) : (
                            <span className="link-doc-vacio">Sin documento</span>
                          )}
                          {p.video_local ? (
                            <button
                              className="link-doc"
                              onClick={() => abrirDocumento(p.video_local, "video")}
                              disabled={cargandoDoc === p.video_local}
                            >
                              {cargandoDoc === p.video_local ? "Abriendo..." : "Ver video"}
                            </button>
                          ) : (
                            <span className="link-doc-vacio">Sin video</span>
                          )}
                        </div>

                        {p.estado_verificacion === "en_revision" && (
                          <div className="verif-item-acciones">
                            <button className="btn-aprobar" onClick={() => aprobarSolicitud(p.user_id)}>
                              Aprobar
                            </button>
                            <button className="btn-rechazar" onClick={() => rechazarSolicitud(p.user_id)}>
                              Rechazar
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {vista === "masajistas" && (
            <div>
              <div className="admin-controles">
                <input
                  type="text"
                  className="admin-buscar"
                  placeholder="Buscar por nombre o comuna..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                />
                <div className="admin-filtros">
                  <button
                    className={filtro === "todas" ? "filtro-activo" : ""}
                    onClick={() => setFiltro("todas")}
                  >
                    Todas
                  </button>
                  <button
                    className={filtro === "en-linea" ? "filtro-activo" : ""}
                    onClick={() => setFiltro("en-linea")}
                  >
                    En línea
                  </button>
                  <button
                    className={filtro === "ocupadas" ? "filtro-activo" : ""}
                    onClick={() => setFiltro("ocupadas")}
                  >
                    Ocupadas
                  </button>
                </div>
              </div>

              {masajistasFiltradas.length === 0 ? (
                <p className="admin-vacio">No hay masajistas que coincidan con la búsqueda.</p>
              ) : (
                <div className="admin-tabla-wrapper">
                  <table className="admin-tabla">
                    <thead>
                      <tr>
                        <th></th>
                        <th>Nombre</th>
                        <th>Comuna</th>
                        <th>Servicio</th>
                        <th>Precio</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {masajistasFiltradas.map((m) => (
                        <tr key={m.id}>
                          <td>
                            <div className="tabla-avatar">{iniciales(m.nombre)}</div>
                          </td>
                          <td>{m.nombre}</td>
                          <td>{m.comuna}</td>
                          <td className="tabla-servicio">{m.servicio}</td>
                          <td>$ {m.precio?.toLocaleString("es-CL")}</td>
                          <td>
                            <button
                              className={`estado-toggle ${m.disponible ? "estado-on" : "estado-off"}`}
                              onClick={() => cambiarDisponibilidad(m.id, m.disponible)}
                            >
                              {m.disponible ? "● En línea" : "● Ocupada"}
                            </button>
                          </td>
                          <td>
                            <button
                              className="btn-eliminar"
                              onClick={() => eliminarMasajista(m.id, m.nombre)}
                            >
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default PanelAdmin