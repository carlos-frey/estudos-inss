import CloudDone from '@mui/icons-material/CloudDone'
import CloudOff from '@mui/icons-material/CloudOff'
import CloudSync from '@mui/icons-material/CloudSync'
import Download from '@mui/icons-material/Download'
import Upload from '@mui/icons-material/Upload'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Button from '@mui/material/Button'
import { useRef } from 'react'
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
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      {CLIENT_ID &&
        (status === 'off' ? (
          <Button color="inherit" size="small" startIcon={<CloudOff />} onClick={onConnect}>
            Drive
          </Button>
        ) : (
          <>
            <Tooltip title={status === 'error' ? 'Erro no sync, tentar de novo' : 'Sincronizar agora'}>
              <IconButton color="inherit" onClick={onSyncNow} aria-label="Sincronizar">
                {status === 'syncing' ? (
                  <CircularProgress size={22} color="inherit" />
                ) : status === 'error' ? (
                  <CloudSync color="warning" />
                ) : (
                  <CloudDone />
                )}
              </IconButton>
            </Tooltip>
            <Button color="inherit" size="small" onClick={onDisconnect}>
              Sair
            </Button>
          </>
        ))}
      <Tooltip title="Exportar progresso (.json)">
        <IconButton color="inherit" onClick={onExport} aria-label="Exportar">
          <Download />
        </IconButton>
      </Tooltip>
      <Tooltip title="Importar progresso (.json)">
        <IconButton color="inherit" onClick={() => fileRef.current?.click()} aria-label="Importar">
          <Upload />
        </IconButton>
      </Tooltip>
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
    </Box>
  )
}
