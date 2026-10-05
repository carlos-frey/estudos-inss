import ExpandMore from '@mui/icons-material/ExpandMore'
import ChevronRight from '@mui/icons-material/ChevronRight'
import OpenInNew from '@mui/icons-material/OpenInNew'
import WarningAmber from '@mui/icons-material/WarningAmber'
import Badge from '@mui/material/Badge'
import Box from '@mui/material/Box'
import Checkbox from '@mui/material/Checkbox'
import Chip from '@mui/material/Chip'
import Collapse from '@mui/material/Collapse'
import IconButton from '@mui/material/IconButton'
import LinearProgress from '@mui/material/LinearProgress'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import AccessTime from '@mui/icons-material/AccessTime'
import { checkState, fraction, pendingCount } from '../domain/tree'
import type { Progress, Subject, TreeNode } from '../domain/types'
import { SimuladoButton } from './SimuladoButton'

interface Props {
  node: TreeNode | Subject
  depth: number
  progress: Progress
  expanded: Set<string>
  visible: Set<string> | null
  forceOpen: boolean
  onToggleExpand: (id: string) => void
  onToggleCheck: (node: TreeNode) => void
}

export function TreeItem(props: Props) {
  const { node, depth, progress, expanded, visible, forceOpen, onToggleExpand, onToggleCheck } = props
  if (visible && !visible.has(node.id)) return null

  const hasKids = !!node.children?.length
  const state = checkState(node, progress)
  const pct = Math.round(fraction(node, progress) * 100)
  const pending = pendingCount(node, progress)
  const open = hasKids && (forceOpen || expanded.has(node.id))
  const subject = depth === 0 ? (node as Subject) : null

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          pl: { xs: depth * 1.5, sm: depth * 3 },
          py: depth === 0 ? 0.5 : 0,
          borderBottom: depth === 0 ? 1 : 0,
          borderColor: 'divider',
          '&:hover': { bgcolor: 'action.hover' },
        }}
      >
        <IconButton
          size="small"
          onClick={() => onToggleExpand(node.id)}
          disabled={!hasKids}
          sx={{ visibility: hasKids ? 'visible' : 'hidden' }}
          aria-label={open ? 'Recolher' : 'Expandir'}
          aria-expanded={open}
        >
          {open ? <ExpandMore /> : <ChevronRight />}
        </IconButton>
        <Checkbox
          size={depth === 0 ? 'medium' : 'small'}
          checked={state === 'all'}
          indeterminate={state === 'some'}
          onChange={() => onToggleCheck(node)}
          slotProps={{ input: { 'aria-label': node.title } }}
          sx={{ p: 0.5 }}
        />
        <Box
          sx={{ flex: 1, minWidth: 0, cursor: hasKids ? 'pointer' : 'default', py: 0.5 }}
          onClick={() => hasKids && onToggleExpand(node.id)}
        >
          <Typography
            variant={depth === 0 ? 'subtitle1' : 'body2'}
            sx={{
              fontWeight: depth <= 1 ? 600 : 400,
              textDecoration: state === 'all' && !hasKids ? 'line-through' : 'none',
              color: state === 'all' && !hasKids ? 'text.secondary' : 'text.primary',
              overflowWrap: 'anywhere',
            }}
          >
            {node.title}
          </Typography>
          {subject && (
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.5 }}>
              <Chip size="small" label={subject.prova} />
              <Typography variant="caption" color="text.secondary">
                {subject.weight} itens
              </Typography>
            </Box>
          )}
        </Box>
        {hasKids && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: { xs: 56, sm: 110 } }}>
            <LinearProgress
              variant="determinate"
              value={pct}
              sx={{ flex: 1, display: { xs: 'none', sm: 'block' }, height: 6, borderRadius: 3 }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ minWidth: 32, textAlign: 'right' }}>
              {pct}%
            </Typography>
          </Box>
        )}
        {pending > 0 && (
          <Tooltip title={`${pending} revisão(ões) pendente(s)`}>
            <Badge badgeContent={pending} color="warning" max={99} sx={{ mx: 1 }}>
              <AccessTime fontSize="small" />
            </Badge>
          </Tooltip>
        )}
        {node.outdated && (
          <Tooltip title="Conteúdo possivelmente desatualizado: confira no edital novo">
            <WarningAmber fontSize="small" color="warning" />
          </Tooltip>
        )}
        {node.lawUrl && (
          <Tooltip title="Abrir lei (planalto.gov.br)">
            <IconButton size="small" component="a" href={node.lawUrl} target="_blank" rel="noopener noreferrer" aria-label="Abrir lei">
              <OpenInNew fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        <SimuladoButton nodeId={node.id} />
      </Box>
      {hasKids && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          {node.children!.map((c) => (
            <TreeItem key={c.id} {...props} node={c} depth={depth + 1} />
          ))}
        </Collapse>
      )}
    </Box>
  )
}
