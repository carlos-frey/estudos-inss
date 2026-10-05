import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import type { ReactNode } from 'react'

interface Props {
  value: number // 0..100
  size?: number
  thickness?: number
  color?: string
  track?: string
  children?: ReactNode
}

export function ProgressRing({ value, size = 56, thickness = 4.5, color = 'var(--accent)', track, children }: Props) {
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex', width: size, height: size, flexShrink: 0 }}>
      <CircularProgress
        variant="determinate"
        value={100}
        size={size}
        thickness={thickness}
        sx={{ color: track ?? `color-mix(in srgb, ${color} 16%, transparent)`, position: 'absolute' }}
      />
      <CircularProgress
        variant="determinate"
        value={value}
        size={size}
        thickness={thickness}
        sx={{ color, '& .MuiCircularProgress-circle': { strokeLinecap: 'round', transition: 'stroke-dashoffset 600ms cubic-bezier(.2,.8,.2,1)' } }}
      />
      <Box sx={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        {children}
      </Box>
    </Box>
  )
}
