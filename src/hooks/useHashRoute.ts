import { useEffect, useState } from 'react'

/** Rota por hash (#/ ou #/inss), para funcionar no GitHub Pages sem configuração de servidor. */
export function useHashRoute(): [string | null, (to: string | null) => void] {
  const parse = () => {
    const h = window.location.hash.replace(/^#\/?/, '')
    return h ? decodeURIComponent(h) : null
  }
  const [route, setRoute] = useState<string | null>(parse)
  useEffect(() => {
    const on = () => setRoute(parse())
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  const go = (to: string | null) => {
    window.location.hash = to ? `/${to}` : '/'
  }
  return [route, go]
}
