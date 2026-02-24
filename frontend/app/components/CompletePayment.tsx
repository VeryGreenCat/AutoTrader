"use client";

import { useState } from "react";
import { createCheckoutSession } from "@/services/payment";
import { Loader2 } from "lucide-react";

type CompletePaymentProps = {
	subtotal: number;
	transFee: number;
};

const CompletePayment = ({ subtotal, transFee }: CompletePaymentProps) => {
	const [loading, setLoading] = useState(false);

	const purchaseTicket = async () => {
		try {
			setLoading(true);
			const userId = localStorage.getItem("user_id");
			if (!userId) {
				console.error("User ID not found");
				setLoading(false);
				return;
			}
			const totalAmount = subtotal + transFee;
			console.log(`Purchasing... Price: $${totalAmount}`);

			const res = await createCheckoutSession(totalAmount, userId);
			if (res && res.url) {
				window.location.href = res.url;
			} else {
				console.error("Failed to retrieve checkout URL");
				setLoading(false);
			}
		} catch (error) {
			console.error("Purchase failed", error);
			setLoading(false);
		}
	};

	return (
		<>
			<div className="col-span-12 lg:col-span-5">
				<div className="glass-card h-full flex flex-col p-8 border border-[#00FFA3]/20 bg-black/40 backdrop-blur-md rounded-2xl shadow-[0_0_30px_rgba(0,255,163,0.05)]">
					<h3 className="text-xl font-bold mb-6 italic text-white">
						Complete <span className="text-[#00FFA3]">Purchase</span>
					</h3>

					{/* Order Summary */}
					<div className="mt-6 flex-1">
						<div className="flex justify-between items-center mb-1">
							<span className="text-gray-500 text-xs">Subtotal</span>
							<span className="font-mono text-sm text-white">
								${subtotal.toFixed(2)}
							</span>
						</div>
						<div className="flex justify-between items-center mb-4">
							<span className="text-gray-500 text-xs">Transaction Fee</span>
							<span className="font-mono text-sm text-white">
								${transFee.toFixed(2)}
							</span>
						</div>
						<div className="flex justify-between items-center mb-6">
							<span className="text-lg font-bold text-white">Total Amount</span>
							<span className="text-2xl font-bold text-[#00FFA3] font-mono">
								${(subtotal + transFee).toFixed(2)}
							</span>
						</div>
					</div>

					<button
						onClick={purchaseTicket}
						disabled={loading}
						className="w-full bg-[#00FFA3] text-black font-black py-4 rounded-xl shadow-[0_10px_20px_rgba(0,255,163,0.2)] hover:scale-[1.02] transition uppercase tracking-wide cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
					>
						{loading && <Loader2 className="w-5 h-5 animate-spin" />}
						{loading ? "Processing..." : "Confirm Purchase"}
					</button>
				</div>
			</div>
		</>
	);
};

export default CompletePayment;
