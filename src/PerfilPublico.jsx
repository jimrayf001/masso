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
