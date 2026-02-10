"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, usePathname } from "next/navigation";

export default function AuthProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const router = useRouter();
	const pathname = usePathname();
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const checkAuth = async () => {
			const {
				data: { session },
			} = await supabase.auth.getSession();

			// CASE 1: No Session (Guest)
			// If we are on a protected page, middleware would have already kicked us out.
			// If we are on homepage, we stay as guest.
			if (!session) {
				setLoading(false);
				return;
			}

			// CASE 2: User is Logged in (Google or Email)
			// Now we check if they did the OTP step.
			const isOtpVerified = sessionStorage.getItem("otp_verified") === "true";

			// If they are logged in, BUT not verified, AND not currently on the verify page...
			if (!isOtpVerified && pathname !== "/auth/verify-otp") {
				// Force them to verify
				router.push("/auth/verify-otp");
			}

			setLoading(false);
		};

		checkAuth();
	}, [router, pathname]);

	// Optional: You can show a loading spinner while checking auth
	// if (loading) return <div>Loading...</div>;

	return <>{children}</>;
}
