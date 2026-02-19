"use client";

import { useState, useEffect } from "react";
import { UserProfile } from "@/types/user";
import { Mail, CreditCard as CreditCardIcon, Plus } from "lucide-react";
import PaymentCard, { CardData } from "../components/PaymentCard";
import { getProfileById } from "@/services/profile";

export default function ProfilePage() {
	const [loading, setLoading] = useState(true);
	const [profile, setProfile] = useState<UserProfile | null>(null);
	const [cards, setCards] = useState<CardData[]>([]);
	const userId = localStorage.getItem("user_id");

	useEffect(() => {
		const fetchData = async () => {
			try {
				setLoading(true);

				// API Call: Get User Profile
				const userRes = await getProfileById(userId!);
				console.log("ProfilePage | userRes:", userRes);

				//! API Call: Get Payment Methods
				// const cardRes = await fetch('/api/v1/user/cards');
				// const cardData = await cardRes.json();

				// MOCK DATA
				const mockCards: CardData[] = [
					{
						id: "card_1",
						last4: "4242",
						holderName: "John Doe",
						expiry: "12/26",
					},
					{
						id: "card_2",
						last4: "8899",
						holderName: "John Doe",
						expiry: "09/25",
					},
				];

				setProfile(userRes.data);
				setCards(mockCards);
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

		//! API Call to remove card
		// await fetch(`/api/v1/user/cards/${cardId}`, { method: 'DELETE' });

		// Update UI locally
		setCards((prev) => prev.filter((c) => c.id !== cardId));
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
									Last Login
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
					<div className="p-8 min-h-[500px] border border-white/5 bg-black/40 backdrop-blur-md rounded-2xl shadow-[0_0_30px_rgba(0,255,163,0.05)]">
						<div className="flex justify-between items-center mb-8">
							<div className="flex items-center gap-3">
								<CreditCardIcon className="text-[#00FFA3] w-6 h-6" />
								<h3 className="text-xl font-bold uppercase italic tracking-tighter text-white">
									Payment Methods
								</h3>
							</div>
							<button
								onClick={() => alert("Open Add Card Modal")} // Replace with your modal logic
								className="bg-white/5 border border-white/10 hover:bg-[#00FFA3] hover:text-black hover:border-[#00FFA3] px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2"
							>
								<Plus className="w-4 h-4" /> Add New Card
							</button>
						</div>

						{/* Cards Grid */}
						{cards.length > 0 ? (
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{cards.map((card) => (
									<PaymentCard
										key={card.id}
										data={card}
										onRemove={handleRemoveCard}
									/>
								))}
							</div>
						) : (
							<div className="text-center py-20 border border-dashed border-white/10 rounded-2xl">
								<p className="text-gray-500 text-sm">
									No payment methods configured.
								</p>
							</div>
						)}
					</div>
				</div>
			</div>
		</section>
	);
}
