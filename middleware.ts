import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import {
  PORTFOLIO_ORIGIN,
  gameForHost,
  gameForPagePath,
  gameForWwwHost,
  gameKeepsPath,
  PORTFOLIO_HOSTS,
  portfolioHostName,
} from './app/game-sites'

export function middleware(request: NextRequest) {
  const host = portfolioHostName(request.headers.get('host'))
  const { pathname } = request.nextUrl

  const wwwGame = gameForWwwHost(host)
  if (wwwGame) {
    return NextResponse.redirect(new URL(pathname + request.nextUrl.search, `https://${wwwGame.host}`), 308)
  }

  const dedicatedPage = gameForPagePath(pathname)
  if (dedicatedPage?.host && host && PORTFOLIO_HOSTS.has(host)) {
    return NextResponse.redirect(new URL(`/${request.nextUrl.search}`, `https://${dedicatedPage.host}`), 308)
  }

  const game = gameForHost(host)
  if (!game) return NextResponse.next()

  if (gameForPagePath(pathname) === game) {
    return NextResponse.redirect(new URL(`/${request.nextUrl.search}`, `https://${game.host}`), 308)
  }

  if (gameKeepsPath(game, pathname)) return NextResponse.next()

  if (pathname === '/') {
    const url = request.nextUrl.clone()
    url.pathname = game.path
    return NextResponse.rewrite(url)
  }

  return NextResponse.redirect(new URL(pathname + request.nextUrl.search, PORTFOLIO_ORIGIN))
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
}
