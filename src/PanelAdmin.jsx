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
  const [cargando, setCargando] = useState(true)
  const [filtro, setFiltro] = useState("todas")
  const [busqueda, setBusqueda] = useState("")

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
    cargarMasajistas()
  }

  const cargarMasajistas = async () => {
    const { data } = await supabase
      .from("masajistas")
      .select("*")
      .order("created_at", { ascending: false })

    setMasajistas(data || [])
    setCargando(false)
  }

  const cambiarDisponibilidad = async (id, valorActual) => {
    await supabase
      .from("masajistas")
      .update({ disponible: !valorActual })
      .eq("id", id)
    cargarMasajistas()
  }

  const eliminarMasajista = async (id, nombre) => {
    if (!confirm(`¿Eliminar el perfil de ${nombre}? Esta acción no se puede deshacer.`)) return
    await supabase.from("masajistas").delete().eq("id", id)
    cargarMasajistas()
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
          </div>

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
        </motion.div>
      </div>
    </div>
  )
}

export default PanelAdmin