import { useState } from 'react'
import { api } from './api'

export default function Login({ aoEntrar }) {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')

  async function entrar(evento) {
    evento.preventDefault()
    setErro('')
    try {
      const r = await api('POST', '/auth/login', { email, senha })
      if (r.ok) {
        localStorage.setItem('token', r.dados.token)
        aoEntrar()
      } else {
        setErro(r.dados)
      }
    } catch {
      setErro('Falha de conexão: o servidor está rodando?')
    }
  }

  return (
    <form onSubmit={entrar}>
      <h1>Login</h1>
      <p>
        E-mail:{' '}
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </p>
      <p>
        Senha:{' '}
        <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} />
      </p>
      <button type="submit">Entrar</button>
      <p>{erro}</p>
    </form>
  )
}