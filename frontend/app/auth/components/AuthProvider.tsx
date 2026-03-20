"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, usePathname } from "next/navigation";
import VerifyOTP from "./VerifyOTP";

export default function AuthProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const router = useRouter();
	const pathname = usePathname();
	const [loading, setLoading] = useState(true);
	const [openModal, setOpenModal] = useState(false);

	useEffect(() => {
		const checkAuth = async () => {
			const {
				data: { session },
			} = await supabase.auth.getSession();

			// 1. Define Public Routes (Pages guests are ALLOWED to see)
			const publicRoutes = ["/", "/auth/callback"];

			// Check if current path starts with any public route

			const isPublic = publicRoutes.some(
				(route) => pathname === route || pathname.startsWith("/auth"),
			);

			// CASE 1: No Session (Guest)
			if (!session) {
				// If they are on a PROTECTED page, kick them to login
				if (!isPublic) {
					router.push("/"); // Or router.push("/auth/login")
				}
				setLoading(false);
				return;
			}

			// CASE 2: User is Logged in
			// Check OTP logic
			const isOtpVerified = sessionStorage.getItem("otp_verified") === "true";

			if (!isOtpVerified && !openModal && pathname !== "/") {
				setOpenModal(true);
			}

			setLoading(false);
		};

		checkAuth();
	}, [router, pathname]);

	// While checking, render nothing (or a spinner) to prevent "flashing" the dashboard
	if (loading) return null;

	return (
		<>
			{children}
			<VerifyOTP open={openModal} setOpen={setOpenModal} />
		</>
	);
}
