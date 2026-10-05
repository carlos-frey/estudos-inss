import SearchIcon from '@mui/icons-material/Search'
import AppBar from '@mui/material/AppBar'
import Badge from '@mui/material/Badge'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import InputAdornment from '@mui/material/InputAdornment'
import Snackbar from '@mui/material/Snackbar'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import TextField from '@mui/material/TextField'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ProgressHeader } from './components/ProgressHeader'
import { ReviewsPanel } from './components/ReviewsPanel'
import { SyncControls, type SyncStatus } from './components/SyncControls'
import { TreeItem } from './components/TreeItem'
import { subjects } from './data/edital-2022'
import { matching } from './data/lookup'
import { mergeProgress } from './domain/merge'
import { completeReview, dueReviews, toggle } from './domain/tree'
import type { Progress, TreeNode } from './domain/types'
import * as drive from './storage/gdrive'
import { exportProgress, importProgress, loadExpanded, loadProgress, saveExpanded, saveProgress } from './storage/local'

export default function App() {
  const [progress, setProgress] = useState<Progress>(loadProgress)
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(loadExpanded()))
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState(0)
  const [status, setStatus] = useState<SyncStatus>('off')
  const [toast, setToast] = useState('')
  const progressRef = useRef(progress)
  const syncTimer = useRef<number>(undefined)

  useEffect(() => {
    progressRef.current = progress
    saveProgress(progress)
  }, [progress])
  useEffect(() => saveExpanded([...expanded]), [expanded])

  const runSync = useCallback(async () => {
    setStatus('syncing')
    try {
      const merged = await drive.sync(progressRef.current)
      setProgress((cur) => mergeProgress(cur, merged))
      setStatus('idle')
    } catch (e) {
      console.error(e)
      setStatus('error')
    }
  }, [])

  const scheduleSync = useCallback(() => {
    if (status === 'off') return
    window.clearTimeout(syncTimer.current)
    syncTimer.current = window.setTimeout(runSync, 5000)
  }, [status, runSync])

  const update = useCallback(
    (fn: (p: Progress) => Progress) => {
      setProgress(fn)
      scheduleSync()
    },
    [scheduleSync],
  )

  // reconecta sozinho se o usuário já autorizou antes (o script do GIS carrega async)
  useEffect(() => {
    if (!drive.CLIENT_ID || !drive.wasConnected()) return
    let tries = 0
    const t = window.setInterval(() => {
      if (window.google?.accounts || ++tries > 20) {
        window.clearInterval(t)
        if (window.google?.accounts) runSync()
      }
    }, 250)
    return () => window.clearInterval(t)
  }, [runSync])

  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === 'hidden' && status !== 'off') runSync()
    }
    document.addEventListener('visibilitychange', onHide)
    return () => document.removeEventListener('visibilitychange', onHide)
  }, [status, runSync])

  const visible = useMemo(() => matching(query), [query])
  const reviewCount = dueReviews(progress).length

  const toggleExpand = (id: string) =>
    setExpanded((s) => {
      const n = new Set(s)
      if (!n.delete(id)) n.add(id)
      return n
    })

  return (
    <>
      <AppBar position="sticky" color="primary" enableColorOnDark>
        <Toolbar sx={{ gap: 1 }}>
          <Typography variant="h6" sx={{ flex: 1 }}>
            INSS Tracker
          </Typography>
          <SyncControls
            status={status}
            onConnect={async () => {
              try {
                await drive.connect()
                await runSync()
              } catch (e) {
                setToast(`Não foi possível conectar ao Google: ${(e as Error).message}`)
              }
            }}
            onDisconnect={() => {
              drive.disconnect()
              setStatus('off')
            }}
            onSyncNow={runSync}
            onExport={() => exportProgress(progress)}
            onImport={async (f) => {
              try {
                const merged = await importProgress(f, progress)
                update(() => merged)
                setToast('Progresso importado')
              } catch (e) {
                setToast((e as Error).message)
              }
            }}
          />
        </Toolbar>
        <Tabs value={tab} onChange={(_, v: number) => setTab(v)} textColor="inherit" indicatorColor="secondary" variant="fullWidth">
          <Tab label="Conteúdo" />
          <Tab
            label={
              <Badge badgeContent={reviewCount} color="warning" max={99} sx={{ '& .MuiBadge-badge': { right: -14 } }}>
                Revisões
              </Badge>
            }
          />
        </Tabs>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 2, px: { xs: 1, sm: 3 } }}>
        <ProgressHeader progress={progress} />
        {tab === 0 ? (
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Buscar tópico…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{ mb: 1 }}
            />
            {subjects.map((s) => (
              <TreeItem
                key={s.id}
                node={s}
                depth={0}
                progress={progress}
                expanded={expanded}
                visible={visible}
                forceOpen={!!visible}
                onToggleExpand={toggleExpand}
                onToggleCheck={(n: TreeNode) => update((p) => toggle(n, p))}
              />
            ))}
          </Box>
        ) : (
          <ReviewsPanel progress={progress} onComplete={(id, key) => update((p) => completeReview(p, id, key))} />
        )}
      </Container>
      <Snackbar open={!!toast} autoHideDuration={4000} onClose={() => setToast('')} message={toast} />
    </>
  )
}
