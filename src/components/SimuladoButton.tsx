import QuizRounded from '@mui/icons-material/QuizRounded'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'

// Ação do simulado será implementada depois; por ora fica desabilitado em todos os níveis.
export function SimuladoButton({ nodeId, variant = 'icon' }: { nodeId: string; variant?: 'icon' | 'button' }) {
  return (
    <Tooltip title="Simulados em breve">
      <span>
        {variant === 'button' ? (
          <Button size="small" variant="outlined" disabled startIcon={<QuizRounded />} data-node-id={nodeId}>
            Simulado
          </Button>
        ) : (
          <IconButton size="small" disabled data-node-id={nodeId} aria-label="Simulado (em breve)">
            <QuizRounded sx={{ fontSize: 18 }} />
          </IconButton>
        )}
      </span>
    </Tooltip>
  )
}
