import { describe, expect, it } from 'vitest'
import { concursos, subjectsFor } from '../data/registry'
import { hemobras } from '../data/concursos/hemobras-2024'
import { inss } from '../data/concursos/inss-2022'
import { migrateProgress } from './migrate'
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
  it('progresso ponderado pelo grupo da prova', () => {
    const es = inss.subjects.find((s) => s.id === 'inss.es')!
    const p = toggle(es, {}, NOW)
    expect(weightedProgress(inss.subjects, p, 'P2')).toBe(1)
    expect(weightedProgress(inss.subjects, p)).toBeCloseTo(70 / 120)
    expect(weightedProgress(inss.subjects, p, 'P1')).toBe(0)
  })
  it('INSS soma 120 itens; Hemobrás 40 comuns + 60 do emprego = 100 pontos', () => {
    const sum = (ss: { weight: number }[]) => ss.reduce((a, s) => a + s.weight, 0)
    expect(sum(inss.subjects)).toBe(120)
    expect(sum(hemobras.subjects)).toBe(40)
    for (const e of hemobras.empregos!) expect(sum(subjectsFor(hemobras, e.id))).toBe(100)
  })
})

describe('concursos', () => {
  it('ids únicos em todos os concursos e empregos, sempre com prefixo do concurso', () => {
    const all = concursos.flatMap((c) => [...c.subjects, ...(c.empregos ?? []).map((e) => e.subject)])
    const ids = all.flatMap(function walk(n: TreeNode): string[] {
      return [n.id, ...(n.children ?? []).flatMap(walk)]
    })
    expect(new Set(ids).size).toBe(ids.length)
    for (const id of ids) expect(['inss', 'hemobras']).toContain(id.split('.')[0])
  })
  it('Hemobrás: 45 empregos, todos com conteúdo, conforme a Retificação nº 1', () => {
    const emps = hemobras.empregos!
    expect(emps).toHaveLength(45)
    for (const e of emps) expect(leaves(e.subject).length).toBeGreaterThanOrEqual(5)
    const codes = emps.map((e) => e.code)
    expect(codes).not.toContain(37)
    expect(codes).toEqual(expect.arrayContaining([45, 46]))
    expect(emps.find((e) => e.code === 40)!.title).toBe('Garantia da Qualidade')
    const cq = emps.find((e) => e.code === 5)!
    expect(cq.retificado).toBe(true)
    expect(leaves(cq.subject).some((l) => l.title.includes('Obtenção e controle de água purificada'))).toBe(true)
  })
})

describe('migração', () => {
  it('progresso antigo sem prefixo vira INSS; com prefixo fica igual', () => {
    const old: Progress = { 'pt.1': { done: true, updatedAt: 1 }, 'hemobras.pt.1': { done: true, updatedAt: 2 } }
    const m = migrateProgress(old)
    expect(Object.keys(m).sort()).toEqual(['hemobras.pt.1', 'inss.pt.1'])
    const already: Progress = { 'inss.pt.1': { done: true, updatedAt: 1 } }
    expect(migrateProgress(already)).toBe(already)
  })
  it('ids migrados existem na árvore do INSS', () => {
    const subject = inss.subjects.find((s) => s.id === 'inss.pt')!
    expect(leaves(subject).map((l) => l.id)).toContain('inss.pt.1')
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
