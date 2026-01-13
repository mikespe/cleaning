import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Middleware with proper role-based access control (RBAC)
 * - Admins can access both /admin and /portal
 * - Workers can only access /portal
 */
export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const pathname = request.nextUrl.pathname

  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser()

  // Public routes
  if (pathname === '/' || pathname.startsWith('/api/auth/callback')) {
    return response
  }

  // Auth pages - redirect logged-in users to their dashboard
  if (pathname.startsWith('/login') || pathname.startsWith('/signup')) {
    if (user) {
      // Get user role to redirect appropriately
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      const redirectUrl = profile?.role === 'admin' ? '/admin' : '/portal'
      return NextResponse.redirect(new URL(redirectUrl, request.url))
    }
    return response
  }

  // Protected routes - require authentication
  if (!user && (pathname.startsWith('/admin') || pathname.startsWith('/portal'))) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Role-based route protection
  if ((pathname.startsWith('/admin') || pathname.startsWith('/portal')) && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const isAdmin = profile?.role === 'admin'

    // Admin trying to access portal → redirect to admin
    if (pathname.startsWith('/portal') && isAdmin) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }

    // Worker trying to access admin → redirect to portal
    if (pathname.startsWith('/admin') && !isAdmin) {
      return NextResponse.redirect(new URL('/portal', request.url))
    }
  }

  return response
}

// Configure which routes the middleware runs on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
