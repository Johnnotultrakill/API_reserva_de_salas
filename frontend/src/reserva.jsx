import { useState, useEffect } from 'react'
import { api } from './api'

export default function Reservas({ usuario, salas }) {
  const [salaId, setSalaId] = useState('')
  const [inicio, setInicio] = useState('')
  const [fim, setFim] = useState('')
  const [filtro, setFiltro] = useState('')
  const [reservas, setReservas] = useState([])
  const [mensagem, setMensagem] = useState('')

  const salasAtivas = salas.filter((s) => s.ativa === 1)
  const salaEscolhida = salaId || (salasAtivas[0] ? String(salasAtivas[0].id) : '')

  async function carregar(dia) {
    const r = await api('GET', '/reservas' + (dia ? '?data=' + dia : ''))
    if (r.ok) {
      setReservas(r.dados)
    } else {
      setMensagem(r.status + ' - ' + r.dados)
    }
  }

  useEffect(() => {
    carregar('')
  }, [])

  async function reservar(evento) {
    evento.preventDefault()
    if (!salaEscolhida || !inicio || !fim) {
      setMensagem('Escolha a sala e preencha início e fim.')
      return
    }
    const r = await api('POST', '/reservas', {
      sala_id: Number(salaEscolhida),
      inicio: new Date(inicio).toISOString(),
      fim: new Date(fim).toISOString()
    })
    if (r.ok) {
      setMensagem('Reserva criada.')
      carregar(filtro)
    } else {
      setMensagem(r.status + ' - ' + r.dados)
    }
  }

  async function cancelar(id) {
    const r = await api('DELETE', '/reservas/' + id)
    if (r.ok) {
      setMensagem('Reserva cancelada.')
      carregar(filtro)
    } else {
      setMensagem(r.status + ' - ' + r.dados)
    }
  }

  function filtrar() {
    carregar(filtro)
  }

  function limpar() {
    setFiltro('')
    carregar('')
  }

  return (
    <div>
      <h2>Reservar</h2>
      <form onSubmit={reservar}>
        <p>
          Sala:{' '}
          <select value={salaEscolhida} onChange={(e) => setSalaId(e.target.value)}>
            {salasAtivas.map((s) => (
              <option key={s.id} value={s.id}>Sala {s.numero_sala}</option>
            ))}
          </select>
        </p>
        <p>Início: <input type="datetime-local" value={inicio} onChange={(e) => setInicio(e.target.value)} /></p>
        <p>Fim: <input type="datetime-local" value={fim} onChange={(e) => setFim(e.target.value)} /></p>
        <button type="submit">Reservar</button>
      </form>

      <h2>Reservas</h2>
      <p>
        Data: <input type="date" value={filtro} onChange={(e) => setFiltro(e.target.value)} />{' '}
        <button onClick={filtrar}>Filtrar</button>{' '}
        <button onClick={limpar}>Ver todas</button>
      </p>
      {reservas.length === 0 && <p>Nenhuma reserva.</p>}
      <ul>
        {reservas.map((x) => (
          <li key={x.id}>
            Sala {x.numero_sala} - {x.usuario} - {new Date(x.inicio).toLocaleString('pt-BR')} até{' '}
            {new Date(x.fim).toLocaleString('pt-BR')}{' '}
            {(x.usuario_id === usuario.id || usuario.perfil === 'admin') && (
              <button onClick={() => cancelar(x.id)}>Cancelar</button>
            )}
          </li>
        ))}
      </ul>

      <p>{mensagem}</p>
    </div>
  )
}