"use client";

import React, { useState } from "react";
import { Zap, Clock } from "lucide-react";
import PaymentMethodSelector from "../components/PaymentMethodSelector"; // Adjust path

export default function BuyTicketsPage() {
	const [selectedPackage, setSelectedPackage] = useState<1 | 10>(1); // Default to 1 ticket
	const [paymentMethod, setPaymentMethod] = useState<"card" | "qr">("card");

	// Pricing Logic
	const price = selectedPackage === 1 ? 1.0 : 9.0;
	const hours = selectedPackage === 1 ? 12 : 120;

	return (
		<section className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 max-w-7xl mx-auto px-4">
			{/* Header */}
			<div className="mb-10">
				<h2 className="text-4xl font-bold tracking-tighter uppercase italic text-white">
					Energy <span className="text-[#00FFA3]">Reserve</span>
				</h2>
				<p className="text-gray-500 text-sm mt-1">
					Acquire runtime tickets to keep your fleet operational.
				</p>
			</div>

			<div className="grid grid-cols-12 gap-8">
				{/* Left: Package Selection */}
				<div className="col-span-12 lg:col-span-7 space-y-6">
					<h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
						Select Fuel Package
					</h3>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{/* Package 1 */}
						<div
							onClick={() => setSelectedPackage(1)}
							className={`package-card glass-card p-6 border-2 cursor-pointer transition-all relative rounded-2xl ${
								selectedPackage === 1
									? "border-[#00FFA3] bg-[#00FFA3]/10 shadow-[0_0_20px_rgba(0,255,163,0.1)]"
									: "border-white/5 hover:border-[#00FFA3]/30 bg-white/5"
							}`}
						>
							<div className="absolute top-4 right-4 text-[#00FFA3]">
								<Zap className="w-5 h-5" />
							</div>
							<p className="text-2xl font-black italic mb-1 text-white">
								1 TICKET
							</p>
							<p className="text-[10px] text-gray-400 uppercase mb-6">
								12 Hours Bot Runtime
							</p>
							<p className="text-3xl font-mono font-bold text-white">$1.00</p>
						</div>

						{/* Package 2 (Best Value) */}
						<div
							onClick={() => setSelectedPackage(10)}
							className={`package-card glass-card p-6 border-2 cursor-pointer transition-all relative overflow-hidden rounded-2xl ${
								selectedPackage === 10
									? "border-[#00FFA3] bg-[#00FFA3]/10 shadow-[0_0_20px_rgba(0,255,163,0.1)]"
									: "border-white/5 hover:border-[#00FFA3]/30 bg-white/5"
							}`}
						>
							<div className="absolute top-0 right-0 bg-[#00FFA3] text-black text-[9px] font-black px-4 py-1 rounded-bl-lg tracking-tighter">
								BEST VALUE
							</div>
							<p className="text-2xl font-black italic mb-1 text-white">
								10 TICKETS
							</p>
							<p className="text-[10px] text-gray-400 uppercase mb-6">
								120 Hours (1 Full Week)
							</p>
							<div className="flex items-end gap-2">
								<p className="text-3xl font-mono font-bold text-[#00FFA3]">
									$9.00
								</p>
								<p className="text-xs text-gray-500 line-through mb-1">
									$10.00
								</p>
							</div>
						</div>
					</div>

					{/* Estimation Summary */}
					<div className="glass-card p-6 border border-white/5 bg-white/10 rounded-2xl">
						<div className="flex items-center gap-3 mb-2">
							<Clock className="w-4 h-4 text-[#00FFA3]" />
							<span className="text-xs font-bold uppercase tracking-wider text-white">
								Estimated Coverage
							</span>
						</div>
						<p className="text-sm text-gray-400">
							Buying{" "}
							<span className="text-white font-bold">{selectedPackage}</span>{" "}
							ticket(s) will power your current fleet for approximately{" "}
							<span className="text-white font-bold">{hours}</span> hours of
							continuous execution.
						</p>
					</div>
				</div>

				{/* Right: Checkout */}
				<div className="col-span-12 lg:col-span-5">
					<div className="glass-card p-8 border border-[#00FFA3]/20 bg-black/40 backdrop-blur-md rounded-2xl shadow-[0_0_30px_rgba(0,255,163,0.05)]">
						<h3 className="text-xl font-bold mb-6 italic text-white">
							Secure <span className="text-[#00FFA3]">Checkout</span>
						</h3>

						{/* Reusable Payment Component */}
						<PaymentMethodSelector
							method={paymentMethod}
							setMethod={setPaymentMethod}
							amount={price}
						/>

						{/* Order Summary */}
						<div className="mt-8 pt-6 border-t border-white/10">
							<div className="flex justify-between items-center mb-1">
								<span className="text-gray-500 text-xs">Subtotal</span>
								<span className="font-mono text-sm text-white">
									${price.toFixed(2)}
								</span>
							</div>
							<div className="flex justify-between items-center mb-4">
								<span className="text-gray-500 text-xs">Transaction Fee</span>
								<span className="font-mono text-sm text-white">$0.00</span>
							</div>
							<div className="flex justify-between items-center mb-6">
								<span className="text-lg font-bold text-white">
									Total Amount
								</span>
								<span className="text-2xl font-bold text-[#00FFA3] font-mono">
									${price.toFixed(2)}
								</span>
							</div>
						</div>

						<button className="w-full bg-[#00FFA3] text-black font-black py-4 rounded-xl shadow-[0_10px_20px_rgba(0,255,163,0.2)] hover:scale-[1.02] transition uppercase tracking-tighter">
							Confirm Refuel
						</button>
					</div>
				</div>
			</div>
		</section>
	);
}
