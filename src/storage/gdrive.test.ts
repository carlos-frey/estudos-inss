import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Progress } from '../domain/types'

// Simula o Google Identity Services e a API do Drive para testar o fluxo de sync sem rede.
let files: Record<string, string> = {}
let calls: string[] = []
let fail401 = false

const fakeGoogle = {
  accounts: {
    oauth2: {
      initTokenClient: (cfg: { callback: (r: object) => void }) => ({
        requestAccessToken: () => cfg.callback({ access_token: 'tok', expires_in: '3600' }),
      }),
      hasGrantedAllScopes: () => true,
      revoke: () => {},
    },
  },
}

function fakeFetch(url: string, init: RequestInit = {}) {
  const method = init.method ?? 'GET'
  calls.push(`${method} ${url.replace('https://www.googleapis.com', '')}`)
  const json = (b: unknown, status = 200) => Promise.resolve(new Response(JSON.stringify(b), { status }))
  if (fail401) return json({}, 401)
  if (url.includes('/drive/v3/files?spaces=appDataFolder')) return json({ files: Object.keys(files).map((id) => ({ id })) })
  const get = url.match(/\/drive\/v3\/files\/(\w+)\?alt=media/)
  if (get) return json(JSON.parse(files[get[1]]))
  const patch = url.match(/\/upload\/drive\/v3\/files\/(\w+)\?uploadType=media/)
  if (patch) {
    files[patch[1]] = init.body as string
    return json({ id: patch[1] })
  }
  if (url.includes('uploadType=multipart')) {
    const body = init.body as string
    files.f1 = body.split('\r\n\r\n')[2].split('\r\n--')[0]
    return json({ id: 'f1' })
  }
  return json({}, 404)
}

const prefs = { empregoByConcurso: {}, updatedAt: 0 }
const leaf = (t: number) => ({ done: true, updatedAt: t })

async function load() {
  vi.resetModules()
  Object.assign(globalThis, { window: { google: fakeGoogle }, google: fakeGoogle, fetch: fakeFetch })
  return import('./gdrive')
}

beforeEach(() => {
  files = {}
  calls = []
  fail401 = false
})

describe('sync com Google Drive', () => {
  it('sem token e sem clique pede reconexão em vez de abrir popup', async () => {
    const drive = await load()
    await expect(drive.sync({ progress: {}, prefs })).rejects.toBeInstanceOf(drive.NeedsAuthError)
    expect(calls).toHaveLength(0)
  })

  it('primeira sincronização cria o arquivo na pasta do app', async () => {
    const drive = await load()
    await drive.connect()
    const p: Progress = { 'inss.pt.1': leaf(1) }
    await drive.sync({ progress: p, prefs })
    expect(calls.some((c) => c.startsWith('POST'))).toBe(true)
    const saved = JSON.parse(files.f1)
    expect(saved.version).toBe(2)
    expect(saved.progress).toEqual(p)
    expect(JSON.stringify(calls)).toContain('appDataFolder')
  })

  it('arquivo antigo (só progresso, sem prefixo) é migrado e mesclado', async () => {
    files.f1 = JSON.stringify({ 'pt.2': leaf(5) })
    const drive = await load()
    await drive.connect()
    const res = await drive.sync({ progress: { 'inss.pt.1': leaf(1) }, prefs })
    expect(Object.keys(res.progress).sort()).toEqual(['inss.pt.1', 'inss.pt.2'])
    expect(JSON.parse(files.f1).progress['inss.pt.2']).toBeTruthy()
  })

  it('emprego escolhido em outro aparelho (mais recente) prevalece', async () => {
    files.f1 = JSON.stringify({ version: 2, progress: {}, prefs: { empregoByConcurso: { hemobras: 'e11' }, updatedAt: 10 } })
    const drive = await load()
    await drive.connect()
    const res = await drive.sync({ progress: {}, prefs: { empregoByConcurso: { hemobras: 'e05' }, updatedAt: 5 } })
    expect(res.prefs.empregoByConcurso.hemobras).toBe('e11')
    const res2 = await drive.sync({ progress: {}, prefs: { empregoByConcurso: { hemobras: 'e02' }, updatedAt: 20 } })
    expect(res2.prefs.empregoByConcurso.hemobras).toBe('e02')
  })

  it('token recusado (401) limpa a sessão e pede reconexão', async () => {
    const drive = await load()
    await drive.connect()
    expect(drive.hasValidToken()).toBe(true)
    fail401 = true
    await expect(drive.sync({ progress: {}, prefs })).rejects.toBeInstanceOf(drive.NeedsAuthError)
    expect(drive.hasValidToken()).toBe(false)
  })
})
