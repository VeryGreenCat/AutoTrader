"use client";

import React, { useState } from "react";
import { Gift, ChevronDown, Download } from "lucide-react";
import CompletePayment from "../components/CompletePayment";

export default function BillingPage() {
	const [paymentMethod, setPaymentMethod] = useState<"card" | "qr">("card");
	const [isHistoryOpen, setIsHistoryOpen] = useState(false);

	const SETTLEMENT_AMOUNT = 71.97;

	return (
		<section className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 max-w-7xl mx-auto px-4">
			{/* Header */}
			<div className="mb-10">
				<h2 className="text-4xl font-bold tracking-tighter uppercase italic text-white">
					Weekly <span className="text-[#00FFA3]">Settlement</span>
				</h2>
				<p className="text-gray-500 text-sm mt-1">
					Invoice Period: Oct 20 - Oct 27, 2025
				</p>
			</div>

			<div className="grid grid-cols-12 gap-8">
				{/* Left: Performance Log */}
				<div className="col-span-12 lg:col-span-7 space-y-6">
					<div className="glass-card p-6 border border-white/5 bg-white/5 rounded-2xl">
						<h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">
							Accout Performance Log
						</h3>

						<div className="space-y-3">
							<div className="flex justify-between items-center p-4 bg-white/5 rounded-xl border-l-2 border-[#00FFA3]">
								<div>
									<p className="text-xs font-bold text-white">
										ICMarkets-Main (Account_1)
									</p>
									<p className="text-[10px] text-gray-500">EURUSD + USDJPY</p>
								</div>
								<div className="text-right">
									<p className="text-sm font-mono text-[#00FFA3]">+$840.20</p>
									<p className="text-[9px] text-gray-500">Realized P/L</p>
								</div>
							</div>
						</div>

						<div className="mt-8 pt-6 border-t border-white/10">
							<div className="flex justify-between mb-2">
								<span className="text-gray-400 text-sm">
									Total Accounts Net Profit:
								</span>
								<span className="text-xl font-bold font-mono text-[#00FFA3]">
									$719.70
								</span>
							</div>

							<div className="bg-[#00FFA3]/5 p-4 rounded-2xl border border-[#00FFA3]/20 mt-4">
								<div className="flex justify-between items-center mb-2">
									<span className="text-xs font-bold uppercase tracking-tighter text-white">
										5% Performance Fee
									</span>
									<span className="text-lg font-bold text-[#00FFA3]">
										${SETTLEMENT_AMOUNT}
									</span>
								</div>
								<div className="flex justify-between items-center">
									<div className="flex items-center gap-2">
										<Gift className="w-3 h-3 text-cyan-400" />
										<span className="text-[10px] text-gray-400">
											Rebate: 1 Ticket per $20 Profit
										</span>
									</div>
									<span className="text-xs font-bold text-cyan-400">
										+35 Free Tickets
									</span>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Right: Payment */}
				<CompletePayment
					type="settlement"
					subtotal={SETTLEMENT_AMOUNT}
					transFee={0}
				/>
			</div>

			{/* Transaction History (Collapsed) */}
			<div className="mt-12">
				<button
					onClick={() => setIsHistoryOpen(!isHistoryOpen)}
					className="flex items-center gap-3 group bg-white/5 border border-white/10 px-6 py-4 rounded-2xl w-full hover:bg-white/10 transition-all outline-none"
				>
					<ChevronDown
						className={`w-5 h-5 text-[#00FFA3] transition-transform duration-300 ${isHistoryOpen ? "rotate-180" : ""}`}
					/>
					<span className="text-xs font-bold uppercase tracking-[0.3em] text-white">
						Access Transaction Ledger
					</span>
					<div className="h-[1px] flex-1 bg-white/10 ml-4 group-hover:bg-white/20 transition-colors"></div>
				</button>

				{isHistoryOpen && (
					<div className="animate-in slide-in-from-top-2 duration-300 glass-card mt-4 border border-white/5 rounded-2xl p-8 text-center text-gray-500 text-xs">
						Transaction history content...
					</div>
				)}
			</div>
		</section>
	);
}
