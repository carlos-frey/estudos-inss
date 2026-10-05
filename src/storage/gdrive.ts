import { mergeProgress } from '../domain/merge'
import { migrateProgress } from '../domain/migrate'
import type { Progress } from '../domain/types'
import type { Prefs } from './prefs'

// Sincronização com o Google Drive usando a pasta oculta do app (escopo drive.appdata, não sensível):
// o app só enxerga o próprio arquivo, nunca os outros arquivos do usuário.

export const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined
const SCOPE = 'https://www.googleapis.com/auth/drive.appdata'
const FILE_NAME = 'progress.json'
const HINT_KEY = 'trilha:gdrive'
const LEGACY_HINT_KEY = 'inss-tracker:gdrive'
const TOKEN_KEY = 'trilha:gdrive-token'

/** Lançado quando é preciso um clique do usuário para obter um token novo (o popup do Google exige gesto). */
export class NeedsAuthError extends Error {
  constructor() {
    super('Sessão do Google expirada')
  }
}

interface Token {
  value: string
  expires: number
}

let token: Token | undefined = (() => {
  try {
    const t = JSON.parse(sessionStorage.getItem(TOKEN_KEY) ?? 'null') as Token | null
    return t && t.expires > Date.now() ? t : undefined
  } catch {
    return undefined
  }
})()

function setToken(t: Token | undefined) {
  token = t
  try {
    if (t) sessionStorage.setItem(TOKEN_KEY, JSON.stringify(t))
    else sessionStorage.removeItem(TOKEN_KEY)
  } catch {
    /* ignore */
  }
}

export const hasValidToken = (): boolean => !!token && token.expires > Date.now()

function requestToken(prompt: '' | 'consent'): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!window.google?.accounts?.oauth2) return reject(new Error('O login do Google ainda não carregou. Tente de novo.'))
    const client = google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID!,
      scope: SCOPE,
      callback: (res) => {
        if (res.error || !res.access_token) return reject(new Error(res.error_description || res.error || 'Falha no login'))
        if (!google.accounts.oauth2.hasGrantedAllScopes(res, SCOPE)) {
          return reject(new Error('Permissão de acesso ao Drive não concedida'))
        }
        setToken({ value: res.access_token, expires: Date.now() + (Number(res.expires_in) - 60) * 1000 })
        try {
          localStorage.setItem(HINT_KEY, '1')
        } catch {
          /* ignore */
        }
        resolve(res.access_token)
      },
      error_callback: (err) =>
        reject(new Error(err.type === 'popup_closed' ? 'Janela do Google fechada antes de concluir' : err.type === 'popup_failed_to_open' ? 'O navegador bloqueou a janela do Google' : err.type)),
    })
    client.requestAccessToken({ prompt })
  })
}

async function getToken(interactive: boolean): Promise<string> {
  if (token && token.expires > Date.now()) return token.value
  if (!interactive) throw new NeedsAuthError()
  return requestToken('')
}

export const wasConnected = (): boolean => {
  try {
    return localStorage.getItem(HINT_KEY) === '1' || localStorage.getItem(LEGACY_HINT_KEY) === '1'
  } catch {
    return false
  }
}

/** Primeira conexão (precisa ser chamada a partir de um clique). */
export const connect = (): Promise<string> => requestToken('consent')

export function disconnect(): void {
  if (token && window.google?.accounts?.oauth2) google.accounts.oauth2.revoke(token.value, () => {})
  setToken(undefined)
  try {
    localStorage.removeItem(HINT_KEY)
    localStorage.removeItem(LEGACY_HINT_KEY)
  } catch {
    /* ignore */
  }
}

async function api(url: string, interactive: boolean, init: RequestInit = {}): Promise<Response> {
  const res = await fetch(url, {
    ...init,
    headers: { ...init.headers, Authorization: `Bearer ${await getToken(interactive)}` },
  })
  if (res.status === 401) {
    setToken(undefined)
    throw new NeedsAuthError()
  }
  if (!res.ok) throw new Error(`Google Drive respondeu ${res.status}`)
  return res
}

/** Conteúdo do arquivo na nuvem. A versão 1 (antiga) era só o objeto de progresso. */
interface CloudFile {
  version: 2
  progress: Progress
  prefs?: { empregoByConcurso: Record<string, string>; updatedAt: number }
}

function parseCloud(data: unknown): CloudFile {
  const d = data as Partial<CloudFile> | null
  if (d && d.version === 2 && d.progress) return d as CloudFile
  return { version: 2, progress: (data ?? {}) as Progress }
}

export interface SyncState {
  progress: Progress
  prefs: Prefs
}

/** Baixa o arquivo da nuvem, faz merge com o estado local, grava o resultado de volta e o devolve. */
export async function sync(local: SyncState, interactive = false): Promise<SyncState> {
  const q = encodeURIComponent(`name='${FILE_NAME}'`)
  const list = await api(`https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=${q}&fields=files(id)`, interactive)
  const id = ((await list.json()) as { files: { id: string }[] }).files[0]?.id

  let progress = local.progress
  let prefs = local.prefs
  if (id) {
    const remote = parseCloud(await (await api(`https://www.googleapis.com/drive/v3/files/${id}?alt=media`, interactive)).json())
    progress = mergeProgress(local.progress, migrateProgress(remote.progress))
    if (remote.prefs && remote.prefs.updatedAt > (local.prefs.updatedAt ?? 0)) {
      prefs = { ...local.prefs, empregoByConcurso: remote.prefs.empregoByConcurso, updatedAt: remote.prefs.updatedAt }
    }
  }

  const file: CloudFile = {
    version: 2,
    progress,
    prefs: { empregoByConcurso: prefs.empregoByConcurso, updatedAt: prefs.updatedAt ?? 0 },
  }
  const body = JSON.stringify(file)
  if (id) {
    await api(`https://www.googleapis.com/upload/drive/v3/files/${id}?uploadType=media`, interactive, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body,
    })
  } else {
    const boundary = 'trilha' + Math.random().toString(36).slice(2)
    const meta = JSON.stringify({ name: FILE_NAME, parents: ['appDataFolder'] })
    await api('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', interactive, {
      method: 'POST',
      headers: { 'Content-Type': `multipart/related; boundary=${boundary}` },
      body: `--${boundary}\r\nContent-Type: application/json\r\n\r\n${meta}\r\n--${boundary}\r\nContent-Type: application/json\r\n\r\n${body}\r\n--${boundary}--`,
    })
  }
  return { progress, prefs }
}
