export interface TreeNode {
  id: string
  title: string
  children?: TreeNode[]
  lawUrl?: string
  outdated?: boolean
}

export type IconKey =
  | 'book' | 'ethics' | 'gavel' | 'bank' | 'computer' | 'functions' | 'health'
  | 'blood' | 'policy' | 'work'

export interface Accent {
  light: string
  dark: string
}

export interface Subject extends TreeNode {
  /** id do grupo da prova (ex.: P1/P2 no INSS, CB/CE na Hemobrás) */
  group: string
  /** quanto a matéria vale na prova, na unidade do concurso (itens ou pontos) */
  weight: number
  short: string
  accent: Accent
  icon: IconKey
  children: TreeNode[]
}

export interface Group {
  id: string
  label: string
  /** rótulo curto para filtros no celular */
  short: string
}

export interface Emprego {
  id: string
  code: number
  title: string
  cargo: string
  nivel: 'medio' | 'tecnico' | 'superior'
  retificado: boolean
  subject: Subject
}

export interface Concurso {
  id: string
  name: string
  org: string
  cargo: string
  banca: string
  editalLabel: string
  editalUrl?: string
  unit: 'itens' | 'pontos'
  total: number
  groups: Group[]
  /** matérias comuns a todos os candidatos */
  subjects: Subject[]
  /** quando existe, o candidato escolhe um emprego e a matéria dele entra na prova */
  empregos?: Emprego[]
  notes?: string[]
  /** visual do concurso (degradê do painel e dos cards) */
  look: { gradient: string; glow: string }
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
