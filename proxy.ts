import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getIronSession } from 'iron-session'
import type { IronSessionData } from 'iron-session'

import { sessionOptions } from 'lib/session'

export async function proxy(request: NextRequest) {
  const session = await getIronSession<IronSessionData>(
    request,
    NextResponse.next(),
    sessionOptions,
  )

  // Check if the user is authenticated
  const isAuthenticated = session.user?.authenticated

  // If the user is not authenticated and trying to access a protected post,
  // we allow the request to proceed so the client-side AuthGate can handle it.
  // if (!isAuthenticated && request.nextUrl.pathname.startsWith('/posts/')) {
  //   const response = await fetch(
  //     `${request.nextUrl.origin}/api/posts/${request.nextUrl.pathname.split('/').pop()}`,
  //   )
  //   const post = await response.json()

  //   if (post.requiresAuth) {
  //     return NextResponse.redirect(new URL('/login', request.url))
  //   }
  // }

  return NextResponse.next()
}

export const config = {
  matcher: '/posts/:path*',
}
