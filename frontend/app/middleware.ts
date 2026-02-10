import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
	let response = NextResponse.next({
		request: {
			headers: request.headers,
		},
	});

	const supabase = createServerClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
		{
			cookies: {
				getAll() {
					return request.cookies.getAll();
				},
				setAll(cookiesToSet) {
					cookiesToSet.forEach(({ name, value, options }) =>
						request.cookies.set(name, value),
					);
					response = NextResponse.next({
						request: {
							headers: request.headers,
						},
					});
					cookiesToSet.forEach(({ name, value, options }) =>
						response.cookies.set(name, value, options),
					);
				},
			},
		},
	);

	const {
		data: { session },
	} = await supabase.auth.getSession();

	// --- CONFIGURATION ---
	const path = request.nextUrl.pathname;

	// 1. Define Public Routes (Guests can see these)
	const isPublicRoute = path === "/" || path.startsWith("/auth");

	// 2. Define Protected Routes (Only logged in users can see these)
	// For now, let's say ANYTHING that isn't public is protected.
	// Or you can make a specific list like: const isProtectedRoute = path.startsWith('/dashboard')

	// LOGIC:
	// If user is NOT logged in AND tries to visit a private page -> Login
	if (!session && !isPublicRoute) {
		const url = request.nextUrl.clone();
		url.pathname = "/auth/login";
		return NextResponse.redirect(url);
	}

	return response;
}

export const config = {
	matcher: [
		// Apply to all routes excluding static files
		"/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
	],
};
