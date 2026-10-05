import SearchOffRounded from '@mui/icons-material/SearchOffRounded'
import SearchRounded from '@mui/icons-material/SearchRounded'
import UnfoldLessRounded from '@mui/icons-material/UnfoldLessRounded'
import UnfoldMoreRounded from '@mui/icons-material/UnfoldMoreRounded'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import TextField from '@mui/material/TextField'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useMemo, useState } from 'react'
import { matching, subjectsFor } from '../data/registry'
import { dueReviews, leaves } from '../domain/tree'
import type { Concurso, Progress, TreeNode } from '../domain/types'
import { EmpregoPicker } from './EmpregoPicker'
import { Hero } from './Hero'
import { ReviewsPanel } from './ReviewsPanel'
import { SubjectCard } from './SubjectCard'

function groupIds(nodes: TreeNode[]): string[] {
  return nodes.flatMap((n) => (n.children?.length ? [n.id, ...groupIds(n.children)] : []))
}

interface Props {
  concurso: Concurso
  empregoId?: string
  onEmprego: (id: string | undefined) => void
  tab: number
  progress: Progress
  expanded: Set<string>
  setExpanded: (fn: (s: Set<string>) => Set<string>) => void
  onToggleExpand: (id: string) => void
  onToggleCheck: (node: TreeNode) => void
  onCompleteReview: (leafId: string, key: 'd1' | 'd7' | 'd30') => void
}

export function ConcursoPage(props: Props) {
  const { concurso, empregoId, onEmprego, tab, progress, expanded, setExpanded, onToggleExpand, onToggleCheck, onCompleteReview } = props
  const [query, setQuery] = useState('')
  const [group, setGroup] = useState('all')

  const subjects = useMemo(() => subjectsFor(concurso, empregoId), [concurso, empregoId])
  const leafIds = useMemo(() => new Set(subjects.flatMap(leaves).map((l) => l.id)), [subjects])
  const visible = useMemo(() => matching(query, subjects), [query, subjects])
  const reviewCount = dueReviews(progress).filter((r) => leafIds.has(r.leafId)).length
  const shown = subjects.filter((s) => group === 'all' || s.group === group)
  const noResults = !!visible && !shown.some((s) => visible.has(s.id))
  const empregoWeight = concurso.empregos?.[0]?.subject.weight ?? 0
  const emprego = concurso.empregos?.find((e) => e.id === empregoId)
  const missingEmprego = !!concurso.empregos && !emprego

  if (tab === 1) {
    return <ReviewsPanel progress={progress} include={(id) => leafIds.has(id)} onComplete={onCompleteReview} />
  }

  const treeProps = { progress, expanded, visible, query, onToggleExpand, onToggleCheck }
  const groupLabel = (id: string) => concurso.groups.find((g) => g.id === id)?.label ?? id
  const unit = concurso.unit === 'pontos' ? 'pts' : 'itens'

  return (
    <>
      <Hero
        concurso={concurso}
        subjects={subjects}
        progress={progress}
        pendingReviews={reviewCount}
        cargo={emprego ? `${emprego.cargo.split(' ')[0]} · ${emprego.title}` : undefined}
        hint={missingEmprego ? `sem o emprego: só ${concurso.total - empregoWeight} dos ${concurso.total} pontos` : undefined}
      />

      {concurso.empregos && (
        <EmpregoPicker empregos={concurso.empregos} value={empregoId} onChange={onEmprego} weight={empregoWeight} />
      )}

      <Box sx={{ display: 'flex', alignItems: { sm: 'flex-end' }, justifyContent: 'space-between', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mt: { xs: 4, sm: 5 }, mb: 2 }}>
        <Box>
          <Typography variant="h5">Conteúdo programático</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Marque o que já estudou. O tópico pai é marcado quando todos os filhos estão completos.
          </Typography>
        </Box>
        <ToggleButtonGroup
          size="small"
          exclusive
          value={group}
          onChange={(_, v: string | null) => v && setGroup(v)}
          sx={{ bgcolor: 'background.paper', flexShrink: 0, alignSelf: { xs: 'stretch', sm: 'auto' }, '& .MuiToggleButton-root': { flex: { xs: 1, sm: 'none' } } }}
        >
          <ToggleButton value="all">Todas</ToggleButton>
          {concurso.groups.map((g) => (
            <ToggleButton key={g.id} value={g.id}>
              <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>{g.short}</Box>
              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>{g.label}</Box>
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Buscar tópico ou lei…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRounded sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
              sx: { borderRadius: 99, bgcolor: 'background.paper', pl: 1.5 },
            },
          }}
        />
        <Tooltip title="Expandir tudo">
          <IconButton onClick={() => setExpanded((s) => new Set([...s, ...groupIds(subjects)]))} sx={{ bgcolor: 'background.paper', border: 1, borderColor: 'divider' }}>
            <UnfoldMoreRounded />
          </IconButton>
        </Tooltip>
        <Tooltip title="Recolher tudo">
          <IconButton
            onClick={() => setExpanded((s) => new Set([...s].filter((id) => !id.startsWith(`${concurso.id}.`))))}
            sx={{ bgcolor: 'background.paper', border: 1, borderColor: 'divider' }}
          >
            <UnfoldLessRounded />
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={{ display: 'grid', gap: 1.5 }}>
        {shown.map((s) => (
          <SubjectCard key={s.id} subject={s} groupLabel={groupLabel(s.group)} unit={unit} {...treeProps} />
        ))}
        {noResults && (
          <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
            <SearchOffRounded sx={{ fontSize: 40, opacity: 0.6 }} />
            <Typography sx={{ mt: 1 }}>Nada encontrado para “{query}”.</Typography>
          </Box>
        )}
      </Box>

      {concurso.notes && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 3, textAlign: 'center' }}>
          {concurso.banca} · {concurso.editalLabel} · {concurso.notes.join(' · ')}
          {concurso.editalUrl && (
            <>
              {' · '}
              <Box component="a" href={concurso.editalUrl} target="_blank" rel="noopener noreferrer" sx={{ color: 'primary.main' }}>
                ver edital
              </Box>
            </>
          )}
        </Typography>
      )}
    </>
  )
}
