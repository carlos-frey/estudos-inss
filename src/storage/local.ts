import { mergeProgress } from '../domain/merge'
import type { Progress } from '../domain/types'

const KEY = 'inss-tracker:v1'
const UI_KEY = 'inss-tracker:expanded'

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Progress) : {}
  } catch {
    return {}
  }
}

export function saveProgress(p: Progress): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(p))
  } catch {
    /* storage indisponível */
  }
}

export function loadExpanded(): string[] {
  try {
    return JSON.parse(localStorage.getItem(UI_KEY) ?? '[]') as string[]
  } catch {
    return []
  }
}

export function saveExpanded(ids: string[]): void {
  try {
    localStorage.setItem(UI_KEY, JSON.stringify(ids))
  } catch {
    /* ignore */
  }
}

export function exportProgress(p: Progress): void {
  const blob = new Blob([JSON.stringify(p, null, 2)], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `inss-tracker-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(a.href)
}

/** Lê um .json exportado e faz merge com o progresso atual. */
export async function importProgress(file: File, current: Progress): Promise<Progress> {
  const data = JSON.parse(await file.text()) as unknown
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Arquivo inválido')
  for (const v of Object.values(data as Record<string, unknown>)) {
    if (!v || typeof v !== 'object' || typeof (v as { updatedAt?: unknown }).updatedAt !== 'number') {
      throw new Error('Arquivo inválido')
    }
  }
  return mergeProgress(current, data as Progress)
}
