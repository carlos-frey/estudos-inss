import WorkRounded from '@mui/icons-material/WorkRounded'
import Autocomplete from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Chip from '@mui/material/Chip'
import ListSubheader from '@mui/material/ListSubheader'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import type { Emprego } from '../domain/types'

const NIVEL = { medio: 'Nível médio', tecnico: 'Nível técnico', superior: 'Nível superior' }

interface Props {
  empregos: Emprego[]
  value?: string
  onChange: (id: string | undefined) => void
  weight: number
}

export function EmpregoPicker({ empregos, value, onChange, weight }: Props) {
  const selected = empregos.find((e) => e.id === value) ?? null
  return (
    <Card
      sx={{
        mt: 2,
        p: { xs: 2, sm: 2.5 },
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { sm: 'center' },
        gap: 2,
        borderStyle: selected ? 'solid' : 'dashed',
        borderColor: selected ? 'divider' : 'primary.main',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, minWidth: 0 }}>
        <Box sx={{ width: 44, height: 44, borderRadius: '14px', display: 'grid', placeItems: 'center', flexShrink: 0, bgcolor: 'color-mix(in srgb, var(--mui-palette-primary-main) 12%, transparent)', color: 'primary.main' }}>
          <WorkRounded />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            {selected ? 'Seu emprego' : 'Escolha seu emprego'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Os conhecimentos do emprego valem {weight} pontos, a maior parte da prova.
            {selected?.retificado && ' Conteúdo conforme a Retificação nº 1.'}
          </Typography>
        </Box>
      </Box>
      <Autocomplete
        options={empregos}
        value={selected}
        onChange={(_, e) => onChange(e?.id)}
        groupBy={(e) => `${e.cargo} · ${NIVEL[e.nivel]}`}
        getOptionLabel={(e) => `${String(e.code).padStart(2, '0')} · ${e.title}`}
        renderGroup={(params) => {
          const [cargo, nivel] = params.group.split(' · ')
          return (
            <li key={params.key}>
              <ListSubheader sx={{ top: -8, lineHeight: 1.35, py: 1.25, bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', color: 'text.primary' }}>{cargo}</Typography>
                <Typography variant="caption" color="text.secondary">{nivel}</Typography>
              </ListSubheader>
              <Box component="ul" sx={{ p: 0 }}>{params.children}</Box>
            </li>
          )
        }}
        isOptionEqualToValue={(a, b) => a.id === b.id}
        renderOption={({ key, ...props }, e) => (
          <li key={key} {...props}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontVariantNumeric: 'tabular-nums', minWidth: 20 }}>
                {String(e.code).padStart(2, '0')}
              </Typography>
              <Typography variant="body2" sx={{ flex: 1 }}>{e.title}</Typography>
              {e.retificado && <Chip size="small" label="retificado" variant="outlined" />}
            </Box>
          </li>
        )}
        renderInput={(params) => <TextField {...params} size="small" placeholder="Buscar emprego…" />}
        sx={{ width: { xs: '100%', sm: 360 }, flexShrink: 0, '& .MuiOutlinedInput-root': { borderRadius: 99, bgcolor: 'background.paper' } }}
        slotProps={{ listbox: { sx: { maxHeight: 420 } } }}
      />
    </Card>
  )
}
