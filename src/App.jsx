import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"
import "./App.css"

const masajistas = [
  { id: 1, nombre: "Valentina R.", comuna: "Providencia", disponible: true, servicio: "Relajación · Descontracturante", precio: 45000 },
  { id: 2, nombre: "Camila S.", comuna: "Las Condes", disponible: true, servicio: "Piedras calientes · Relajación", precio: 55000 },
  { id: 3, nombre: "Daniela M.", comuna: "Ñuñoa", disponible: false, servicio: "Descontracturante · Deportivo", precio: 40000 },
  { id: 4, nombre: "Sofía P.", comuna: "Santiago Centro", disponible: true, servicio: "Relajación · Aromática", precio: 38000 },
  { id: 5, nombre: "Isabella T.", comuna: "Vitacura", disponible: true, servicio: "Piedras calientes · Facial", precio: 65000 },
  { id: 6, nombre: "Fernanda L.", comuna: "Maipú", disponible: false, servicio: "Relajación · Deportivo", precio: 35000 },
]

function App() {
  const [entro, setEntro] = useState(false)
  const [comuna, setComuna] = useState("Santiago")

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
                <div className="bloque" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400')" }}>
                  <span>MASAJISTAS</span>
                </div>
                <div className="bloque" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1591343395082-e120087004b4?w=400')" }}>
                  <span>NOVEDADES</span>
                </div>
                <div className="bloque" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1519824145371-296894a0daa9?w=400')" }}>
                  <span>PUBLÍCATE</span>
                </div>
              </div>
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
            <div className="logo-nav">
              <div className="logo-lineas">
                <span className="linea-logo small" />
                <span className="logo-texto small">MASSO</span>
                <span className="linea-logo small" />
              </div>
            </div>
            <div className="nav-links">
              <a href="#">Masajistas</a>
              <a href="#">Ubica tu servicio ideal</a>
              <button className="btn-primary">Registrarse</button>
            </div>
          </nav>

          <section className="seccion-masajistas">
            <motion.div className="seccion-header"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="seccion-tag">Disponibles ahora · {comuna}</span>
              <h2 className="seccion-titulo">Conoce a nuestras <span className="gold italic">masajistas</span></h2>
            </motion.div>

            <div className="cards-grid">
              {masajistas.map((m, i) => (
                <motion.div
                  key={m.id}
                  className="card"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  whileHover={{ y: -6 }}
                >
                  <div className="card-img">
                    <img src={`https://randomuser.me/api/portraits/women/${m.id + 10}.jpg`} alt={m.nombre} />
                    <span className={`badge ${m.disponible ? "badge-on" : "badge-off"}`}>
                      {m.disponible ? "● En línea" : "● Ocupada"}
                    </span>
                  </div>
                  <div className="card-body">
                    <h3 className="card-nombre">{m.nombre}</h3>
                    <p className="card-comuna">📍 {m.comuna}</p>
                    <p className="card-servicio">{m.servicio}</p>
                    <div className="card-footer">
                      <span className="card-precio">$ {m.precio.toLocaleString("es-CL")}</span>
                      <button className="btn-card">Ver perfil</button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        </motion.div>
      )}
    </div>
  )
}

export default App