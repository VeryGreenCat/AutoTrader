import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
	// 1. Setup Response
	let response = NextResponse.next({
		request: { headers: request.headers },
	});

	// 2. Setup Supabase
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
						request: { headers: request.headers },
					});
					cookiesToSet.forEach(({ name, value, options }) =>
						response.cookies.set(name, value, options),
					);
				},
			},
		},
	);

	// 3. Get User
	const {
		data: { session },
	} = await supabase.auth.getSession();

	// 4. Access Control
	const path = request.nextUrl.pathname;

	// Define explicitly what is PUBLIC. Everything else is private.
	const isPublicRoute = path === "/" || path.startsWith("/auth");

	// If NO session AND NOT public -> Redirect
	if (!session && !isPublicRoute) {
		const url = request.nextUrl.clone();
		url.pathname = "/"; // Redirect to Home or Login
		return NextResponse.redirect(url);
	}

	return response;
}

export const config = {
	matcher: [
		// Matches everything EXCEPT static files (images, css, etc.)
		"/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
	],
};
