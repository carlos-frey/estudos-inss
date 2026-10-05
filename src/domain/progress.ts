import { fraction } from './tree'
import type { Progress, Subject } from './types'

/** Fração da prova coberta, ponderada pelo peso de cada matéria (opcionalmente só de um grupo). */
export function weightedProgress(subjects: Subject[], progress: Progress, group?: string): number {
  const list = group ? subjects.filter((s) => s.group === group) : subjects
  const total = list.reduce((a, s) => a + s.weight, 0)
  if (!total) return 0
  return list.reduce((a, s) => a + s.weight * fraction(s, progress), 0) / total
}
