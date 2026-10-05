import CloudDoneRounded from '@mui/icons-material/CloudDoneRounded'
import CloudOffRounded from '@mui/icons-material/CloudOffRounded'
import CloudSyncRounded from '@mui/icons-material/CloudSyncRounded'
import CloudUploadRounded from '@mui/icons-material/CloudUploadRounded'
import DownloadRounded from '@mui/icons-material/DownloadRounded'
import LogoutRounded from '@mui/icons-material/LogoutRounded'
import MoreVertRounded from '@mui/icons-material/MoreVertRounded'
import SyncRounded from '@mui/icons-material/SyncRounded'
import UploadRounded from '@mui/icons-material/UploadRounded'
import Badge from '@mui/material/Badge'
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

/** off: não conectado · reauth: conectado, mas a sessão do Google expirou e precisa de um clique */
export type SyncStatus = 'off' | 'idle' | 'syncing' | 'error' | 'reauth'

interface Props {
  status: SyncStatus
  lastSync?: number
  onConnect: () => void
  onDisconnect: () => void
  onSyncNow: () => void
  onExport: () => void
  onImport: (file: File) => void
}

const fmtTime = (t: number) => new Date(t).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

export function SyncControls({ status, lastSync, onConnect, onDisconnect, onSyncNow, onExport, onImport }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  const close = () => setAnchor(null)

  const cloud = (() => {
    switch (status) {
      case 'off':
        return { tip: 'Salvar na nuvem com o Google Drive', icon: <CloudUploadRounded />, onClick: onConnect }
      case 'syncing':
        return { tip: 'Sincronizando…', icon: <CircularProgress size={20} />, onClick: onSyncNow }
      case 'reauth':
        return {
          tip: 'A sessão do Google expirou. Clique para reconectar e sincronizar',
          icon: (
            <Badge variant="dot" color="warning" overlap="circular">
              <CloudSyncRounded color="warning" />
            </Badge>
          ),
          onClick: onSyncNow,
        }
      case 'error':
        return { tip: 'Falha ao sincronizar. Clique para tentar de novo', icon: <CloudOffRounded color="error" />, onClick: onSyncNow }
      default:
        return {
          tip: `Sincronizado com o Google Drive${lastSync ? ` às ${fmtTime(lastSync)}` : ''}. Clique para sincronizar agora`,
          icon: <CloudDoneRounded color="success" />,
          onClick: onSyncNow,
        }
    }
  })()

  return (
    <>
      {CLIENT_ID && (
        <Tooltip title={cloud.tip}>
          <IconButton onClick={cloud.onClick} aria-label={cloud.tip}>
            {cloud.icon}
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
              <ListItemIcon><CloudUploadRounded fontSize="small" /></ListItemIcon>
              <ListItemText primary="Salvar no Google Drive" secondary="Sincroniza entre seus aparelhos" />
            </MenuItem>
          ) : (
            [
              <MenuItem key="sync" onClick={() => (close(), onSyncNow())}>
                <ListItemIcon><SyncRounded fontSize="small" /></ListItemIcon>
                <ListItemText primary="Sincronizar agora" secondary={lastSync ? `Última vez às ${fmtTime(lastSync)}` : undefined} />
              </MenuItem>,
              <MenuItem key="out" onClick={() => (close(), onDisconnect())}>
                <ListItemIcon><LogoutRounded fontSize="small" /></ListItemIcon>
                <ListItemText primary="Desconectar do Google Drive" secondary="O progresso continua salvo neste navegador" />
              </MenuItem>,
            ]
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
        <Typography variant="caption" color="text.secondary" sx={{ px: 2, py: 0.5, display: 'block', maxWidth: 260 }}>
          {status === 'off'
            ? 'O progresso fica salvo neste navegador.'
            : 'Salvo neste navegador e no seu Google Drive, numa pasta oculta só do app.'}
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
