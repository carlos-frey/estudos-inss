import CheckRounded from '@mui/icons-material/CheckRounded'
import TaskAltRounded from '@mui/icons-material/TaskAltRounded'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import { lookup } from '../data/lookup'
import { accentSx, metaFor } from '../data/subjectMeta'
import { dueReviews, type DueReview } from '../domain/tree'
import type { Progress } from '../domain/types'

const LABEL = { d1: '24 horas', d7: '7 dias', d30: '30 dias' }
const fmt = (d: string) => d.split('-').reverse().slice(0, 2).join('/')

interface Props {
  progress: Progress
  onComplete: (leafId: string, key: 'd1' | 'd7' | 'd30') => void
}

function ReviewCard({ r, onComplete }: { r: DueReview; onComplete: Props['onComplete'] }) {
  const entry = lookup.get(r.leafId)
  const meta = metaFor(r.leafId)
  const late = r.due < new Date().toLocaleDateString('sv-SE')
  return (
    <Card sx={[accentSx(meta), { px: { xs: 1.5, sm: 2 }, py: 1.5, borderRadius: '16px', display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 } }]}>
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: '12px',
          flexShrink: 0,
          display: 'grid',
          placeItems: 'center',
          color: 'var(--accent)',
          bgcolor: 'var(--accent-tint)',
          '& svg': { fontSize: 22 },
        }}
      >
        {meta.icon}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 700, overflowWrap: 'anywhere' }}>
          {entry?.node.title ?? r.leafId}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }} noWrap>
          {meta.short}
          {entry && entry.path.length > 1 ? ` › ${entry.path.slice(1).join(' › ')}` : ''}
        </Typography>
        <Box sx={{ display: 'flex', gap: 0.75, mt: 0.75, flexWrap: 'wrap' }}>
          <Chip size="small" label={`Revisão de ${LABEL[r.key]}`} sx={{ bgcolor: 'var(--accent-tint)', color: 'var(--accent)' }} />
          {late && <Chip size="small" variant="outlined" color="warning" label={`desde ${fmt(r.due)}`} />}
        </Box>
      </Box>
      <Button
        variant="contained"
        disableElevation
        onClick={() => onComplete(r.leafId, r.key)}
        startIcon={<CheckRounded />}
        sx={{ bgcolor: 'var(--accent)', flexShrink: 0, '&:hover': { bgcolor: 'var(--accent)', filter: 'brightness(1.1)' }, minWidth: 0, px: { xs: 1.5, sm: 2 }, '& .MuiButton-startIcon': { mr: { xs: 0, sm: 1 } } }}
        aria-label="Marcar revisão como feita"
      >
        <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Feito</Box>
      </Button>
    </Card>
  )
}

function Group({ title, items, onComplete }: { title: string; items: DueReview[]; onComplete: Props['onComplete'] }) {
  if (!items.length) return null
  return (
    <Box sx={{ mt: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <Typography variant="overline" color="text.secondary">{title}</Typography>
        <Chip size="small" label={items.length} />
      </Box>
      <Box sx={{ display: 'grid', gap: 1 }}>
        {items.map((r) => (
          <ReviewCard key={`${r.leafId}.${r.key}`} r={r} onComplete={onComplete} />
        ))}
      </Box>
    </Box>
  )
}

export function ReviewsPanel({ progress, onComplete }: Props) {
  const due = dueReviews(progress)
  const today = new Date().toLocaleDateString('sv-SE')
  return (
    <Box>
      <Typography variant="h5">Revisões</Typography>
      <Typography color="text.secondary" variant="body2" sx={{ mt: 0.5, maxWidth: 560 }}>
        Cada tópico marcado ganha revisões em 24 horas, 7 dias e 30 dias. Revisar no tempo certo é o que fixa o conteúdo.
      </Typography>
      {due.length === 0 ? (
        <Card sx={{ mt: 3, p: { xs: 4, sm: 6 }, textAlign: 'center' }}>
          <Box
            sx={{
              width: 72,
              height: 72,
              mx: 'auto',
              borderRadius: '50%',
              display: 'grid',
              placeItems: 'center',
              bgcolor: 'color-mix(in srgb, var(--mui-palette-success-main) 14%, transparent)',
              color: 'success.main',
            }}
          >
            <TaskAltRounded sx={{ fontSize: 38 }} />
          </Box>
          <Typography variant="h6" sx={{ mt: 2 }}>Tudo em dia!</Typography>
          <Typography color="text.secondary" variant="body2" sx={{ mt: 0.5 }}>
            Nenhuma revisão pendente. Continue marcando os tópicos que estudar.
          </Typography>
        </Card>
      ) : (
        <>
          <Group title="Atrasadas" items={due.filter((r) => r.due < today)} onComplete={onComplete} />
          <Group title="Para hoje" items={due.filter((r) => r.due >= today)} onComplete={onComplete} />
        </>
      )}
    </Box>
  )
}
