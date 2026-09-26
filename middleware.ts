import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const GAME_HOST = 'thirtyfactorauthentication.com'
const PORTFOLIO_ORIGIN = 'https://www.connorbuchko.com'

const staysOnGameHost = (pathname: string) =>
  pathname === '/thirty-factor-authentication' ||
  pathname.startsWith('/thirty-factor-authentication/') ||
  pathname.startsWith('/factor-relay') ||
  pathname.startsWith('/_next')

export function middleware(request: NextRequest) {
  const host = request.headers.get('host')?.split(':')[0]?.toLowerCase()
  if (host !== GAME_HOST) return NextResponse.next()

  const { pathname } = request.nextUrl
  if (staysOnGameHost(pathname)) return NextResponse.next()

  if (pathname === '/') {
    const url = request.nextUrl.clone()
    url.pathname = '/thirty-factor-authentication'
    return NextResponse.rewrite(url)
  }

  return NextResponse.redirect(new URL(pathname + request.nextUrl.search, PORTFOLIO_ORIGIN))
}

export const config = {
  matcher: ['/((?!_next/static|_next/image).*)'],
}
