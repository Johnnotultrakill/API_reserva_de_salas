export async function api(metodo, url, corpo) {
  const token = localStorage.getItem('token')
  const opcoes = { method: metodo, headers: {} }

  if (token) opcoes.headers.Authorization = 'Bearer ' + token
  if (corpo !== undefined) {
    opcoes.headers['Content-Type'] = 'application/json'
    opcoes.body = JSON.stringify(corpo)
  }

  const r = await fetch(url, opcoes)
  const texto = await r.text()

  let dados = texto
  try { dados = JSON.parse(texto) } catch {}


  if (r.status === 401 && token) {
    localStorage.removeItem('token')
    window.location.reload()
  }

  return { ok: r.ok, status: r.status, dados }
}