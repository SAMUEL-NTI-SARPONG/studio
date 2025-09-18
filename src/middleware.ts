import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { response, supabase } = await updateSession(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const url = request.nextUrl.clone();

  // Redirect to login if user is not authenticated and trying to access protected routes.
  if (!user && request.nextUrl.pathname.startsWith('/timetable')) {
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Redirect to timetable if user is authenticated and trying to access login page.
  if (user && request.nextUrl.pathname.startsWith('/login')) {
    url.pathname = '/timetable';
    return NextResponse.redirect(url);
  }
  
  if(request.nextUrl.pathname === '/') {
    url.pathname = '/timetable';
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
