import EventRepeatRounded from '@mui/icons-material/EventRepeatRounded'
import GridViewRounded from '@mui/icons-material/GridViewRounded'
import ListAltRounded from '@mui/icons-material/ListAltRounded'
import RouteRounded from '@mui/icons-material/RouteRounded'
import AppBar from '@mui/material/AppBar'
import Badge from '@mui/material/Badge'
import BottomNavigation from '@mui/material/BottomNavigation'
import BottomNavigationAction from '@mui/material/BottomNavigationAction'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import ButtonBase from '@mui/material/ButtonBase'
import Container from '@mui/material/Container'
import Paper from '@mui/material/Paper'
import Snackbar from '@mui/material/Snackbar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ConcursoPage } from './components/ConcursoPage'
import { ConcursoSwitcher } from './components/ConcursoSwitcher'
import { HomePage } from './components/HomePage'
import { SyncControls, type SyncStatus } from './components/SyncControls'
import { ThemeToggle } from './components/ThemeToggle'
import { concursoById, lookup, subjectsFor } from './data/registry'
import { mergeProgress } from './domain/merge'
import { completeReview, dueReviews, fraction, leaves, toggle } from './domain/tree'
import type { Progress, TreeNode } from './domain/types'
import { useHashRoute } from './hooks/useHashRoute'
import * as drive from './storage/gdrive'
import { exportProgress, hasLegacyProgress, importProgress, loadExpanded, loadProgress, saveExpanded, saveProgress } from './storage/local'
import { loadPrefs, savePrefs, type Prefs } from './storage/prefs'

export default function App() {
  const [progress, setProgress] = useState<Progress>(loadProgress)
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(loadExpanded()))
  const [prefs, setPrefs] = useState<Prefs>(() => {
    const p = loadPrefs()
    return !p.lastConcurso && hasLegacyProgress() ? { ...p, lastConcurso: 'inss' } : p
  })
  const [route, go] = useHashRoute()
  const [tab, setTab] = useState(0)
  const [status, setStatus] = useState<SyncStatus>('off')
  const [toast, setToast] = useState('')
  const progressRef = useRef(progress)
  const syncTimer = useRef<number>(undefined)

  // sem hash: abre o último concurso usado (ou a tela inicial)
  useEffect(() => {
    if (route === null && prefs.lastConcurso && concursoById.has(prefs.lastConcurso)) go(prefs.lastConcurso)
    // só na abertura
  }, [])

  const concurso = route ? concursoById.get(route) : undefined
  const empregoId = concurso ? prefs.empregoByConcurso[concurso.id] : undefined

  useEffect(() => {
    setTab(0)
    window.scrollTo({ top: 0 })
    if (concurso) setPrefs((p) => (p.lastConcurso === concurso.id ? p : { ...p, lastConcurso: concurso.id }))
  }, [concurso])

  useEffect(() => {
    progressRef.current = progress
    saveProgress(progress)
  }, [progress])
  useEffect(() => saveExpanded([...expanded]), [expanded])
  useEffect(() => savePrefs(prefs), [prefs])

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
      const subject = lookup.get(node.id)?.subject
      const before = subject ? fraction(subject, progressRef.current) : 0
      const next = toggle(node, progressRef.current)
      if (subject && before < 1 && fraction(subject, next) === 1) setToast(`${subject.short} concluída! 🎉`)
      update(() => next)
    },
    [update],
  )

  const reviewCount = useMemo(() => {
    if (!concurso) return 0
    const ids = new Set(subjectsFor(concurso, empregoId).flatMap(leaves).map((l) => l.id))
    return dueReviews(progress).filter((r) => ids.has(r.leafId)).length
  }, [concurso, empregoId, progress])

  return (
    <Box sx={{ minHeight: '100dvh', bgcolor: 'background.default', pb: { xs: concurso ? 10 : 4, md: 6 } }}>
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
          <ButtonBase onClick={() => go(null)} sx={{ borderRadius: '12px', gap: 1.25, pr: 1 }} aria-label="Início">
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
              <RouteRounded fontSize="small" />
            </Box>
            <Typography sx={{ fontWeight: 800, letterSpacing: '-0.02em', display: { xs: concurso ? 'none' : 'block', sm: 'block' } }}>
              Trilha do Edital
            </Typography>
          </ButtonBase>
          <Box sx={{ mr: 'auto', ml: { xs: 0, sm: 1 } }}>
            <ConcursoSwitcher current={concurso?.id ?? null} onSelect={go} />
          </Box>
          {concurso && (
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
          )}
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
        {concurso ? (
          <ConcursoPage
            key={concurso.id}
            concurso={concurso}
            empregoId={empregoId}
            onEmprego={(id) =>
              setPrefs((p) => {
                const empregoByConcurso = { ...p.empregoByConcurso }
                if (id) empregoByConcurso[concurso.id] = id
                else delete empregoByConcurso[concurso.id]
                return { ...p, empregoByConcurso }
              })
            }
            tab={tab}
            progress={progress}
            expanded={expanded}
            setExpanded={setExpanded}
            onToggleExpand={toggleExpand}
            onToggleCheck={toggleCheck}
            onCompleteReview={(id, key) => update((p) => completeReview(p, id, key))}
          />
        ) : (
          <HomePage progress={progress} empregoByConcurso={prefs.empregoByConcurso} onOpen={go} />
        )}
      </Container>

      {concurso && (
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
          <BottomNavigation
            showLabels
            value={tab}
            onChange={(_, v: number) => (v === 2 ? go(null) : setTab(v))}
            sx={{ bgcolor: 'transparent' }}
          >
            <BottomNavigationAction label="Conteúdo" icon={<ListAltRounded />} />
            <BottomNavigationAction
              label="Revisões"
              icon={
                <Badge badgeContent={reviewCount} color="warning" max={99}>
                  <EventRepeatRounded />
                </Badge>
              }
            />
            <BottomNavigationAction label="Concursos" icon={<GridViewRounded />} />
          </BottomNavigation>
        </Paper>
      )}

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
