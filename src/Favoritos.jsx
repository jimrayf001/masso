import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { supabase } from "./supabaseClient"
import "./Favoritos.css"

function iniciales(nombre) {
  return nombre
    .split(" ")
    .map(p => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

function Favoritos() {
  const navigate = useNavigate()
  const [usuario, setUsuario] = useState(null)
  const [favoritos, setFavoritos] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    cargarFavoritos()
  }, [])

  const cargarFavoritos = async () => {
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      navigate("/login")
      return
    }

    setUsuario(user)

    const { data } = await supabase
      .from("favoritos")
      .select("masajista_id, masajistas(*)")
      .eq("cliente_id", user.id)
      .order("created_at", { ascending: false })

    const lista = (data || [])
      .map(f => f.masajistas)
      .filter(Boolean)

    setFavoritos(lista)
    setCargando(false)
  }

  const quitarFavorito = async (e, masajistaId) => {
    e.stopPropagation()

    const { error } = await supabase
      .from("favoritos")
      .delete()
      .eq("cliente_id", usuario.id)
      .eq("masajista_id", masajistaId)

    if (!error) {
      setFavoritos(lista => lista.filter(m => m.id !== masajistaId))
    }
  }

  if (cargando) {
    return <div className="fav-loading">Cargando...</div>
  }

  return (
    <div className="fav-page">
      <nav className="fav-navbar">
        <img
          src="/logo-masso.png"
          alt="Masso"
          className="logo-imagen-nav"
          style={{ cursor: "pointer" }}
          onClick={() => navigate("/?entrar=true")}
        />
        <button className="fav-btn-volver" onClick={() => navigate("/?entrar=true")}>← Volver</button>
      </nav>

      <div className="fav-contenido">
        <h1 className="fav-titulo">♡ Mis favoritos</h1>
        <p className="fav-sub">
          {favoritos.length === 0
            ? "Aún no has guardado ninguna ficha."
            : `Tienes ${favoritos.length} ${favoritos.length === 1 ? "ficha guardada" : "fichas guardadas"}.`}
        </p>

        {favoritos.length === 0 ? (
          <div className="fav-vacio">
            <p>Toca el corazón en la ficha de una masajista para guardarla aquí.</p>
            <button className="btn-primary" onClick={() => navigate("/?entrar=true")}>Explorar fichas</button>
          </div>
        ) : (
          <div className="cards-grid">
            {favoritos.map((m, i) => (
              <motion.div
                key={m.id}
                className={`card card-poster ${m.disponible ? "neon-verde" : "neon-rojo"}`}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.35, ease: "easeOut", delay: (i % 2) * 0.06 }}
                whileHover={{ y: -6 }}
                onClick={() => navigate(`/perfil/${m.id}`)}
              >
                {m.foto_perfil ? (
                  <img src={m.foto_perfil} alt={m.nombre} className="card-poster-img" />
                ) : (
                  <div className="avatar-placeholder card-poster-img">
                    <span>{iniciales(m.nombre)}</span>
                  </div>
                )}

                <div className="card-poster-overlay" />

                <button
                  className="fav-quitar"
                  onClick={(e) => quitarFavorito(e, m.id)}
                  title="Quitar de favoritos"
                  aria-label="Quitar de favoritos"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21l7.8-7.5 1-1.1a5.5 5.5 0 0 0 0-7.8z" /></svg>
                </button>

                <div className="card-poster-info">
                  <h3 className="card-poster-nombre">{m.nombre}</h3>
                  <p className="card-poster-comuna">📍 {m.comuna}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Favoritos
