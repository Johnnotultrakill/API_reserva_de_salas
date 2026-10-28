import { useState } from 'react'
import Login from '.login/'

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

  function sair() {
    localStorage.removeItem('token')
    setUsuario(null)
  }

  if (!usuario) {
    return <Login aoEntrar={() => setUsuario(lerToken())} />
  }

  return (
    <div>
      <p>Logado como {usuario.email} ({usuario.perfil})</p>
      <button onClick={sair}>Sair</button>
      {/* aqui entram as salas e reservas na próxima etapa */}
    </div>
  )
}