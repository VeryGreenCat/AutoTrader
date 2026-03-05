"use client";

import { useEffect, useState, useMemo } from "react";
import { Clock } from "lucide-react";
import { Select } from "antd";
import { Bot } from "@/types/bot";
import { getLLMTrans } from "@/services/llmTrans";

interface FeedItem {
	created: string;
	logic: string;
}

const LlmLogic = ({
	bots = [],
	accountName,
}: {
	bots?: Bot[];
	accountName?: string;
}) => {
	const [feed, setFeed] = useState<FeedItem[]>([]);
	const [loading, setLoading] = useState(false);
	const [selectedCurrency, setSelectedCurrency] = useState<string | null>(null);

	const VERSION = "v2.5.0";

	const activeBots = useMemo(() => bots.filter((b) => b.status), [bots]);

	const currencyOptions = useMemo(() => {
		const uniqueCurrencies = Array.from(
			new Set(activeBots.map((b) => b.currency)),
		);
		return uniqueCurrencies.map((c) => ({
			label: c.length === 6 ? `${c.slice(0, 3)}/${c.slice(3)}` : c,
			value: c,
		}));
	}, [activeBots]);

	useEffect(() => {
		if (currencyOptions.length > 0 && !selectedCurrency) {
			setSelectedCurrency(currencyOptions[0].value);
		} else if (currencyOptions.length === 0) {
			setSelectedCurrency(null);
		}
	}, [currencyOptions, selectedCurrency]);

	useEffect(() => {
		const fetchFeed = async () => {
			if (!selectedCurrency) {
				setFeed([]);
				return;
			}
			setLoading(true);
			try {
				const result = await getLLMTrans(selectedCurrency);
				setFeed(result.data || []);
			} catch (error) {
				console.error("Failed to fetch LLM logic:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchFeed();
	}, [selectedCurrency]);

	const selectDropdownStyle = {
		backgroundColor: "#1a1a1a",
		border: "1px solid #333",
		color: "white",
	};

	return (
		<div className="flex flex-col h-[450px] bg-[var(--color-card-background)] border border-white/10 rounded-xl overflow-hidden shadow-2xl">
			{/* Header */}
			<div className="px-5 py-4 border-b border-white/10 bg-white/[0.03] flex justify-between items-center">
				<h3 className="text-[11px] font-bold uppercase tracking-[0.25em] text-white">
					LLM Logic Feed
				</h3>
				{currencyOptions.length > 0 && (
					<Select
						className="w-32 h-8"
						placeholder="Currency"
						value={selectedCurrency}
						onChange={(val) => setSelectedCurrency(val)}
						options={currencyOptions}
						classNames={{ popup: { root: "dark-select-dropdown" } }}
						styles={{ popup: { root: selectDropdownStyle } }}
					/>
				)}
			</div>

			{/* Main Content */}
			<div className="flex-1 overflow-y-auto p-5 space-y-7">
				{activeBots.length === 0 ? (
					<div className="h-full flex items-center justify-center">
						<span className="text-gray-500 font-mono text-sm tracking-widest uppercase">
							no bot is working..
						</span>
					</div>
				) : loading ? (
					<div className="h-full flex items-center justify-center">
						<div className="w-5 h-5 border-2 border-white/10 border-t-[#00FFA3] rounded-full animate-spin"></div>
					</div>
				) : feed.length === 0 ? (
					<div className="h-full flex items-center justify-center">
						<span className="text-gray-500 font-mono text-sm tracking-widest uppercase">
							No logic updates yet
						</span>
					</div>
				) : (
					feed.map((item, i) => {
						const date = new Date(item.created);
						const timeString = `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
						return (
							<div key={i} className="flex gap-4 items-start group">
								<div className="flex items-center gap-1.5 text-gray-300 mt-1 shrink-0">
									<Clock className="w-3.5 h-3.5 opacity-60" />
									<span className="text-[11px] font-mono tabular-nums tracking-tight font-bold">
										{timeString}
									</span>
								</div>
								<p className="text-[14px] leading-relaxed text-white font-medium group-hover:text-[#00FFA3] transition-colors">
									{item.logic}
								</p>
							</div>
						);
					})
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
							{selectedCurrency
								? `Aura-Alpha-V2 (${selectedCurrency})`
								: "Aura-Alpha-V2"}
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
