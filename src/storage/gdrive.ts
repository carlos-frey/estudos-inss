import { mergeProgress } from '../domain/merge'
import { migrateProgress } from '../domain/migrate'
import type { Progress } from '../domain/types'

export const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined
const SCOPE = 'https://www.googleapis.com/auth/drive.appdata'
const FILE_NAME = 'progress.json'
const HINT_KEY = 'trilha:gdrive'
const LEGACY_HINT_KEY = 'inss-tracker:gdrive'

let token: { value: string; expires: number } | undefined

function requestToken(prompt: '' | 'consent'): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!window.google?.accounts) return reject(new Error('Google Identity Services não carregou'))
    const client = google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID!,
      scope: SCOPE,
      callback: (res) => {
        if (res.error || !res.access_token) return reject(new Error(res.error ?? 'Falha no login'))
        token = { value: res.access_token, expires: Date.now() + (Number(res.expires_in) - 60) * 1000 }
        try {
          localStorage.setItem(HINT_KEY, '1')
        } catch {
          /* ignore */
        }
        resolve(res.access_token)
      },
      error_callback: (err) => reject(new Error(err.type)),
    })
    client.requestAccessToken({ prompt })
  })
}

async function getToken(): Promise<string> {
  if (token && token.expires > Date.now()) return token.value
  return requestToken('')
}

export const wasConnected = (): boolean => {
  try {
    return localStorage.getItem(HINT_KEY) === '1' || localStorage.getItem(LEGACY_HINT_KEY) === '1'
  } catch {
    return false
  }
}

export const connect = (): Promise<string> => requestToken('consent')

export function disconnect(): void {
  if (token) google.accounts.oauth2.revoke(token.value, () => {})
  token = undefined
  try {
    localStorage.removeItem(HINT_KEY)
    localStorage.removeItem(LEGACY_HINT_KEY)
  } catch {
    /* ignore */
  }
}

async function api(url: string, init: RequestInit = {}): Promise<Response> {
  const res = await fetch(url, {
    ...init,
    headers: { ...init.headers, Authorization: `Bearer ${await getToken()}` },
  })
  if (!res.ok) throw new Error(`Drive: ${res.status}`)
  return res
}

async function findFileId(): Promise<string | undefined> {
  const q = encodeURIComponent(`name='${FILE_NAME}'`)
  const res = await api(`https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=${q}&fields=files(id)`)
  return ((await res.json()) as { files: { id: string }[] }).files[0]?.id
}

/** Baixa o remoto, faz merge com o local, grava de volta e devolve o resultado. */
export async function sync(local: Progress): Promise<Progress> {
  const id = await findFileId()
  let merged = local
  if (id) {
    const remote = (await (await api(`https://www.googleapis.com/drive/v3/files/${id}?alt=media`)).json()) as Progress
    merged = mergeProgress(local, migrateProgress(remote))
  }
  const body = JSON.stringify(merged)
  if (id) {
    await api(`https://www.googleapis.com/upload/drive/v3/files/${id}?uploadType=media`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body,
    })
  } else {
    const boundary = 'inss' + Math.random().toString(36).slice(2)
    const meta = JSON.stringify({ name: FILE_NAME, parents: ['appDataFolder'] })
    await api('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: { 'Content-Type': `multipart/related; boundary=${boundary}` },
      body: `--${boundary}\r\nContent-Type: application/json\r\n\r\n${meta}\r\n--${boundary}\r\nContent-Type: application/json\r\n\r\n${body}\r\n--${boundary}--`,
    })
  }
  return merged
}
