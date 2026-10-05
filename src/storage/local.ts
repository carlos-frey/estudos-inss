import { mergeProgress } from '../domain/merge'
import { migrateProgress } from '../domain/migrate'
import type { Progress } from '../domain/types'

const KEY = 'trilha:v1'
const LEGACY_KEY = 'inss-tracker:v1'
const UI_KEY = 'trilha:expanded'
const LEGACY_UI_KEY = 'inss-tracker:expanded'

function read<T>(key: string): T | undefined {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : undefined
  } catch {
    return undefined
  }
}

function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage indisponível */
  }
}

export const hasLegacyProgress = (): boolean => !!read<Progress>(LEGACY_KEY)

export function loadProgress(): Progress {
  const cur = read<Progress>(KEY) ?? {}
  const legacy = read<Progress>(LEGACY_KEY)
  return migrateProgress(legacy ? mergeProgress(migrateProgress(legacy), cur) : cur)
}

export function saveProgress(p: Progress): void {
  write(KEY, p)
  try {
    localStorage.removeItem(LEGACY_KEY)
  } catch {
    /* ignore */
  }
}

export function loadExpanded(): string[] {
  const cur = read<string[]>(UI_KEY)
  if (cur) return cur
  return (read<string[]>(LEGACY_UI_KEY) ?? []).map((id) => `inss.${id}`)
}

export const saveExpanded = (ids: string[]): void => write(UI_KEY, ids)

export function exportProgress(p: Progress): void {
  const blob = new Blob([JSON.stringify(p, null, 2)], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `trilha-do-edital-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(a.href)
}

/** Lê um .json exportado (inclusive da versão antiga, só INSS) e faz merge com o progresso atual. */
export async function importProgress(file: File, current: Progress): Promise<Progress> {
  const data = JSON.parse(await file.text()) as unknown
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Arquivo inválido')
  for (const v of Object.values(data as Record<string, unknown>)) {
    if (!v || typeof v !== 'object' || typeof (v as { updatedAt?: unknown }).updatedAt !== 'number') {
      throw new Error('Arquivo inválido')
    }
  }
  return mergeProgress(current, migrateProgress(data as Progress))
}
