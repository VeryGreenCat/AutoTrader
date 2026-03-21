"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserProfile } from "@/types/user";
import { Mail, Info, PlayCircle } from "lucide-react";
import { getProfileById } from "@/services/profile";
import HowToUseDoc from "../components/HowToUseDoc";

export default function ProfilePage() {
	const router = useRouter();
	const [loading, setLoading] = useState(true);
	const [profile, setProfile] = useState<UserProfile | null>(null);
	const [shouldBlink, setShouldBlink] = useState(false);

	useEffect(() => {
		const fetchData = async () => {
			const currentUserId = localStorage.getItem("user_id");
			if (!currentUserId) return;
			try {
				setLoading(true);

				// API Call: Get User Profile
				const userRes = await getProfileById(currentUserId);
				console.log("ProfilePage | userRes:", userRes);

				setProfile(userRes.data);

				// Trigger blink effect for the tour button
				setShouldBlink(true);
				setTimeout(() => setShouldBlink(false), 2500);
			} catch (error) {
				console.error("Failed to fetch profile data", error);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []);

	const handleRemoveCard = async (cardId: string) => {
		if (!confirm("Are you sure you want to remove this payment method?"))
			return;
	};

	if (loading)
		return (
			<div className="text-center text-[#00FFA3] mt-20">Loading Profile...</div>
		);
	if (!profile)
		return (
			<div className="text-center text-red-500 mt-20">
				Failed to load profile.
			</div>
		);

	return (
		<section className="pb-20 max-w-7xl mx-auto px-4">
			{/* Header */}
			<div className="mb-10">
				<h2 className="text-4xl font-bold tracking-tighter uppercase italic text-white">
					User <span className="text-[#00FFA3]">Profile</span>
				</h2>
				<p className="text-gray-500 text-sm mt-1">
					Manage your identity, security, and billing methods.
				</p>
			</div>

			<div className="grid grid-cols-12 gap-8">
				{/* LEFT COLUMN: Identity & Auth */}
				<div className="col-span-12 lg:col-span-4 space-y-6">
					{/* Avatar Card */}
					<div className="p-8 text-center border-[#00FFA3]/10 relative overflow-hidden bg-white/5 rounded-2xl">
						<div className="w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-400 to-blue-500 mx-auto mb-6 border-4 border-white/5 shadow-xl">
							{/* If avatar URL exists, render image here */}
						</div>

						<h3 className="text-md font-bold italic text-white">
							{profile.email}
						</h3>

						<div className="space-y-4 text-left border-t border-white/10 pt-6">
							<div>
								<p className="text-[10px] text-gray-500 uppercase tracking-widest">
									User Identifier
								</p>
								<p className="font-mono text-sm text-gray-300">
									#{profile.user_id}
								</p>
							</div>
							<div>
								<p className="text-[10px] text-gray-500 uppercase tracking-widest">
									Created On
								</p>
								<p className="font-mono text-sm text-gray-300">
									{profile.last_sign_in
										? new Date(profile.last_sign_in).toLocaleString("en-US", {
												month: "long",
												day: "numeric",
												year: "numeric",
												hour: "2-digit",
												minute: "2-digit",
											})
										: "No recent activity"}
								</p>
							</div>
						</div>
					</div>

					{/* Authentication Method Card */}
					<div className="p-6 border border-white/5 bg-white/5 rounded-2xl">
						<div className="flex items-center gap-3 mb-6">
							<Mail className="text-gray-400 w-5 h-5" />
							<h4 className="text-sm font-bold uppercase tracking-wider text-white">
								Authentication
							</h4>
						</div>

						<div className="bg-black/40 rounded-xl p-4 border border-white/5 flex items-center justify-between">
							<div className="flex items-center gap-3">
								<div className="w-8 h-8 bg-white/5 rounded-full flex items-center justify-center">
									{profile.auth_provider === "google" ? (
										<img
											src="https://www.google.com/favicon.ico"
											className="w-4 h-4 grayscale opacity-70"
											alt="google"
										/>
									) : (
										<Mail className="w-4 h-4 text-gray-400" />
									)}
								</div>
								<div>
									<p className="text-[10px] text-gray-500">
										{profile.auth_provider === "google"
											? "Google Account"
											: "Email Account"}
									</p>
									<p className="text-xs font-medium text-white max-w-[150px]">
										{profile.email}
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* RIGHT COLUMN: Payment Methods */}
				<div className="col-span-12 lg:col-span-8">
					<div className="p-8 border border-white/5 bg-white/5 backdrop-blur-md rounded-2xl shadow-[0_0_30px_rgba(0,255,163,0.05)]">
						<div className="flex justify-between items-center mb-8">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 rounded-lg bg-[#00FFA3]/10 flex items-center justify-center">
									<Info className="text-[#00FFA3] w-6 h-6" />
								</div>
								<h3 className="text-xl font-bold uppercase italic tracking-tighter text-white">
									How to use <span className="text-[#00FFA3]">AutoTrader</span>
								</h3>
							</div>

							<button
								onClick={() => {
									sessionStorage.setItem("start_tour", "true");
									router.push("/bots");
								}}
								className={`flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00FFA3]/10 border border-[#00FFA3]/20 hover:bg-[#00FFA3] hover:text-black transition-all group active:scale-95 cursor-pointer ${
									shouldBlink ? "animate-blink-twice" : ""
								}`}
							>
								<PlayCircle className="w-4 h-4 group-hover:scale-110 transition" />
								<span className="text-xs font-bold uppercase tracking-wider">
									Start Interactive Tour
								</span>
							</button>
						</div>

						<div className="max-h-[800px] overflow-y-auto pr-4 custom-scrollbar">
							<HowToUseDoc />
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
