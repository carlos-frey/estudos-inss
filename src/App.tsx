import EventRepeatRounded from '@mui/icons-material/EventRepeatRounded'
import ListAltRounded from '@mui/icons-material/ListAltRounded'
import SchoolRounded from '@mui/icons-material/SchoolRounded'
import SearchRounded from '@mui/icons-material/SearchRounded'
import SearchOffRounded from '@mui/icons-material/SearchOffRounded'
import UnfoldLessRounded from '@mui/icons-material/UnfoldLessRounded'
import UnfoldMoreRounded from '@mui/icons-material/UnfoldMoreRounded'
import AppBar from '@mui/material/AppBar'
import Badge from '@mui/material/Badge'
import BottomNavigation from '@mui/material/BottomNavigation'
import BottomNavigationAction from '@mui/material/BottomNavigationAction'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Container from '@mui/material/Container'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Paper from '@mui/material/Paper'
import Snackbar from '@mui/material/Snackbar'
import TextField from '@mui/material/TextField'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Toolbar from '@mui/material/Toolbar'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Hero } from './components/Hero'
import { ReviewsPanel } from './components/ReviewsPanel'
import { SubjectCard } from './components/SubjectCard'
import { SyncControls, type SyncStatus } from './components/SyncControls'
import { ThemeToggle } from './components/ThemeToggle'
import { subjects } from './data/edital-2022'
import { matching } from './data/lookup'
import { subjectMeta } from './data/subjectMeta'
import { mergeProgress } from './domain/merge'
import { completeReview, dueReviews, fraction, toggle } from './domain/tree'
import type { Progress, TreeNode } from './domain/types'
import * as drive from './storage/gdrive'
import { exportProgress, importProgress, loadExpanded, loadProgress, saveExpanded, saveProgress } from './storage/local'

type Prova = 'all' | 'P1' | 'P2'

function allGroupIds(): string[] {
  const out: string[] = []
  const walk = (n: TreeNode) => {
    if (n.children?.length) {
      out.push(n.id)
      n.children.forEach(walk)
    }
  }
  subjects.forEach(walk)
  return out
}

