import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Fetch user object to see if logged in
  const { data: { user } } = await supabase.auth.getUser()

  // Define protected routes
  const isOrganizerRoute = request.nextUrl.pathname.startsWith('/organizer')
  const isAccountRoute = request.nextUrl.pathname.startsWith('/account')
  const isAuthRoute = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register')

  if ((isOrganizerRoute || isAccountRoute) && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  const role = user?.user_metadata?.role || 'user';

  if (isOrganizerRoute && user && role !== 'organizer') {
    const url = request.nextUrl.clone()
    url.pathname = '/account'
    return NextResponse.redirect(url)
  }

  if (isAccountRoute && user && role === 'organizer') {
    const url = request.nextUrl.clone()
    url.pathname = '/organizer/dashboard'
    return NextResponse.redirect(url)
  }

  if (isAuthRoute && user) {
    // Redirect to proper dashboard if logged in and on auth route
    const url = request.nextUrl.clone()
    url.pathname = role === 'organizer' ? '/organizer/dashboard' : '/account'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
