import EventRepeatRounded from '@mui/icons-material/EventRepeatRounded'
import ExpandMoreRounded from '@mui/icons-material/ExpandMoreRounded'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Checkbox from '@mui/material/Checkbox'
import Chip from '@mui/material/Chip'
import Collapse from '@mui/material/Collapse'
import Divider from '@mui/material/Divider'
import FormControlLabel from '@mui/material/FormControlLabel'
import Typography from '@mui/material/Typography'
import { accentSx, subjectMeta } from '../data/subjectMeta'
import { checkState, counts, pendingCount } from '../domain/tree'
import type { Subject } from '../domain/types'
import { ProgressRing } from './ProgressRing'
import { SimuladoButton } from './SimuladoButton'
import { accentCheckboxSx, TreeItem, type TreeProps } from './TreeItem'

export function SubjectCard({ subject, ...props }: TreeProps & { subject: Subject }) {
  const { progress, expanded, visible, onToggleExpand, onToggleCheck } = props
  if (visible && !visible.has(subject.id)) return null

  const meta = subjectMeta[subject.id]
  const open = !!visible || expanded.has(subject.id)
  const { done, total } = counts(subject, progress)
  const pct = Math.round((done / total) * 100)
  const pending = pendingCount(subject, progress)
  const state = checkState(subject, progress)

  return (
    <Card
      sx={[
        accentSx(meta),
        {
          overflow: 'hidden',
          transition: 'border-color 200ms, box-shadow 200ms',
          '&:hover': { borderColor: 'var(--accent-soft)' },
        },
      ]}
    >
      <Box
        onClick={() => onToggleExpand(subject.id)}
        role="button"
        aria-expanded={open}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onToggleExpand(subject.id)
          }
        }}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: { xs: 1.5, sm: 2 },
          p: { xs: 2, sm: 2.5 },
          cursor: 'pointer',
          position: 'relative',
          '&:focus-visible': { outline: '2px solid var(--accent)', outlineOffset: -2, borderRadius: '20px' },
        }}
      >
        <Box
          sx={{
            width: { xs: 44, sm: 52 },
            height: { xs: 44, sm: 52 },
            borderRadius: '14px',
            flexShrink: 0,
            display: 'grid',
            placeItems: 'center',
            color: 'var(--accent)',
            bgcolor: 'var(--accent-tint)',
            '& svg': { fontSize: { xs: 24, sm: 28 } },
          }}
        >
          {meta.icon}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle1" sx={{ lineHeight: 1.3, fontSize: { xs: 15, sm: 17 } }}>
            {subject.title}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1, mt: 0.75 }}>
            <Chip
              size="small"
              label={subject.prova === 'P1' ? 'P1 · Básicos' : 'P2 · Específicos'}
              sx={{ bgcolor: 'var(--accent-tint)', color: 'var(--accent)' }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
              {subject.weight} itens · {done}/{total} tópicos
            </Typography>
            {pending > 0 && (
              <Chip
                size="small"
                icon={<EventRepeatRounded />}
                label={`${pending} ${pending === 1 ? 'revisão' : 'revisões'}`}
                sx={{
                  bgcolor: 'color-mix(in srgb, var(--mui-palette-warning-main) 16%, transparent)',
                  color: 'warning.main',
                  '& .MuiChip-icon': { color: 'inherit', fontSize: 14 },
                }}
              />
            )}
          </Box>
        </Box>
        <ProgressRing value={pct} size={52}>
          <Typography variant="caption" sx={{ fontWeight: 800, fontSize: pct === 100 ? 11 : 13, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
            {pct}%
          </Typography>
        </ProgressRing>
        <ExpandMoreRounded
          sx={{
            color: 'text.secondary',
            transition: 'transform 250ms',
            transform: open ? 'rotate(180deg)' : 'none',
            display: { xs: 'none', sm: 'block' },
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            bottom: 0,
            height: 3,
            width: `${pct}%`,
            bgcolor: 'var(--accent)',
            transition: 'width 600ms cubic-bezier(.2,.8,.2,1)',
            opacity: open ? 0 : 1,
          }}
        />
      </Box>

      <Collapse in={open} timeout="auto" unmountOnExit>
        <Divider />
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: { xs: 1, sm: 2 }, pt: 1 }}>
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={state === 'all'}
                indeterminate={state === 'some'}
                onChange={() => onToggleCheck(subject)}
                sx={accentCheckboxSx}
              />
            }
            label={<Typography variant="body2" sx={{ fontWeight: 600 }}>Matéria inteira</Typography>}
            sx={{ ml: 0 }}
          />
          <SimuladoButton nodeId={subject.id} variant="button" />
        </Box>
        <Box role="tree" sx={{ px: { xs: 0.5, sm: 1.5 }, pb: 1.5, pt: 0.5 }}>
          {subject.children.map((c) => (
            <TreeItem key={c.id} node={c} {...props} />
          ))}
        </Box>
      </Collapse>
    </Card>
  )
}
