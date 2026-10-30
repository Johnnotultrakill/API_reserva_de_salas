import { useState, useEffect } from 'react'
import { api } from './api'
import Login from './Login'
import Salas from './Salas'
import Reservas from './Reservas'

function lerToken() {
  const token = localStorage.getItem('token')
  if (!token) return null
  try {
    const parte = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(parte))
  } catch {
    return null
  }
}

export default function App() {
  const [usuario, setUsuario] = useState(lerToken())
  const [salas, setSalas] = useState([])

  async function carregarSalas() {
    const r = await api('GET', '/salas')
    if (r.ok) setSalas(r.dados)
  }

  useEffect(() => {
    if (usuario) carregarSalas()
  }, [usuario])

  function sair() {
    localStorage.removeItem('token')
    setUsuario(null)
  }

  if (!usuario) {
    return <Login aoEntrar={() => setUsuario(lerToken())} />
  }

  return (
    <div>
      <header className="topo">
        <span className="marca">Reserva de Salas</span>
        <div className="usuario">
          <span>{usuario.email}</span>
          <span className="selo">{usuario.perfil}</span>
          <button className="botao-sec" onClick={sair}>Sair</button>
        </div>
      </header>

      <main className="pagina">
        <Salas usuario={usuario} salas={salas} aoMudar={carregarSalas} />
        <Reservas usuario={usuario} salas={salas} />
      </main>
    </div>
  )
}
