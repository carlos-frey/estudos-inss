import { fraction } from './tree'
import type { Progress, Subject } from './types'

export function weightedProgress(subjects: Subject[], progress: Progress, prova?: 'P1' | 'P2'): number {
  const list = prova ? subjects.filter((s) => s.prova === prova) : subjects
  const total = list.reduce((a, s) => a + s.weight, 0)
  if (!total) return 0
  return list.reduce((a, s) => a + s.weight * fraction(s, progress), 0) / total
}
