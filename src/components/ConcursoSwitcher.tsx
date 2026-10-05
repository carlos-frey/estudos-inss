import CheckRounded from '@mui/icons-material/CheckRounded'
import GridViewRounded from '@mui/icons-material/GridViewRounded'
import UnfoldMoreRounded from '@mui/icons-material/UnfoldMoreRounded'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import { useState } from 'react'
import { concursos } from '../data/registry'

interface Props {
  current: string | null
  onSelect: (id: string | null) => void
}

export function ConcursoSwitcher({ current, onSelect }: Props) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)
  const c = concursos.find((x) => x.id === current)
  const pick = (id: string | null) => {
    setAnchor(null)
    onSelect(id)
  }
  return (
    <>
      <Button
        onClick={(e) => setAnchor(e.currentTarget)}
        endIcon={<UnfoldMoreRounded />}
        sx={{ color: 'text.primary', bgcolor: 'action.hover', px: 1.75, minWidth: 0, '&:hover': { bgcolor: 'action.selected' } }}
        aria-label="Trocar de concurso"
      >
        {c ? c.name : 'Concursos'}
      </Button>
      <Menu anchorEl={anchor} open={!!anchor} onClose={() => setAnchor(null)}>
        {concursos.map((x) => (
          <MenuItem key={x.id} selected={x.id === current} onClick={() => pick(x.id)}>
            <ListItemIcon>{x.id === current ? <CheckRounded fontSize="small" /> : null}</ListItemIcon>
            <ListItemText primary={x.name} secondary={`${x.cargo} · ${x.banca}`} />
          </MenuItem>
        ))}
        <Divider />
        <MenuItem onClick={() => pick(null)}>
          <ListItemIcon><GridViewRounded fontSize="small" /></ListItemIcon>
          <ListItemText primary="Todos os concursos" />
        </MenuItem>
      </Menu>
    </>
  )
}
