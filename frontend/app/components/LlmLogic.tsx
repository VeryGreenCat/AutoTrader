"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

interface FeedItem {
	time: string;
	message: string;
}

const MOCK_DATA: FeedItem[] = [
	{
		time: "14:41",
		message:
			"Market sentiment analysis complete. Hawkish signal detected in recent central bank communications. Adjusting risk parameters for USD pairs.",
	},
	{
		time: "15:02",
		message:
			"Technical pattern recognition identified potential RSI divergence on EUR/USD 1H timeframe. Monitoring for reversal confirmation.",
	},
	{
		time: "15:45",
		message:
			"Correlation matrix updated. High sensitivity noted between JPY crosses and treasury yields. Optimization pass scheduled.",
	},
];

const LlmLogic = ({ model_Id }: { model_Id?: string }) => {
	const [feed, setFeed] = useState<FeedItem[]>([]);
	const [loading, setLoading] = useState(true);

	const VERSION = "v2.5.0";
	const MODEL_NAME = model_Id || "Aura-Alpha-V2";

	useEffect(() => {
		const fetchFeed = async () => {
			setLoading(true);
			try {
				// Simulating API call
				await new Promise((resolve) => setTimeout(resolve, 500));
				setFeed(MOCK_DATA);
			} catch (error) {
				console.error("Failed to fetch LLM logic:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchFeed();
	}, [model_Id]);

	return (
		<div className="flex flex-col h-[450px] bg-[var(--color-card-background)] border border-white/10 rounded-xl overflow-hidden shadow-2xl">
			{/* Header */}
			<div className="px-5 py-4 border-b border-white/10 bg-white/[0.03]">
				<h3 className="text-[11px] font-bold uppercase tracking-[0.25em] text-white">
					LLM Logic Feed
				</h3>
			</div>

			{/* Main Content */}
			<div className="flex-1 overflow-y-auto p-5 space-y-7">
				{loading ? (
					<div className="h-full flex items-center justify-center">
						<div className="w-5 h-5 border-2 border-white/10 border-t-[#00FFA3] rounded-full animate-spin"></div>
					</div>
				) : (
					feed.map((item, i) => (
						<div key={i} className="flex gap-4 items-start group">
							<div className="flex items-center gap-1.5 text-gray-300 mt-1 shrink-0">
								<Clock className="w-3.5 h-3.5 opacity-60" />
								<span className="text-[11px] font-mono tabular-nums tracking-tight font-bold">
									{item.time}
								</span>
							</div>
							<p className="text-[14px] leading-relaxed text-white font-medium group-hover:text-[#00FFA3] transition-colors">
								{item.message}
							</p>
						</div>
					))
				)}
			</div>

			{/* Footer Status Bar */}
			<div className="px-5 py-3 border-t border-white/5 bg-black/20 flex justify-between items-center bg-white/[0.01]">
				<div className="flex items-center gap-4">
					<div className="flex flex-col">
						<span className="text-[9px] uppercase text-gray-500 font-bold tracking-widest leading-none mb-1.5">
							Processing Model
						</span>
						<span className="text-[11px] text-[#00FFA3] font-semibold tracking-wide">
							{MODEL_NAME}
						</span>
					</div>
				</div>
				<div className="text-right">
					<span className="px-2.5 py-1 rounded bg-white/5 text-[10px] text-gray-400 font-mono border border-white/5">
						{VERSION}
					</span>
				</div>
			</div>
		</div>
	);
};

export default LlmLogic;
