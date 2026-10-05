import Box from '@mui/material/Box'
import LinearProgress from '@mui/material/LinearProgress'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import { subjects } from '../data/edital-2022'
import { weightedProgress } from '../domain/progress'
import type { Progress } from '../domain/types'

function Bar({ label, value, big }: { label: string; value: number; big?: boolean }) {
  const pct = Math.round(value * 100)
  return (
    <Box sx={{ flex: 1, minWidth: 140 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant={big ? 'h6' : 'body2'}>{label}</Typography>
        <Typography variant={big ? 'h6' : 'body2'}>{pct}%</Typography>
      </Box>
      <LinearProgress variant="determinate" value={pct} sx={{ height: big ? 12 : 8, borderRadius: 6 }} />
    </Box>
  )
}

export function ProgressHeader({ progress }: { progress: Progress }) {
  return (
    <Paper variant="outlined" sx={{ p: 2, display: 'flex', flexWrap: 'wrap', gap: 3 }}>
      <Box sx={{ flexBasis: '100%' }}>
        <Bar big label="Progresso geral (ponderado pela prova)" value={weightedProgress(subjects, progress)} />
      </Box>
      <Bar label="P1 · Básicos (50 itens)" value={weightedProgress(subjects, progress, 'P1')} />
      <Bar label="P2 · Específicos (70 itens)" value={weightedProgress(subjects, progress, 'P2')} />
    </Paper>
  )
}
