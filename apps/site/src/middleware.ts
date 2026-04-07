import { updateSession } from '@kings/db'
import { type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Force rebuild of middleware in dev
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
