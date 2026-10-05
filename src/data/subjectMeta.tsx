import AccountBalanceRounded from '@mui/icons-material/AccountBalanceRounded'
import AutoStoriesRounded from '@mui/icons-material/AutoStoriesRounded'
import ComputerRounded from '@mui/icons-material/ComputerRounded'
import FunctionsRounded from '@mui/icons-material/FunctionsRounded'
import GavelRounded from '@mui/icons-material/GavelRounded'
import HealthAndSafetyRounded from '@mui/icons-material/HealthAndSafetyRounded'
import VerifiedUserRounded from '@mui/icons-material/VerifiedUserRounded'
import type { Theme } from '@mui/material/styles'
import type { ReactElement } from 'react'

export interface SubjectMeta {
  short: string
  light: string
  dark: string
  icon: ReactElement
}

export const subjectMeta: Record<string, SubjectMeta> = {
  pt: { short: 'Português', light: '#E11D48', dark: '#FB7185', icon: <AutoStoriesRounded /> },
  et: { short: 'Ética', light: '#D97706', dark: '#FBBF24', icon: <VerifiedUserRounded /> },
  co: { short: 'Constitucional', light: '#059669', dark: '#34D399', icon: <GavelRounded /> },
  ad: { short: 'Administrativo', light: '#0284C7', dark: '#38BDF8', icon: <AccountBalanceRounded /> },
  inf: { short: 'Informática', light: '#7C3AED', dark: '#A78BFA', icon: <ComputerRounded /> },
  rl: { short: 'Raciocínio Lógico', light: '#EA580C', dark: '#FB923C', icon: <FunctionsRounded /> },
  es: { short: 'Seguridade Social', light: '#4F46E5', dark: '#818CF8', icon: <HealthAndSafetyRounded /> },
}

export const metaFor = (id: string): SubjectMeta => subjectMeta[id.split('.')[0]] ?? subjectMeta.es

/** Define --accent / --accent-tint para os descendentes, com variante no tema escuro. */
export const accentSx = (m: SubjectMeta) => (theme: Theme) => ({
  '--accent': m.light,
  '--accent-tint': `color-mix(in srgb, ${m.light} 11%, transparent)`,
  '--accent-soft': `color-mix(in srgb, ${m.light} 22%, transparent)`,
  ...theme.applyStyles('dark', {
    '--accent': m.dark,
    '--accent-tint': `color-mix(in srgb, ${m.dark} 14%, transparent)`,
    '--accent-soft': `color-mix(in srgb, ${m.dark} 26%, transparent)`,
  }),
})
