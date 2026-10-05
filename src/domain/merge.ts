import type { Progress } from './types'

/** Last-write-wins por folha (updatedAt). */
export function mergeProgress(a: Progress, b: Progress): Progress {
  const out: Progress = { ...a }
  for (const [id, leaf] of Object.entries(b)) {
    if (!out[id] || leaf.updatedAt > out[id].updatedAt) out[id] = leaf
  }
  return out
}