export default function App() {
  const [progress, setProgress] = useState<Progress>(loadProgress)
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(loadExpanded()))
  const [query, setQuery] = useState('')
  const [prova, setProva] = useState<Prova>('all')
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
  const shown = subjects.filter((s) => prova === 'all' || s.prova === prova)
  const noResults = !!visible && !shown.some((s) => visible.has(s.id))

  const toggleExpand = useCallback(
    (id: string) =>
      setExpanded((s) => {
        const n = new Set(s)
        if (!n.delete(id)) n.add(id)
        return n
      }),
    [],
  )

  const toggleCheck = useCallback(
    (node: TreeNode) => {
      const subject = subjects.find((s) => s.id === node.id.split('.')[0])!
      const before = fraction(subject, progressRef.current)
      const next = toggle(node, progressRef.current)
      if (before < 1 && fraction(subject, next) === 1) setToast(`${subjectMeta[subject.id].short} concluída! 🎉`)
      update(() => next)
    },
    [update],
  )

  const treeProps = { progress, expanded, visible, query, onToggleExpand: toggleExpand, onToggleCheck: toggleCheck }

  return (
    <Box sx={{ minHeight: '100dvh', bgcolor: 'background.default', pb: { xs: 10, md: 6 } }}>
      <AppBar
        position="sticky"
        elevation={0}
        color="transparent"
        sx={{
          backdropFilter: 'saturate(180%) blur(14px)',
          bgcolor: 'color-mix(in srgb, var(--mui-palette-background-default) 78%, transparent)',
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Toolbar sx={{ maxWidth: 1040, width: '100%', mx: 'auto', gap: 1, px: { xs: 2, sm: 3 } }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              display: 'grid',
              placeItems: 'center',
              color: '#fff',
              background: 'linear-gradient(135deg, #4F46E5, #A21CAF)',
              boxShadow: '0 6px 14px -6px rgba(79,70,229,0.7)',
            }}
          >
            <SchoolRounded fontSize="small" />
          </Box>
          <Box sx={{ mr: 'auto', ml: 0.5, lineHeight: 1 }}>
            <Typography sx={{ fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1 }}>INSS Tracker</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' }, lineHeight: 1.2 }}>
              Técnico do Seguro Social
            </Typography>
          </Box>
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5, mr: 1, p: 0.5, borderRadius: 99, bgcolor: 'action.hover' }}>
            {[
              { label: 'Conteúdo', icon: <ListAltRounded /> },
              { label: 'Revisões', icon: <EventRepeatRounded /> },
            ].map((t, i) => (
              <Button
                key={t.label}
                size="small"
                startIcon={t.icon}
                onClick={() => setTab(i)}
                sx={{
                  color: tab === i ? 'text.primary' : 'text.secondary',
                  bgcolor: tab === i ? 'background.paper' : 'transparent',
                  boxShadow: tab === i ? '0 1px 3px rgba(15,23,42,0.12)' : 'none',
                  '&:hover': { bgcolor: tab === i ? 'background.paper' : 'action.hover' },
                }}
              >
                {t.label}
                {i === 1 && reviewCount > 0 && (
                  <Box component="span" sx={{ ml: 1, px: 0.75, borderRadius: 99, fontSize: 11, fontWeight: 800, bgcolor: 'warning.main', color: '#fff' }}>
                    {reviewCount}
                  </Box>
                )}
              </Button>
            ))}
          </Box>
          <ThemeToggle />
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
      </AppBar>

      <Container maxWidth={false} sx={{ maxWidth: 1040, pt: { xs: 2, sm: 4 }, px: { xs: 2, sm: 3 } }}>
        {tab === 0 ? (
          <>
            <Hero progress={progress} pendingReviews={reviewCount} />

            <Box sx={{ display: 'flex', alignItems: { sm: 'flex-end' }, justifyContent: 'space-between', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mt: { xs: 4, sm: 5 }, mb: 2 }}>
              <Box>
                <Typography variant="h5">Conteúdo programático</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Marque o que já estudou. O tópico pai é marcado quando todos os filhos estão completos.
                </Typography>
              </Box>
              <ToggleButtonGroup
                size="small"
                exclusive
                value={prova}
                onChange={(_, v: Prova | null) => v && setProva(v)}
                sx={{ bgcolor: 'background.paper', flexShrink: 0, alignSelf: { xs: 'stretch', sm: 'auto' }, '& .MuiToggleButton-root': { flex: { xs: 1, sm: 'none' } } }}
              >
                <ToggleButton value="all">Todas</ToggleButton>
                <ToggleButton value="P1">
                  P1<Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>&nbsp;· Básicos</Box>
                </ToggleButton>
                <ToggleButton value="P2">
                  P2<Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>&nbsp;· Específicos</Box>
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Buscar tópico ou lei…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchRounded sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                    sx: { borderRadius: 99, bgcolor: 'background.paper', pl: 1.5 },
                  },
                }}
              />
              <Tooltip title="Expandir tudo">
                <IconButton onClick={() => setExpanded(new Set(allGroupIds()))} sx={{ bgcolor: 'background.paper', border: 1, borderColor: 'divider' }}>
                  <UnfoldMoreRounded />
                </IconButton>
              </Tooltip>
              <Tooltip title="Recolher tudo">
                <IconButton onClick={() => setExpanded(new Set())} sx={{ bgcolor: 'background.paper', border: 1, borderColor: 'divider' }}>
                  <UnfoldLessRounded />
                </IconButton>
              </Tooltip>
            </Box>

            <Box sx={{ display: 'grid', gap: 1.5 }}>
              {shown.map((s) => (
                <SubjectCard key={s.id} subject={s} {...treeProps} />
              ))}
              {noResults && (
                <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
                  <SearchOffRounded sx={{ fontSize: 40, opacity: 0.6 }} />
                  <Typography sx={{ mt: 1 }}>Nada encontrado para “{query}”.</Typography>
                </Box>
              )}
            </Box>
          </>
        ) : (
          <ReviewsPanel progress={progress} onComplete={(id, key) => update((p) => completeReview(p, id, key))} />
        )}
      </Container>

      <Paper
        elevation={0}
        sx={{
          display: { xs: 'block', md: 'none' },
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 'appBar',
          borderTop: 1,
          borderColor: 'divider',
          backdropFilter: 'blur(14px)',
          bgcolor: 'color-mix(in srgb, var(--mui-palette-background-paper) 85%, transparent)',
          pb: 'env(safe-area-inset-bottom)',
        }}
      >
        <BottomNavigation showLabels value={tab} onChange={(_, v: number) => setTab(v)} sx={{ bgcolor: 'transparent' }}>
          <BottomNavigationAction label="Conteúdo" icon={<ListAltRounded />} />
          <BottomNavigationAction
            label="Revisões"
            icon={
              <Badge badgeContent={reviewCount} color="warning" max={99}>
                <EventRepeatRounded />
              </Badge>
            }
          />
        </BottomNavigation>
      </Paper>

      <Snackbar
        open={!!toast}
        autoHideDuration={3500}
        onClose={() => setToast('')}
        message={toast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ bottom: { xs: 80, md: 24 } }}
      />
    </Box>
  )
}
