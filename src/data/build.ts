import type { Accent, IconKey, Subject, TreeNode } from '../domain/types'

// IDs são derivados da posição na árvore e prefixados pelo concurso (ex.: inss.pt.3).
// Ao editar um edital já em uso, só acrescente itens no fim das listas para não deslocar o progresso salvo.

export type Draft = { title: string; children?: Draft[]; lawUrl?: string; outdated?: boolean }

export const n = (title: string, children?: Draft[], extra: Partial<Draft> = {}): Draft => ({ title, children, ...extra })
export const law = (title: string, lawUrl: string, children?: Draft[]): Draft => n(title, children, { lawUrl })
export const leafs = (...titles: string[]): Draft[] => titles.map((t) => n(t))

export const PLANALTO = 'https://www.planalto.gov.br/ccivil_03'

export function build(prefix: string, drafts: Draft[]): TreeNode[] {
  return drafts.map((d, i) => {
    const id = `${prefix}.${i + 1}`
    const node: TreeNode = { id, title: d.title }
    if (d.lawUrl) node.lawUrl = d.lawUrl
    if (d.outdated) node.outdated = true
    if (d.children?.length) node.children = build(id, d.children)
    return node
  })
}

export interface SubjectSpec {
  id: string
  title: string
  short: string
  group: string
  weight: number
  accent: Accent
  icon: IconKey
  children: Draft[]
}

export function subject(s: SubjectSpec): Subject {
  return { ...s, children: build(s.id, s.children) }
}

export const ACCENTS = {
  rose: { light: '#E11D48', dark: '#FB7185' },
  amber: { light: '#D97706', dark: '#FBBF24' },
  emerald: { light: '#059669', dark: '#34D399' },
  sky: { light: '#0284C7', dark: '#38BDF8' },
  violet: { light: '#7C3AED', dark: '#A78BFA' },
  orange: { light: '#EA580C', dark: '#FB923C' },
  indigo: { light: '#4F46E5', dark: '#818CF8' },
  red: { light: '#DC2626', dark: '#F87171' },
  teal: { light: '#0D9488', dark: '#2DD4BF' },
} satisfies Record<string, Accent>
