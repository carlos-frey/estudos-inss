import type { Progress } from './types'

export const KNOWN_PREFIXES = ['inss', 'hemobras']

/** Progresso salvo antes do app ter vários concursos não tinha prefixo: era todo do INSS. */
export function migrateProgress(p: Progress): Progress {
  let changed = false
  const out: Progress = {}
  for (const [id, leaf] of Object.entries(p)) {
    if (KNOWN_PREFIXES.includes(id.split('.')[0])) {
      out[id] = leaf
    } else {
      changed = true
      const nid = `inss.${id}`
      if (!out[nid] || leaf.updatedAt > out[nid].updatedAt) out[nid] = leaf
    }
  }
  return changed ? out : p
}
