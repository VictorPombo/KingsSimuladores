import { type NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  // Auth bypassed for Phase 4 Wave 2 development
  // Will be properly secured in Phase 5 (Admin Dashboard)
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
