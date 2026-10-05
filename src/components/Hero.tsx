import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { weightedProgress } from '../domain/progress'
import { counts } from '../domain/tree'
import type { Concurso, Progress, Subject } from '../domain/types'
import { ProgressRing } from './ProgressRing'

function Stat({ label, value, bar }: { label: string; value: string; bar?: number }) {
  return (
    <Box
      sx={{
        p: 1.75,
        borderRadius: '16px',
        bgcolor: 'rgba(255,255,255,0.12)',
        border: '1px solid rgba(255,255,255,0.18)',
        backdropFilter: 'blur(8px)',
        minWidth: 0,
      }}
    >
      <Typography variant="caption" sx={{ opacity: 0.85, fontWeight: 600, display: 'block' }} noWrap>
        {label}
      </Typography>
      <Typography sx={{ fontSize: 22, fontWeight: 800, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </Typography>
      {bar !== undefined && (
        <Box sx={{ mt: 0.75, height: 5, borderRadius: 9, bgcolor: 'rgba(255,255,255,0.22)', overflow: 'hidden' }}>
          <Box sx={{ height: '100%', width: `${bar * 100}%`, bgcolor: '#fff', borderRadius: 9, transition: 'width 600ms' }} />
        </Box>
      )}
    </Box>
  )
}

interface Props {
  concurso: Concurso
  subjects: Subject[]
  progress: Progress
  pendingReviews: number
  /** texto extra sob o anel, ex.: aviso de emprego não escolhido */
  hint?: string
  /** subtítulo no lugar do cargo (ex.: emprego escolhido) */
  cargo?: string
}

export function Hero({ concurso, subjects, progress, pendingReviews, hint, cargo }: Props) {
  const total = weightedProgress(subjects, progress)
  const groups = concurso.groups.map((g) => ({ ...g, value: weightedProgress(subjects, progress, g.id) }))
  const shownWeight = subjects.reduce((a, s) => a + s.weight, 0)
  const c = subjects.reduce(
    (a, s) => {
      const x = counts(s, progress)
      return { done: a.done + x.done, total: a.total + x.total }
    },
    { done: 0, total: 0 },
  )
  const pct = Math.round(total * 100)
  const message =
    pct === 0 ? 'Bora começar? Marque o primeiro tópico estudado.'
    : pct < 30 ? 'Bom começo. Constância vale mais que intensidade.'
    : pct < 70 ? 'Você já passou da largada. Mantenha o ritmo!'
    : pct < 100 ? 'Reta final. Agora é revisão e questões.'
    : 'Edital fechado! Hora de simulados.'

  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: { xs: '24px', sm: '28px' },
        p: { xs: 2.5, sm: 4 },
        color: '#fff',
        background: concurso.look.gradient,
        boxShadow: `0 20px 40px -20px ${concurso.look.glow}`,
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 85% 15%, rgba(255,255,255,0.22), transparent 40%), radial-gradient(circle at 10% 110%, rgba(244,114,182,0.45), transparent 45%)',
          pointerEvents: 'none',
        }}
      />
      <Box sx={{ position: 'relative', display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 3, md: 5 }, alignItems: { md: 'center' } }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="overline" sx={{ opacity: 0.8 }}>
            {concurso.org} · {cargo ?? concurso.cargo}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5, mt: 0.5 }}>
            <Box sx={{ display: { xs: 'block', md: 'none' } }}>
              <ProgressRing value={pct} size={84} thickness={4} color="#fff" track="rgba(255,255,255,0.2)">
                <Typography sx={{ fontWeight: 800, fontSize: 22 }}>{pct}%</Typography>
              </ProgressRing>
            </Box>
            <Box>
              <Typography variant="h4" sx={{ fontSize: { xs: 24, sm: 32 } }}>
                Seu progresso no edital
              </Typography>
              <Typography sx={{ opacity: 0.85, mt: 0.5, fontSize: { xs: 14, sm: 15 } }}>{message}</Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' }, gap: 1.5, mt: 3 }}>
            {groups.map((g) => (
              <Stat key={g.id} label={g.label} value={`${Math.round(g.value * 100)}%`} bar={g.value} />
            ))}
            <Stat label="Tópicos estudados" value={`${c.done}/${c.total}`} />
            <Stat label="Revisões pendentes" value={String(pendingReviews)} />
          </Box>
        </Box>
        <Box sx={{ display: { xs: 'none', md: 'flex' }, flexDirection: 'column', alignItems: 'center', gap: 1 }}>
          <ProgressRing value={pct} size={168} thickness={3.5} color="#fff" track="rgba(255,255,255,0.18)">
            <Typography sx={{ fontWeight: 800, fontSize: 44, letterSpacing: '-0.04em', lineHeight: 1 }}>{pct}%</Typography>
            <Typography variant="caption" sx={{ opacity: 0.8, fontWeight: 600 }}>
              da prova
            </Typography>
          </ProgressRing>
          <Typography variant="caption" sx={{ opacity: 0.7, textAlign: 'center', maxWidth: 180 }}>
            {hint ?? `ponderado pelos ${shownWeight} ${concurso.unit} do ${concurso.editalLabel.toLowerCase()}`}
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}
