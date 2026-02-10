"use client";

import React from "react";
import { CreditCard, CheckCircle2, Plus } from "lucide-react";

interface PaymentMethodSelectorProps {
	method: "card" | "qr";
	setMethod: (method: "card" | "qr") => void;
	amount: number; // Used to generate the specific QR code
}

export default function PaymentMethodSelector({
	method,
	setMethod,
	amount,
}: PaymentMethodSelectorProps) {
	return (
		<div className="w-full">
			{/* Method Switcher Tabs */}
			<div className="flex gap-2 p-1 bg-black/40 rounded-xl mb-6 border border-white/5">
				<button
					onClick={() => setMethod("card")}
					className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all uppercase ${
						method === "card"
							? "bg-[#00FFA3] text-black shadow-[0_0_10px_rgba(0,255,163,0.3)]"
							: "hover:bg-white/5 text-gray-400"
					}`}
				>
					Credit Card
				</button>
				<button
					onClick={() => setMethod("qr")}
					className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all uppercase ${
						method === "qr"
							? "bg-[#00FFA3] text-black shadow-[0_0_10px_rgba(0,255,163,0.3)]"
							: "hover:bg-white/5 text-gray-400"
					}`}
				>
					PromptPay QR
				</button>
			</div>

			{/* Card View */}
			{method === "card" && (
				<div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
					<div className="p-4 border border-[#00FFA3]/50 bg-[#00FFA3]/5 rounded-xl cursor-pointer flex justify-between items-center hover:bg-[#00FFA3]/10 transition">
						<div className="flex items-center gap-3">
							<CreditCard className="w-5 h-5 text-[#00FFA3]" />
							<span className="text-sm font-bold text-white">•••• 4242</span>
						</div>
						<CheckCircle2 className="w-4 h-4 text-[#00FFA3]" />
					</div>

					<button className="w-full py-3 border border-dashed border-white/20 rounded-xl text-[10px] font-bold text-gray-500 hover:border-[#00FFA3] hover:text-[#00FFA3] transition uppercase flex items-center justify-center gap-2">
						<Plus className="w-3 h-3" /> Use a different card
					</button>
				</div>
			)}

			{/* QR View */}
			{method === "qr" && (
				<div className="text-center py-4 bg-black/20 rounded-2xl border border-white/5 animate-in fade-in slide-in-from-right-4 duration-300">
					<div className="bg-white p-2 rounded-xl inline-block mb-4 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
						<img
							src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=Payment_${amount.toFixed(2)}`}
							alt="Payment QR"
							className="w-32 h-32 rounded-lg"
						/>
					</div>
					<p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">
						Scan to pay{" "}
						<span className="text-[#00FFA3] font-bold">
							${amount.toFixed(2)}
						</span>
					</p>
					<p className="text-xs font-bold text-white">
						PromptPay ID: 088-XXX-XXXX
					</p>
				</div>
			)}
		</div>
	);
}
