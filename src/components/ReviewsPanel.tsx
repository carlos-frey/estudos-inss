import Checkbox from '@mui/material/Checkbox'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Typography from '@mui/material/Typography'
import { lookup } from '../data/lookup'
import { dueReviews } from '../domain/tree'
import type { Progress } from '../domain/types'

const LABEL = { d1: '24 horas', d7: '7 dias', d30: '30 dias' }

interface Props {
  progress: Progress
  onComplete: (leafId: string, key: 'd1' | 'd7' | 'd30') => void
}

export function ReviewsPanel({ progress, onComplete }: Props) {
  const due = dueReviews(progress)
  if (!due.length) {
    return (
      <Typography color="text.secondary" sx={{ p: 3, textAlign: 'center' }}>
        Nenhuma revisão pendente. Ao marcar um tópico, as revisões de 24h, 7d e 30d aparecem aqui quando vencerem.
      </Typography>
    )
  }
  return (
    <List>
      {due.map((r) => {
        const entry = lookup.get(r.leafId)
        return (
          <ListItem key={`${r.leafId}.${r.key}`} disablePadding divider>
            <ListItemButton onClick={() => onComplete(r.leafId, r.key)}>
              <ListItemIcon>
                <Checkbox edge="start" checked={false} tabIndex={-1} disableRipple />
              </ListItemIcon>
              <ListItemText
                primary={entry?.node.title ?? r.leafId}
                secondary={`${entry?.path.slice(0, 2).join(' › ')} · revisão de ${LABEL[r.key]} · venceu em ${r.due.split('-').reverse().join('/')}`}
                slotProps={{ primary: { sx: { overflowWrap: 'anywhere' } } }}
              />
            </ListItemButton>
          </ListItem>
        )
      })}
    </List>
  )
}
