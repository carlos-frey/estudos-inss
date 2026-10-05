import type { Concurso, Subject, TreeNode } from '../domain/types'
import { hemobras } from './concursos/hemobras-2024'
import { inss } from './concursos/inss-2022'

export const concursos: Concurso[] = [inss, hemobras]
export const concursoById = new Map(concursos.map((c) => [c.id, c]))

export function subjectsFor(c: Concurso, empregoId?: string): Subject[] {
  const emp = c.empregos?.find((e) => e.id === empregoId)
  return emp ? [...c.subjects, emp.subject] : c.subjects
}

export interface Entry {
  node: TreeNode
  path: string[]
  subject: Subject
  concurso: Concurso
}

/** Índice global de todos os nós (todos os concursos e todos os empregos). */
export const lookup = new Map<string, Entry>()

function walk(node: TreeNode, path: string[], subject: Subject, concurso: Concurso) {
  lookup.set(node.id, { node, path, subject, concurso })
  node.children?.forEach((ch) => walk(ch, [...path, node.title], subject, concurso))
}
for (const c of concursos) {
  for (const s of [...c.subjects, ...(c.empregos ?? []).map((e) => e.subject)]) walk(s, [], s, c)
}

/** Nós que casam com o filtro ou têm descendente que casa (dentro das matérias dadas). */
export function matching(query: string, subjects: Subject[]): Set<string> | null {
  const q = query.trim().toLowerCase()
  if (!q) return null
  const out = new Set<string>()
  const visit = (nd: TreeNode): boolean => {
    const self = nd.title.toLowerCase().includes(q)
    const kids = (nd.children ?? []).map(visit).some(Boolean)
    if (self || kids) out.add(nd.id)
    return self || kids
  }
  subjects.forEach(visit)
  return out
}

export const concursoOf = (id: string): string => id.split('.')[0]
