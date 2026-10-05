import type { Theme } from '@mui/material/styles'
import type { Accent } from '../domain/types'

/** Define --accent / --accent-tint / --accent-soft para os descendentes, com variante no tema escuro. */
export const accentSx = (a: Accent) => (theme: Theme) => ({
  '--accent': a.light,
  '--accent-tint': `color-mix(in srgb, ${a.light} 11%, transparent)`,
  '--accent-soft': `color-mix(in srgb, ${a.light} 22%, transparent)`,
  ...theme.applyStyles('dark', {
    '--accent': a.dark,
    '--accent-tint': `color-mix(in srgb, ${a.dark} 14%, transparent)`,
    '--accent-soft': `color-mix(in srgb, ${a.dark} 26%, transparent)`,
  }),
})
