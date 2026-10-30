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
    if (r.ok) setReservas(r.dados)
    else setMensagem(r.status + ' - ' + r.dados)
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
    setMensagem(r.ok ? 'Reserva criada.' : r.status + ' - ' + r.dados)
    if (r.ok) carregar(filtro)
  }

  async function cancelar(id) {
    const r = await api('DELETE', '/reservas/' + id)
    setMensagem(r.ok ? 'Reserva cancelada.' : r.status + ' - ' + r.dados)
    if (r.ok) carregar(filtro)
  }

  function limpar() {
    setFiltro('')
    carregar('')
  }

  return (
    <>
      <section className="cartao">
        <h2>Nova reserva</h2>
        <form onSubmit={reservar}>
          <label>
            Sala
            <select value={salaEscolhida} onChange={(e) => setSalaId(e.target.value)}>
              {salasAtivas.map((s) => (
                <option key={s.id} value={s.id}>Sala {s.numero_sala}</option>
              ))}
            </select>
          </label>
          <div className="campos">
            <label>Início<input type="datetime-local" value={inicio} onChange={(e) => setInicio(e.target.value)} /></label>
            <label>Fim<input type="datetime-local" value={fim} onChange={(e) => setFim(e.target.value)} /></label>
          </div>
          <button className="botao" type="submit">Reservar</button>
        </form>
        {mensagem && <p className="msg">{mensagem}</p>}
      </section>

      <section className="cartao largo">
        <h2>Reservas</h2>
        <div className="filtro">
          <label>Filtrar por data<input type="date" value={filtro} onChange={(e) => setFiltro(e.target.value)} /></label>
          <button className="botao" onClick={() => carregar(filtro)}>Filtrar</button>
          <button className="botao-sec" onClick={limpar}>Ver todas</button>
        </div>
        {reservas.length === 0 && <p className="vazio">Nenhuma reserva.</p>}
        <ul className="lista">
          {reservas.map((x) => (
            <li className="item" key={x.id}>
              <div>
                <strong>Sala {x.numero_sala}</strong>
                <small>
                  {x.usuario} · {new Date(x.inicio).toLocaleString('pt-BR')} até {new Date(x.fim).toLocaleString('pt-BR')}
                </small>
              </div>
              {(x.usuario_id === usuario.id || usuario.perfil === 'admin') && (
                <button className="botao-sec" onClick={() => cancelar(x.id)}>Cancelar</button>
              )}
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}
