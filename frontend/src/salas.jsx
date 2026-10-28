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
    if (r.ok) {
      setMensagem('Sala excluída.')
      aoMudar()
    } else {
      setMensagem(r.status + ' - ' + r.dados)
    }
  }

  return (
    <div>
      <h2>Salas</h2>
      {salas.length === 0 && <p>Nenhuma sala cadastrada.</p>}
      <ul>
        {salas.map((s) => (
          <li key={s.id}>
            Sala {s.numero_sala} - capacidade {s.capacidade}
            {s.tipo_sala ? ' - ' + s.tipo_sala : ''}
            {s.recursos ? ' - ' + s.recursos : ''}{' '}
            {admin && <button onClick={() => excluir(s.id)}>Excluir</button>}
          </li>
        ))}
      </ul>

      {admin && (
        <form onSubmit={adicionar}>
          <h3>Adicionar sala</h3>
          <p>Número: <input value={numero} onChange={(e) => setNumero(e.target.value)} /></p>
          <p>Capacidade: <input type="number" min="1" value={capacidade} onChange={(e) => setCapacidade(e.target.value)} /></p>
          <p>Recursos: <input value={recursos} onChange={(e) => setRecursos(e.target.value)} /></p>
          <p>Tipo: <input value={tipo} onChange={(e) => setTipo(e.target.value)} /></p>
          <button type="submit">Adicionar sala</button>
        </form>
      )}

      <p>{mensagem}</p>
    </div>
  )
}