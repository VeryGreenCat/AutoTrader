"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AuthCallback() {
	const router = useRouter();

	useEffect(() => {
		supabase.auth.getSession().then(({ data }) => {
			if (data.session) {
				console.log("User signed in:", data.session.user);
				router.push("/dashboard");
			}
		});
	}, [router]);

	return <p>Signing you in...</p>;
}
