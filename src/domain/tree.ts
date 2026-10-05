import type { CheckState, Leaf, Progress, TreeNode } from './types'

export function leaves(node: TreeNode): TreeNode[] {
  if (!node.children?.length) return [node]
  return node.children.flatMap(leaves)
}

export function fraction(node: TreeNode, progress: Progress): number {
  const ls = leaves(node)
  return ls.filter((l) => progress[l.id]?.done).length / ls.length
}

export function checkState(node: TreeNode, progress: Progress): CheckState {
  const f = fraction(node, progress)
  return f === 1 ? 'all' : f === 0 ? 'none' : 'some'
}

const DAY = 86_400_000

function isoDay(ms: number): string {
  const d = new Date(ms)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

export function scheduleReviews(now: number): NonNullable<Leaf['reviews']> {
  return {
    d1: { due: isoDay(now + DAY) },
    d7: { due: isoDay(now + 7 * DAY) },
    d30: { due: isoDay(now + 30 * DAY) },
  }
}

/** Clicar num nó: se está tudo marcado desmarca as folhas, senão marca todas. */
export function toggle(node: TreeNode, progress: Progress, now = Date.now()): Progress {
  const ls = leaves(node)
  const target = !ls.every((l) => progress[l.id]?.done)
  const next: Progress = { ...progress }
  for (const l of ls) {
    const cur = progress[l.id]
    if (!!cur?.done === target) continue
    next[l.id] = target
      ? { done: true, doneAt: new Date(now).toISOString(), reviews: scheduleReviews(now), updatedAt: now }
      : { done: false, updatedAt: now }
  }
  return next
}

export interface DueReview {
  leafId: string
  key: 'd1' | 'd7' | 'd30'
  due: string
}

export function dueReviews(progress: Progress, now = Date.now()): DueReview[] {
  const today = isoDay(now)
  const out: DueReview[] = []
  for (const [leafId, leaf] of Object.entries(progress)) {
    if (!leaf.done || !leaf.reviews) continue
    for (const key of ['d1', 'd7', 'd30'] as const) {
      const r = leaf.reviews[key]
      if (!r.doneAt && r.due <= today) out.push({ leafId, key, due: r.due })
    }
  }
  return out.sort((a, b) => a.due.localeCompare(b.due))
}

export function pendingCount(node: TreeNode, progress: Progress, now = Date.now()): number {
  const ids = new Set(leaves(node).map((l) => l.id))
  return dueReviews(progress, now).filter((r) => ids.has(r.leafId)).length
}

export function completeReview(
  progress: Progress,
  leafId: string,
  key: 'd1' | 'd7' | 'd30',
  now = Date.now(),
): Progress {
  const leaf = progress[leafId]
  if (!leaf?.reviews) return progress
  return {
    ...progress,
    [leafId]: {
      ...leaf,
      reviews: { ...leaf.reviews, [key]: { ...leaf.reviews[key], doneAt: new Date(now).toISOString() } },
      updatedAt: now,
    },
  }
}
