import { describe, expect, it } from 'vitest'
import { subjects } from '../data/edital-2022'
import { mergeProgress } from './merge'
import { weightedProgress } from './progress'
import { checkState, completeReview, dueReviews, fraction, leaves, toggle } from './tree'
import type { Progress, TreeNode } from './types'

const t: TreeNode = {
  id: 'r', title: 'r',
  children: [
    { id: 'r.1', title: 'a', children: [{ id: 'r.1.1', title: 'x' }, { id: 'r.1.2', title: 'y' }] },
    { id: 'r.2', title: 'b' },
  ],
}
const NOW = Date.UTC(2026, 9, 5, 12)

describe('tree', () => {
  it('estado derivado em 3 níveis', () => {
    let p: Progress = toggle(t.children![0].children![0], {}, NOW)
    expect(checkState(t.children![0], p)).toBe('some')
    expect(checkState(t, p)).toBe('some')
    p = toggle(t.children![0].children![1], p, NOW)
    expect(checkState(t.children![0], p)).toBe('all')
    expect(checkState(t, p)).toBe('some')
    p = toggle(t.children![1], p, NOW)
    expect(checkState(t, p)).toBe('all')
  })
  it('marcar e desmarcar pai afeta todas as folhas', () => {
    let p = toggle(t, {}, NOW)
    expect(fraction(t, p)).toBe(1)
    p = toggle(t, p, NOW)
    expect(fraction(t, p)).toBe(0)
    expect(leaves(t)).toHaveLength(3)
  })
  it('marcar pai parcial completa o restante', () => {
    const p = toggle(t, toggle(t.children![1], {}, NOW), NOW)
    expect(fraction(t, p)).toBe(1)
  })
})

describe('revisões', () => {
  it('agenda 1/7/30 dias e lista vencidas', () => {
    const p = toggle(t.children![1], {}, NOW)
    expect(dueReviews(p, NOW)).toHaveLength(0)
    const later = NOW + 8 * 86_400_000
    expect(dueReviews(p, later).map((r) => r.key)).toEqual(['d1', 'd7'])
    const p2 = completeReview(p, 'r.2', 'd1', later)
    expect(dueReviews(p2, later).map((r) => r.key)).toEqual(['d7'])
  })
})

describe('peso', () => {
  it('progresso ponderado pela prova', () => {
    const es = subjects.find((s) => s.id === 'es')!
    const p = toggle(es, {}, NOW)
    expect(weightedProgress(subjects, p, 'P2')).toBe(1)
    expect(weightedProgress(subjects, p)).toBeCloseTo(70 / 120)
    expect(weightedProgress(subjects, p, 'P1')).toBe(0)
  })
  it('pesos somam 120 e ids são únicos', () => {
    expect(subjects.reduce((a, s) => a + s.weight, 0)).toBe(120)
    const ids = subjects.flatMap(leaves).map((l) => l.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('merge', () => {
  it('last-write-wins por folha', () => {
    const a: Progress = { x: { done: true, updatedAt: 2 }, y: { done: true, updatedAt: 1 } }
    const b: Progress = { x: { done: false, updatedAt: 1 }, y: { done: false, updatedAt: 5 }, z: { done: true, updatedAt: 1 } }
    const m = mergeProgress(a, b)
    expect(m.x.done).toBe(true)
    expect(m.y.done).toBe(false)
    expect(m.z.done).toBe(true)
  })
})
