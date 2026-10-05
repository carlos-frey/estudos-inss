import CloudDoneRounded from '@mui/icons-material/CloudDoneRounded'
import CloudOffRounded from '@mui/icons-material/CloudOffRounded'
import CloudSyncRounded from '@mui/icons-material/CloudSyncRounded'
import DownloadRounded from '@mui/icons-material/DownloadRounded'
import LogoutRounded from '@mui/icons-material/LogoutRounded'
import MoreVertRounded from '@mui/icons-material/MoreVertRounded'
import UploadRounded from '@mui/icons-material/UploadRounded'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useRef, useState } from 'react'
import { CLIENT_ID } from '../storage/gdrive'

export type SyncStatus = 'off' | 'idle' | 'syncing' | 'error'

interface Props {
  status: SyncStatus
  onConnect: () => void
  onDisconnect: () => void
  onSyncNow: () => void
  onExport: () => void
  onImport: (file: File) => void
}

export function SyncControls({ status, onConnect, onDisconnect, onSyncNow, onExport, onImport }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  const close = () => setAnchor(null)

  return (
    <>
      {CLIENT_ID && status !== 'off' && (
        <Tooltip title={status === 'error' ? 'Falha ao sincronizar. Tentar de novo' : status === 'syncing' ? 'Sincronizando…' : 'Sincronizado com o Google Drive'}>
          <IconButton onClick={onSyncNow} aria-label="Sincronizar">
            {status === 'syncing' ? (
              <CircularProgress size={20} />
            ) : status === 'error' ? (
              <CloudSyncRounded color="warning" />
            ) : (
              <CloudDoneRounded color="success" />
            )}
          </IconButton>
        </Tooltip>
      )}
      <IconButton onClick={(e) => setAnchor(e.currentTarget)} aria-label="Mais opções">
        <MoreVertRounded />
      </IconButton>
      <Menu anchorEl={anchor} open={!!anchor} onClose={close} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}>
        {CLIENT_ID &&
          (status === 'off' ? (
            <MenuItem onClick={() => (close(), onConnect())}>
              <ListItemIcon><CloudOffRounded fontSize="small" /></ListItemIcon>
              <ListItemText primary="Sincronizar com Google Drive" secondary="Use em vários aparelhos" />
            </MenuItem>
          ) : (
            <MenuItem onClick={() => (close(), onDisconnect())}>
              <ListItemIcon><LogoutRounded fontSize="small" /></ListItemIcon>
              <ListItemText primary="Desconectar do Drive" />
            </MenuItem>
          ))}
        {CLIENT_ID && <Divider />}
        <MenuItem onClick={() => (close(), onExport())}>
          <ListItemIcon><DownloadRounded fontSize="small" /></ListItemIcon>
          <ListItemText primary="Exportar progresso" />
        </MenuItem>
        <MenuItem onClick={() => (close(), fileRef.current?.click())}>
          <ListItemIcon><UploadRounded fontSize="small" /></ListItemIcon>
          <ListItemText primary="Importar progresso" />
        </MenuItem>
        <Divider />
        <Typography variant="caption" color="text.secondary" sx={{ px: 2, py: 0.5, display: 'block' }}>
          O progresso fica salvo neste navegador.
        </Typography>
      </Menu>
      <input
        ref={fileRef}
        type="file"
        accept="application/json,.json"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) onImport(f)
          e.target.value = ''
        }}
      />
    </>
  )
}
