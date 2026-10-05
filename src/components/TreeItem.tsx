import ChevronRightRounded from '@mui/icons-material/ChevronRightRounded'
import EventRepeatRounded from '@mui/icons-material/EventRepeatRounded'
import OpenInNewRounded from '@mui/icons-material/OpenInNewRounded'
import WarningAmberRounded from '@mui/icons-material/WarningAmberRounded'
import Box from '@mui/material/Box'
import Checkbox from '@mui/material/Checkbox'
import Collapse from '@mui/material/Collapse'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { checkState, counts, pendingCount } from '../domain/tree'
import type { Progress, TreeNode } from '../domain/types'
import { Highlight } from './Highlight'
import { SimuladoButton } from './SimuladoButton'

export interface TreeProps {
  progress: Progress
  expanded: Set<string>
  visible: Set<string> | null
  query: string
  onToggleExpand: (id: string) => void
  onToggleCheck: (node: TreeNode) => void
}

export const accentCheckboxSx = {
  p: 0.75,
  color: 'text.disabled',
  '&.Mui-checked, &.MuiCheckbox-indeterminate': { color: 'var(--accent)' },
} as const

export function TreeItem({ node, ...props }: TreeProps & { node: TreeNode }) {
  const { progress, expanded, visible, query, onToggleExpand, onToggleCheck } = props
  if (visible && !visible.has(node.id)) return null

  const hasKids = !!node.children?.length
  const state = checkState(node, progress)
  const open = hasKids && (!!visible || expanded.has(node.id))
  const { done, total } = counts(node, progress)
  const pending = hasKids ? 0 : pendingCount(node, progress)
  const finished = state === 'all'

  return (
    <Box role="treeitem" aria-expanded={hasKids ? open : undefined}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.25,
          minHeight: 40,
          pr: 0.5,
          borderRadius: '10px',
          transition: 'background-color 150ms',
          '&:hover': { bgcolor: 'action.hover' },
          '@media (hover: hover)': {
            '& .row-actions': { opacity: 0, transition: 'opacity 150ms' },
            '&:hover .row-actions, &:focus-within .row-actions': { opacity: 1 },
          },
        }}
      >
        {hasKids ? (
          <IconButton size="small" onClick={() => onToggleExpand(node.id)} aria-label={open ? 'Recolher' : 'Expandir'}>
            <ChevronRightRounded
              fontSize="small"
              sx={{ transition: 'transform 200ms', transform: open ? 'rotate(90deg)' : 'none', color: 'text.secondary' }}
            />
          </IconButton>
        ) : (
          <Box sx={{ width: 30, flexShrink: 0 }} />
        )}
        <Checkbox
          size="small"
          checked={finished}
          indeterminate={state === 'some'}
          onChange={() => onToggleCheck(node)}
          slotProps={{ input: { 'aria-label': node.title } }}
          sx={accentCheckboxSx}
        />
        <Typography
          variant="body2"
          onClick={() => (hasKids ? onToggleExpand(node.id) : onToggleCheck(node))}
          sx={{
            flex: 1,
            minWidth: 0,
            py: 0.75,
            cursor: 'pointer',
            userSelect: 'none',
            fontWeight: hasKids ? 600 : 500,
            color: finished && !hasKids ? 'text.secondary' : 'text.primary',
            overflowWrap: 'anywhere',
            transition: 'color 150ms',
          }}
        >
          <Highlight text={node.title} query={query} />
        </Typography>

        {node.outdated && (
          <Tooltip title="Pode ter mudado desde 2022: confira no edital novo">
            <WarningAmberRounded sx={{ fontSize: 18, color: 'warning.main', mx: 0.5 }} />
          </Tooltip>
        )}
        {pending > 0 && (
          <Tooltip title="Revisão pendente">
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                px: 0.75,
                py: 0.25,
                mx: 0.5,
                borderRadius: 99,
                bgcolor: 'color-mix(in srgb, var(--mui-palette-warning-main) 16%, transparent)',
                color: 'warning.main',
              }}
            >
              <EventRepeatRounded sx={{ fontSize: 14 }} />
              <Typography variant="caption" sx={{ fontWeight: 700, lineHeight: 1, display: { xs: 'none', sm: 'inline' } }}>
                revisar
              </Typography>
            </Box>
          </Tooltip>
        )}
        {hasKids && (
          <Typography
            variant="caption"
            sx={{
              px: 1,
              py: 0.25,
              mx: 0.5,
              borderRadius: 99,
              fontWeight: 700,
              fontVariantNumeric: 'tabular-nums',
              bgcolor: finished ? 'var(--accent-tint)' : 'action.hover',
              color: finished ? 'var(--accent)' : 'text.secondary',
            }}
          >
            {done}/{total}
          </Typography>
        )}
        <Box className="row-actions" sx={{ display: 'flex', alignItems: 'center' }}>
          {node.lawUrl && (
            <Tooltip title="Ler a lei no Planalto">
              <IconButton size="small" component="a" href={node.lawUrl} target="_blank" rel="noopener noreferrer" aria-label="Abrir lei">
                <OpenInNewRounded sx={{ fontSize: 17 }} />
              </IconButton>
            </Tooltip>
          )}
          <SimuladoButton nodeId={node.id} />
        </Box>
      </Box>

      {hasKids && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <Box role="group" sx={{ ml: '15px', pl: { xs: 0.5, sm: 1 }, borderLeft: '2px solid var(--accent-tint)' }}>
            {node.children!.map((c) => (
              <TreeItem key={c.id} node={c} {...props} />
            ))}
          </Box>
        </Collapse>
      )}
    </Box>
  )
}
