import Box from '@mui/material/Box'

export function Highlight({ text, query }: { text: string; query: string }) {
  const q = query.trim().toLowerCase()
  const i = q ? text.toLowerCase().indexOf(q) : -1
  if (i < 0) return <>{text}</>
  return (
    <>
      {text.slice(0, i)}
      <Box component="mark" sx={{ bgcolor: 'var(--accent-soft)', color: 'inherit', borderRadius: '4px', px: 0.25 }}>
        {text.slice(i, i + q.length)}
      </Box>
      {text.slice(i + q.length)}
    </>
  )
}
