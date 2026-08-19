import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { supabase } from "./supabaseClient"
import "./Login.css"

function Login() {
  const [modo, setModo] = useState("login")
  const [email, setEmail] = useState("")
  const [confirmarEmail, setConfirmarEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmarPassword, setConfirmarPassword] = useState("")
  const [mostrarPassword, setMostrarPassword] = useState(false)
  const [nombre, setNombre] = useState("")
  const [telefono, setTelefono] = useState("")
  const [rol, setRol] = useState("cliente")
  const [error, setError] = useState("")
  const [cargando, setCargando] = useState(false)
  const [mensaje, setMensaje] = useState("")
  const navigate = useNavigate()

  const manejarLogin = async (e) => {
    e.preventDefault()
    setError("")
    setCargando(true)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError("Correo o contraseña incorrectos")
      setCargando(false)
      return
    }

    const { data: perfil } = await supabase
      .from("perfiles")
      .select("rol, estado_verificacion")
      .eq("user_id", data.user.id)
      .single()

    setCargando(false)

    if (perfil?.rol === "admin") {
      navigate("/admin")
    } else if (perfil?.rol === "masajista") {
      if (perfil.estado_verificacion === "aprobado") {
        navigate("/panel-masajista")
      } else {
        navigate("/verificacion")
      }
    } else {
      navigate("/")
    }
  }

  const manejarRegistro = async (e) => {
    e.preventDefault()
    setError("")

    if (email !== confirmarEmail) {
      setError("Los correos electrónicos no coinciden")
      return
    }

    if (password !== confirmarPassword) {
      setError("Las contraseñas no coinciden")
      return
    }

    setCargando(true)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setCargando(false)
      return
    }

    if (data.user) {
      const { error: errorPerfil } = await supabase.from("perfiles").insert({
        user_id: data.user.id,
        nombre,
        telefono,
        rol,
      })

      if (errorPerfil) {
        setError("Error al crear el perfil: " + errorPerfil.message)
        setCargando(false)
        return
      }
    }

    setCargando(false)
    setMensaje("¡Cuenta creada! Ya puedes iniciar sesión con los datos ingresados.")
  }

  return (
    <div className="login-page">
      <div className="login-overlay" />
      <motion.div
        className="login-box"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="login-logo">
          <div className="logo-lineas">
            <span className="linea-logo" />
            <span className="logo-texto small">MASSO</span>
            <span className="linea-logo" />
          </div>
        </div>

        <div className="login-tabs">
          <button
            className={modo === "login" ? "tab-activo" : ""}
            onClick={() => { setModo("login"); setError(""); setMensaje("") }}
          >
            Iniciar sesión
          </button>
          <button
            className={modo === "registro" ? "tab-activo" : ""}
            onClick={() => { setModo("registro"); setError(""); setMensaje("") }}
          >
            Registrarse
          </button>
        </div>

        {mensaje ? (
          <div className="login-mensaje">{mensaje}</div>
        ) : modo === "login" ? (
          <form onSubmit={manejarLogin} className="login-form">
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div className="password-wrapper">
              <input
                type={mostrarPassword ? "text" : "password"}
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setMostrarPassword(!mostrarPassword)}
              >
                {mostrarPassword ? "Ocultar" : "Ver"}
              </button>
            </div>
            {error && <p className="login-error">{error}</p>}
            <button type="submit" className="btn-primary large full" disabled={cargando}>
              {cargando ? "Ingresando..." : "Ingresar"}
            </button>
          </form>
        ) : (
          <form onSubmit={manejarRegistro} className="login-form">
            <input
              type="text"
              placeholder="Nombre completo"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Confirmar correo electrónico"
              value={confirmarEmail}
              onChange={(e) => setConfirmarEmail(e.target.value)}
              required
            />
            <input
              type="tel"
              placeholder="Teléfono"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              required
            />
            <div className="password-wrapper">
              <input
                type={mostrarPassword ? "text" : "password"}
                placeholder="Contraseña (mín. 6 caracteres)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setMostrarPassword(!mostrarPassword)}
              >
                {mostrarPassword ? "Ocultar" : "Ver"}
              </button>
            </div>
            <input
              type={mostrarPassword ? "text" : "password"}
              placeholder="Confirmar contraseña"
              value={confirmarPassword}
              onChange={(e) => setConfirmarPassword(e.target.value)}
              minLength={6}
              required
            />
            <select value={rol} onChange={(e) => setRol(e.target.value)}>
              <option value="cliente">Soy Cliente</option>
              <option value="masajista">Soy Escort</option>
            </select>
            {error && <p className="login-error">{error}</p>}
            <button type="submit" className="btn-primary large full" disabled={cargando}>
              {cargando ? "Creando cuenta..." : "Crear cuenta"}
            </button>
          </form>
        )}

        <button className="login-volver" onClick={() => navigate("/")}>
          ← Volver al inicio
        </button>
      </motion.div>
    </div>
  )
}

export default Login
