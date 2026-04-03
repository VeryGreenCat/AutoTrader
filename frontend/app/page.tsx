"use client";

import { useState } from "react";
import { Gift, ArrowRight, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AuthModal from "./auth/components/AuthModal";
import { AuthMode } from "@/types/auth";
import { App } from "antd";

export default function Home() {
	const [openModal, setOpenModal] = useState(false);
	const [authMode, setAuthMode] = useState<AuthMode>("signup");
	const router = useRouter();
	const { message } = App.useApp();

	const handleAuthAction = async (mode: AuthMode) => {
		const {
			data: { session },
		} = await supabase.auth.getSession();

		if (session) {
			message.info("You are already logged in");
		} else {
			setAuthMode(mode);
			setOpenModal(true);
		}
	};

	// Smooth Scroll Function
	const scrollToPricing = () => {
		const element = document.getElementById("pricing");
		if (element) {
			element.scrollIntoView({ behavior: "smooth" });
		}
	};

	const handleLaunch = async () => {
		const {
			data: { session },
		} = await supabase.auth.getSession();

		if (session) {
			router.push("/dashboard");
		} else {
			setAuthMode("signin");
			setOpenModal(true);
		}
	};

	return (
		<main className="min-h-screen">
			{/* ================= HERO SECTION ================= */}
			<section className="min-h-[90vh] flex flex-col justify-center py-20 text-center relative overflow-hidden">
				{/* Background Glow */}
				<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#00FFA3]/5 rounded-full blur-[100px] -z-10 pointer-events-none"></div>

				<div className="max-w-4xl mx-auto px-4">
					<h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight text-white">
						Trade with{" "}
						<span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00FFA3] to-emerald-300">
							LLM Intelligence
						</span>
					</h1>

					<p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
						The Forex bot powered by Large Language Models. Beyond rule. Beyond
						technicals. We understand market pattern.
					</p>

					{/* Bonus Badge */}
					<div className="mb-8 flex justify-center">
						<div className="inline-flex items-center gap-3 bg-[#00FFA3]/10 border border-[#00FFA3]/30 px-5 py-2 rounded-full backdrop-blur-md">
							<Gift className="w-4 h-4 text-[#00FFA3]" />
							<span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#00FFA3]">
								New User Bonus: 10 Free Tickets ($10.00 Value)
							</span>
						</div>
					</div>

					{/* Action Buttons */}
					<div className="flex flex-col sm:flex-row justify-center gap-4 mb-20">
						<button
							onClick={handleLaunch}
							className="w-full sm:w-auto bg-[#00FFA3] text-black font-bold px-8 py-4 rounded-xl hover:scale-105 transition shadow-[0_0_30px_rgba(0,255,163,0.3)] hover:shadow-[0_0_50px_rgba(0,255,163,0.5)] uppercase tracking-wide inline-block text-center cursor-pointer"
						>
							Launch Command Center
						</button>

						<button
							onClick={scrollToPricing}
							className="w-full sm:w-auto border border-white/20 text-white hover:bg-white/5 px-8 py-4 rounded-xl font-bold transition uppercase tracking-wide cursor-pointer"
						>
							View Pricing
						</button>
					</div>

					{/* Stats Grid */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 text-center">
						<div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition duration-300 group">
							<h3 className="text-[#00FFA3] text-3xl font-bold mb-1 group-hover:scale-110 transition-transform duration-300">
								$3,142.50
							</h3>
							<p className="text-gray-500 text-[10px] uppercase tracking-[0.2em] font-bold">
								Realized Alpha Profit
							</p>
						</div>
						<div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition duration-300 group">
							<h3 className="text-[#00FFA3] text-3xl font-bold mb-1 group-hover:scale-110 transition-transform duration-300">
								51.2%
							</h3>
							<p className="text-gray-500 text-[10px] uppercase tracking-[0.2em] font-bold">
								Statistical Predictive Edge
							</p>
						</div>
						<div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition duration-300 group">
							<h3 className="text-[#00FFA3] text-3xl font-bold mb-1 group-hover:scale-110 transition-transform duration-300 flex items-center justify-center gap-2">
								<div className="w-2 h-2 bg-[#00FFA3] rounded-full animate-pulse shadow-[0_0_10px_#00FFA3]"></div>
								Live
							</h3>
							<p className="text-gray-500 text-[10px] uppercase tracking-[0.2em] font-bold">
								Signal Execution Status
							</p>
						</div>
					</div>
				</div>
			</section>

			{/* ================= PRICING SECTION ================= */}
			<section id="pricing" className="py-24 relative">
				<div className="max-w-6xl mx-auto px-4">
					<h2 className="text-4xl font-bold text-center mb-6 text-white">
						Simple. Fair. Performance-Aligned.
					</h2>
					<p className="text-gray-400 text-center max-w-2xl mx-auto mb-16">
						No subscriptions. You pay for compute time. If the AI performs, you
						share the upside.
					</p>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						{/* Card 1: Runtime Tickets */}
						<div className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-2xl text-center hover:bg-white/[0.07] transition duration-300">
							<h3 className="text-xl font-bold mb-2 text-white">
								Runtime Tickets
							</h3>
							<p className="text-5xl font-bold text-[#00FFA3] mb-4">$1</p>
							<p className="text-gray-400 text-xs uppercase tracking-widest mb-6">
								per ticket
							</p>
							<ul className="text-sm text-gray-400 space-y-3 text-left pl-4">
								<li className="flex items-center gap-2">
									<div className="w-1 h-1 bg-[#00FFA3] rounded-full"></div> 1
									ticket = 12 hours runtime
								</li>
								<li className="flex items-center gap-2">
									<div className="w-1 h-1 bg-[#00FFA3] rounded-full"></div> Bot
									stops instantly when tickets end
								</li>
								<li className="flex items-center gap-2">
									<div className="w-1 h-1 bg-[#00FFA3] rounded-full"></div> No
									hidden fees
								</li>
							</ul>
						</div>

						{/* Card 2: Performance Fee (Highlighted) */}
						<div className="bg-[#00FFA3]/5 backdrop-blur-sm border border-[#00FFA3]/40 p-8 rounded-2xl text-center relative shadow-[0_0_30px_rgba(0,255,163,0.1)]">
							{/* <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#00FFA3] text-black text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
								Most Popular
							</div> */}
							<h3 className="text-xl font-bold mb-2 text-white">
								Performance Fee
							</h3>
							<p className="text-5xl font-bold text-[#00FFA3] mb-4">2%</p>
							<p className="text-gray-400 text-xs uppercase tracking-widest mb-6">
								of realized profit
							</p>
							<ul className="text-sm text-gray-300 space-y-3 text-left pl-4">
								<li className="flex items-center gap-2">
									<CheckCircle2 className="w-4 h-4 text-[#00FFA3]" /> Only
									charged if profitable
								</li>
								<li className="flex items-center gap-2">
									<CheckCircle2 className="w-4 h-4 text-[#00FFA3]" /> Calculated
									weekly
								</li>
								<li className="flex items-center gap-2">
									<CheckCircle2 className="w-4 h-4 text-[#00FFA3]" /> Loss weeks
									pay nothing
								</li>
							</ul>
						</div>

						{/* Card 3: Free Tickets */}
						<div className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-2xl text-center hover:bg-white/[0.07] transition duration-300">
							<h3 className="text-xl font-bold mb-2 text-white">
								Free Tickets
							</h3>
							<p className="text-5xl font-bold text-[#00FFA3] mb-4">🎁</p>
							<p className="text-gray-400 text-xs uppercase tracking-widest mb-6">
								earned from profit
							</p>
							<ul className="text-sm text-gray-400 space-y-3 text-left pl-4">
								<li className="flex items-center gap-2">
									<div className="w-1 h-1 bg-[#00FFA3] rounded-full"></div> 1
									free ticket per $10 profit
								</li>
								<li className="flex items-center gap-2">
									<div className="w-1 h-1 bg-[#00FFA3] rounded-full"></div> Max
									10 tickets per week
								</li>
								<li className="flex items-center gap-2">
									<div className="w-1 h-1 bg-[#00FFA3] rounded-full"></div>{" "}
									Covers a full trading week
								</li>
							</ul>
						</div>
					</div>

					{/* CTA Button */}
					<div className="flex justify-center mt-16">
						<button
							onClick={() => handleAuthAction("signup")}
							className="bg-[#00FFA3] text-black font-bold px-8 py-4 rounded-xl hover:scale-105 transition shadow-[0_0_30px_rgba(0,255,163,0.3)] hover:shadow-[0_0_50px_rgba(0,255,163,0.5)] flex items-center gap-2 uppercase tracking-wide cursor-pointer"
						>
							Sign Up for 10 Free Tickets
							<ArrowRight className="w-5 h-5" />
						</button>
					</div>
				</div>
			</section>

			<AuthModal
				open={openModal}
				setOpen={setOpenModal}
				mode={authMode}
				setMode={setAuthMode}
			/>
		</main>
	);
}
