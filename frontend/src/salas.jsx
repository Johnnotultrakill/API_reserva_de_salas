import { useState } from 'react'
import { api } from './api'

export default function Salas({ usuario, salas, aoMudar }) {
  const [numero, setNumero] = useState('')
  const [capacidade, setCapacidade] = useState('')
  const [recursos, setRecursos] = useState('')
  const [tipo, setTipo] = useState('')
  const [mensagem, setMensagem] = useState('')

  const admin = usuario.perfil === 'admin'

  async function adicionar(evento) {
    evento.preventDefault()
    const r = await api('POST', '/salas', {
      numero_sala: numero,
      capacidade: Number(capacidade),
      recursos,
      tipo_sala: tipo
    })
    if (r.ok) {
      setNumero('')
      setCapacidade('')
      setRecursos('')
      setTipo('')
      setMensagem('Sala adicionada.')
      aoMudar()
    } else {
      setMensagem(r.status + ' - ' + r.dados)
    }
  }

  async function excluir(id) {
    const r = await api('DELETE', '/salas/' + id)
    setMensagem(r.ok ? 'Sala excluída.' : r.status + ' - ' + r.dados)
    if (r.ok) aoMudar()
  }

  return (
    <section className="cartao">
      <h2>Salas</h2>
      {salas.length === 0 && <p className="vazio">Nenhuma sala cadastrada.</p>}
      <ul className="lista">
        {salas.map((s) => (
          <li className="item" key={s.id}>
            <div>
              <strong>Sala {s.numero_sala}</strong>
              <small>
                Capacidade {s.capacidade}
                {s.tipo_sala ? ' · ' + s.tipo_sala : ''}
                {s.recursos ? ' · ' + s.recursos : ''}
              </small>
            </div>
            {admin && <button className="botao-sec" onClick={() => excluir(s.id)}>Excluir</button>}
          </li>
        ))}
      </ul>

      {admin && (
        <form onSubmit={adicionar}>
          <h3>Adicionar sala</h3>
          <div className="campos">
            <label>Número<input value={numero} onChange={(e) => setNumero(e.target.value)} /></label>
            <label>Capacidade<input type="number" min="1" value={capacidade} onChange={(e) => setCapacidade(e.target.value)} /></label>
            <label>Recursos<input value={recursos} onChange={(e) => setRecursos(e.target.value)} /></label>
            <label>Tipo<input value={tipo} onChange={(e) => setTipo(e.target.value)} /></label>
          </div>
          <button className="botao" type="submit">Adicionar sala</button>
        </form>
      )}

      {mensagem && <p className="msg">{mensagem}</p>}
    </section>
  )
}
