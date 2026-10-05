import type { TreeNode } from '../domain/types'
import { subjects } from './edital-2022'

export interface Entry {
  node: TreeNode
  path: string[]
}

export const lookup = new Map<string, Entry>()

function walk(node: TreeNode, path: string[]) {
  lookup.set(node.id, { node, path })
  node.children?.forEach((c) => walk(c, [...path, node.title]))
}
subjects.forEach((s) => walk(s, []))

/** Nós que casam com o filtro ou têm descendente que casa. */
export function matching(query: string): Set<string> | null {
  const q = query.trim().toLowerCase()
  if (!q) return null
  const out = new Set<string>()
  const visit = (n: TreeNode): boolean => {
    const self = n.title.toLowerCase().includes(q)
    const kids = (n.children ?? []).map(visit).some(Boolean)
    if (self || kids) out.add(n.id)
    return self || kids
  }
  subjects.forEach(visit)
  return out
}
