"use client";

import React from "react";
import { Trash2, CreditCard } from "lucide-react";

export interface CardData {
	id: string;
	last4: string;
	holderName: string;
	expiry: string; // e.g., "12/26"
	brand?: string; // e.g., "visa", "mastercard"
}

interface PaymentCardProps {
	data: CardData;
	onRemove: (id: string) => void;
}

export default function PaymentCard({ data, onRemove }: PaymentCardProps) {
	return (
		<div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-2xl p-6 relative group overflow-hidden transition-all hover:border-[#00FFA3]/30">
			{/* Hover Glow Effect */}
			<div className="absolute -right-4 -top-4 w-24 h-24 bg-[#00FFA3]/5 rounded-full blur-2xl group-hover:bg-[#00FFA3]/10 transition duration-500"></div>

			<div className="flex justify-between items-start mb-8">
				{/* Card Brand Icon Placeholder */}
				<CreditCard className="w-8 h-8 text-gray-400 opacity-50" />

				<button
					onClick={() => onRemove(data.id)}
					className="text-gray-600 hover:text-red-500 transition-colors p-1"
					title="Remove Card"
				>
					<Trash2 className="w-4 h-4" />
				</button>
			</div>

			<p className="text-lg font-mono tracking-widest mb-6 text-white shadow-black drop-shadow-md">
				•••• •••• •••• {data.last4}
			</p>

			<div className="flex justify-between items-end">
				<div>
					<p className="text-[9px] text-gray-500 uppercase tracking-wider mb-1">
						Card Holder
					</p>
					<p className="text-xs font-bold uppercase text-gray-300 group-hover:text-white transition-colors">
						{data.holderName}
					</p>
				</div>
				<div className="text-right">
					<p className="text-[9px] text-gray-500 uppercase tracking-wider mb-1">
						Expires
					</p>
					<p className="text-xs font-mono text-[#00FFA3]">{data.expiry}</p>
				</div>
			</div>
		</div>
	);
}
