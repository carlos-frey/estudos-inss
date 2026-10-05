import QuizOutlined from '@mui/icons-material/QuizOutlined'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'

// Ação do simulado será implementada depois; por ora fica desabilitado em todos os níveis.
export function SimuladoButton({ nodeId }: { nodeId: string }) {
  return (
    <Tooltip title="Simulado (em breve)">
      <span>
        <IconButton size="small" disabled data-node-id={nodeId} aria-label="Simulado (em breve)">
          <QuizOutlined fontSize="small" />
        </IconButton>
      </span>
    </Tooltip>
  )
}
