import DarkModeRounded from '@mui/icons-material/DarkModeRounded'
import LightModeRounded from '@mui/icons-material/LightModeRounded'
import SettingsBrightnessRounded from '@mui/icons-material/SettingsBrightnessRounded'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import { useColorScheme } from '@mui/material/styles'

const NEXT = { system: 'light', light: 'dark', dark: 'system' } as const
const LABEL = { system: 'Tema do sistema', light: 'Tema claro', dark: 'Tema escuro' }

export function ThemeToggle() {
  const { mode, setMode } = useColorScheme()
  const m = mode ?? 'system'
  return (
    <Tooltip title={`${LABEL[m]} (clique para trocar)`}>
      <IconButton onClick={() => setMode(NEXT[m])} aria-label="Trocar tema">
        {m === 'light' ? <LightModeRounded /> : m === 'dark' ? <DarkModeRounded /> : <SettingsBrightnessRounded />}
      </IconButton>
    </Tooltip>
  )
}
