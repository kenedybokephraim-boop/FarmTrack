import { NextResponse, NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  // ALLOW Supabase email verification + password recovery
  const { searchParams, pathname } = new URL(req.url)
  const type = searchParams.get('type')

  if (type === 'signup' || type === 'recovery') {
    // This MUST pass through so Supabase can finalize email confirmation
    return res
  }

  // Normal auth protection
  const { data: { session } } = await supabase.auth.getSession()

   if (!session && pathname.startsWith('/dashboard')) {
     // Allow demo mode to bypass auth
     const demoMode = req.cookies.get('demo_mode')?.value === 'true'
     if (demoMode) {
       return res
     }
     return NextResponse.redirect(new URL('/login', req.url))
   }

  return res
}