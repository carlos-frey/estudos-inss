export interface TreeNode {
  id: string
  title: string
  children?: TreeNode[]
  lawUrl?: string
  outdated?: boolean
}

export interface Subject extends TreeNode {
  prova: 'P1' | 'P2'
  /** nº de itens da prova que a matéria vale (estimativa na P1) */
  weight: number
  children: TreeNode[]
}

export interface Review {
  due: string // YYYY-MM-DD
  doneAt?: string // ISO
}

export interface Leaf {
  done: boolean
  doneAt?: string
  reviews?: { d1: Review; d7: Review; d30: Review }
  updatedAt: number
}

export type Progress = Record<string, Leaf>
export type CheckState = 'all' | 'some' | 'none'
