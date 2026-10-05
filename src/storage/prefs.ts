export interface Prefs {
  lastConcurso?: string
  empregoByConcurso: Record<string, string>
  /** quando o emprego escolhido mudou pela última vez (para o sync entre aparelhos) */
  updatedAt?: number
}

const KEY = 'trilha:prefs'

export function loadPrefs(): Prefs {
  try {
    const p = JSON.parse(localStorage.getItem(KEY) ?? 'null') as Prefs | null
    return { empregoByConcurso: {}, ...p }
  } catch {
    return { empregoByConcurso: {} }
  }
}

export function savePrefs(p: Prefs): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(p))
  } catch {
    /* ignore */
  }
}
