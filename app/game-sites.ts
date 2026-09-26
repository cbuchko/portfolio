export const PORTFOLIO_ORIGIN = 'https://www.connorbuchko.com'

export type GameSite = {
  /** Route on the portfolio. Assets live under this path too. */
  path: string
  /** Set only when this game has its own domain. Otherwise it stays on the portfolio. */
  host?: string
  /** Paths that must stay on that domain, such as an analytics proxy. */
  extraPaths?: string[]
}

/**
 * Games the portfolio hosts. Add a route here.
 * Set `host` only for a game that has its own domain.
 */
export const GAMES: GameSite[] = [
  { path: '/idle_game' },
  {
    path: '/thirty-factor-authentication',
    host: 'thirtyfactorauthentication.com',
    extraPaths: ['/factor-relay'],
  },
]

export const portfolioHostName = (header: string | null) =>
  header?.split(':')[0]?.toLowerCase()

/** Only these hosts should send a dedicated game path to its public domain. */
export const PORTFOLIO_HOSTS = new Set(['connorbuchko.com', 'www.connorbuchko.com'])

export const gameForHost = (host: string | undefined) => GAMES.find((game) => game.host === host)

export const gameForWwwHost = (host: string | undefined) =>
  host?.startsWith('www.') ? gameForHost(host.slice(4)) : undefined

export const gameForPagePath = (pathname: string) =>
  GAMES.find((game) => game.host && (pathname === game.path || pathname === `${game.path}/`))

export const gameKeepsPath = (game: GameSite, pathname: string) => {
  if (pathname === game.path || pathname.startsWith(`${game.path}/`)) return true
  if (pathname.startsWith('/_next')) return true
  if (pathname === '/robots.txt' || pathname === '/sitemap.xml') return true
  return (
    game.extraPaths?.some((path) => pathname === path || pathname.startsWith(`${path}/`)) ?? false
  )
}

export const gameCanonicalUrl = (game: GameSite) =>
  game.host ? `https://${game.host}` : `${PORTFOLIO_ORIGIN}${game.path}`
