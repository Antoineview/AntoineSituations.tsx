import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getIronSession } from 'iron-session'
import type { IronSessionData } from 'iron-session'

const sessionOptions = {
  password:
    process.env.SESSION_PASSWORD ||
    'complex_password_at_least_32_characters_long',
  cookieName: 'auth_session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
}

export async function proxy(request: NextRequest) {
  const session = await getIronSession<IronSessionData>(
    request,
    NextResponse.next(),
    sessionOptions,
  )

  // Check if the user is authenticated
  const isAuthenticated = session.user?.authenticated

  // If the user is not authenticated and trying to access a protected post,
  // redirect them to the login page
  if (!isAuthenticated && request.nextUrl.pathname.startsWith('/posts/')) {
    const response = await fetch(
      `${request.nextUrl.origin}/api/posts/${request.nextUrl.pathname.split('/').pop()}`,
    )
    const post = await response.json()

    if (post.requiresAuth) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/posts/:path*',
}
