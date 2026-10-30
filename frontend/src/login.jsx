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
        setErro(String(r.dados))
      }
    } catch {
      setErro('Falha de conexão: o servidor está rodando?')
    }
  }

  return (
    <div className="login-fundo">
      <form className="login-cartao" onSubmit={entrar}>
        <div className="login-topo">
          <h1>Reserva de Salas</h1>
          <p>Entre para continuar</p>
        </div>
        <div className="login-corpo">
          <label>
            E-mail
            <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label>
            Senha
            <input type="password" autoComplete="current-password" value={senha} onChange={(e) => setSenha(e.target.value)} />
          </label>
          <button className="botao" type="submit">Entrar</button>
          {erro && <p className="msg">{erro}</p>}
        </div>
      </form>
    </div>
  )
}
