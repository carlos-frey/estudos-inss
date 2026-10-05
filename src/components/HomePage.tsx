import ArrowForwardRounded from '@mui/icons-material/ArrowForwardRounded'
import EventRepeatRounded from '@mui/icons-material/EventRepeatRounded'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import { concursos, subjectsFor } from '../data/registry'
import { weightedProgress } from '../domain/progress'
import { dueReviews, leaves } from '../domain/tree'
import type { Concurso, Progress } from '../domain/types'
import { ProgressRing } from './ProgressRing'

function ConcursoCard({ c, progress, emprego, onOpen }: { c: Concurso; progress: Progress; emprego?: string; onOpen: () => void }) {
  const subjects = subjectsFor(c, emprego)
  const pct = Math.round(weightedProgress(subjects, progress) * 100)
  const ids = new Set(subjects.flatMap(leaves).map((l) => l.id))
  const pending = dueReviews(progress).filter((r) => ids.has(r.leafId)).length
  const emp = c.empregos?.find((e) => e.id === emprego)
  const look = c.look
  return (
    <Card sx={{ overflow: 'hidden', transition: 'transform 200ms, box-shadow 200ms', '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 18px 36px -18px ${look.glow}` } }}>
      <CardActionArea onClick={onOpen} sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
        <Box sx={{ position: 'relative', p: 2.5, color: '#fff', background: look.gradient, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box aria-hidden sx={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 90% 0%, rgba(255,255,255,0.25), transparent 45%)' }} />
          <Box sx={{ position: 'relative', flex: 1, minWidth: 0 }}>
            <Typography variant="overline" sx={{ opacity: 0.85 }}>{c.banca} · {c.editalLabel}</Typography>
            <Typography variant="h5" sx={{ color: '#fff', lineHeight: 1.1 }}>{c.name}</Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }} noWrap>
              {emp ? `${emp.cargo.split(' ')[0]} · ${emp.title}` : c.cargo}
            </Typography>
          </Box>
          <Box sx={{ position: 'relative' }}>
            <ProgressRing value={pct} size={72} thickness={4} color="#fff" track="rgba(255,255,255,0.22)">
              <Typography sx={{ fontWeight: 800, fontSize: 18 }}>{pct}%</Typography>
            </ProgressRing>
          </Box>
        </Box>
        <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <Chip size="small" label={`${c.total} ${c.unit}`} />
          <Chip size="small" label={`${subjects.length} matérias`} />
          {c.empregos && !emp && <Chip size="small" color="primary" variant="outlined" label={`${c.empregos.length} empregos: escolha o seu`} />}
          {pending > 0 && (
            <Chip
              size="small"
              icon={<EventRepeatRounded />}
              label={`${pending} ${pending === 1 ? 'revisão' : 'revisões'}`}
              sx={{ bgcolor: 'color-mix(in srgb, var(--mui-palette-warning-main) 16%, transparent)', color: 'warning.main', '& .MuiChip-icon': { color: 'inherit', fontSize: 14 } }}
            />
          )}
          <Box sx={{ flex: 1 }} />
          <Typography variant="body2" color="primary" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 0.5 }}>
            Abrir <ArrowForwardRounded fontSize="small" />
          </Typography>
        </Box>
      </CardActionArea>
    </Card>
  )
}

interface Props {
  progress: Progress
  empregoByConcurso: Record<string, string>
  onOpen: (id: string) => void
}

export function HomePage({ progress, empregoByConcurso, onOpen }: Props) {
  return (
    <Box>
      <Box sx={{ py: { xs: 2, sm: 4 }, maxWidth: 640 }}>
        <Typography variant="overline" color="primary">Seus concursos</Typography>
        <Typography variant="h3" sx={{ fontSize: { xs: 32, sm: 44 }, mt: 0.5 }}>
          Trilha do Edital
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1.5, fontSize: { xs: 15, sm: 17 } }}>
          Acompanhe o conteúdo programático de cada concurso tópico a tópico, com progresso ponderado pelo peso de cada matéria e revisões espaçadas.
        </Typography>
      </Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mt: 1 }}>
        {concursos.map((c) => (
          <ConcursoCard key={c.id} c={c} progress={progress} emprego={empregoByConcurso[c.id]} onOpen={() => onOpen(c.id)} />
        ))}
      </Box>
    </Box>
  )
}
