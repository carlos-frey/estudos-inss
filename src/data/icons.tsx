import AccountBalanceRounded from '@mui/icons-material/AccountBalanceRounded'
import AutoStoriesRounded from '@mui/icons-material/AutoStoriesRounded'
import BloodtypeRounded from '@mui/icons-material/BloodtypeRounded'
import ComputerRounded from '@mui/icons-material/ComputerRounded'
import FunctionsRounded from '@mui/icons-material/FunctionsRounded'
import GavelRounded from '@mui/icons-material/GavelRounded'
import HealthAndSafetyRounded from '@mui/icons-material/HealthAndSafetyRounded'
import PolicyRounded from '@mui/icons-material/PolicyRounded'
import VerifiedUserRounded from '@mui/icons-material/VerifiedUserRounded'
import WorkRounded from '@mui/icons-material/WorkRounded'
import type { ReactElement } from 'react'
import type { IconKey } from '../domain/types'

export const icons: Record<IconKey, ReactElement> = {
  book: <AutoStoriesRounded />,
  ethics: <VerifiedUserRounded />,
  gavel: <GavelRounded />,
  bank: <AccountBalanceRounded />,
  computer: <ComputerRounded />,
  functions: <FunctionsRounded />,
  health: <HealthAndSafetyRounded />,
  blood: <BloodtypeRounded />,
  policy: <PolicyRounded />,
  work: <WorkRounded />,
}
