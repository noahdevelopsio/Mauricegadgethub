import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Intercept all requests starting with /admin, excluding the login page
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    });

    // Initialize Supabase Client within Middleware (cookie syncing)
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    // Get current authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Redirect to login if user session is absent
    if (!user) {
      const redirectUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(redirectUrl);
    }

    // Query profile roles
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (error || !profile || (profile.role !== "admin" && profile.role !== "staff")) {
      console.warn(`Access denied for user [id=${user.id}]: role unauthorized.`);
      
      // Auto signout from Auth and redirect
      await supabase.auth.signOut();
      
      const redirectUrl = new URL("/admin/login", request.url);
      redirectUrl.searchParams.set("error", "unauthorized");
      return NextResponse.redirect(redirectUrl);
    }

    return response;
  }

  return NextResponse.next();
}

export const config = {
  // Matches all admin routes
  matcher: ["/admin/:path*"],
};
