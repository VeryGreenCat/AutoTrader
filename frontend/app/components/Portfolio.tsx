"use client";

import { Pie } from "@ant-design/charts";
import { useEffect, useState } from "react";
import { getAccountById } from "@/services/mt5";
import { MT5 } from "@/types/mt5";

// Mock equity per account until the real equity API is ready
const getMockEquity = (mt5Id: string): number => {
	// Deterministic mock value based on mt5_id characters so it's stable per account
	const seed = mt5Id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
	return Math.round(((seed % 9000) + 1000) * 1.37);
};

export default function Portfolio() {
	const [accounts, setAccounts] = useState<MT5[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchAccounts = async () => {
			try {
				const userId = localStorage.getItem("user_id");
				if (!userId) return;
				const res = await getAccountById(userId);
				setAccounts(res.data || []);
			} catch (error) {
				console.error("Portfolio: failed to fetch accounts", error);
			} finally {
				setLoading(false);
			}
		};
		fetchAccounts();
	}, []);

	const chartColors = [
		"#00FFA3", // Emerald
		"#FF4D4F", // Rose
		"#1890FF", // Blue
		"#FFC53D", // Yellow
		"#722ED1", // Purple
		"#13C2C2", // Cyan
		"#FA8C16", // Orange
	];

	// Build chart data using account name + mock equity
	const data = accounts.map((acc) => ({
		type: acc.name,
		value: getMockEquity(acc.mt5_id),
	}));

	const config = {
		data,
		angleField: "value",
		colorField: "type",
		radius: 0.85,
		innerRadius: 0.65,
		color: chartColors,
		theme: "dark",
		label: false,
		legend: {
			position: "bottom" as const,
			itemValueLabel: {
				formatter: (text: string, item: any) => {
					const val = data.find((d) => d.type === item.value)?.value;
					return val ? ` $${val.toLocaleString()}` : "";
				},
				style: { fill: "#999" },
			},
		},
		tooltip: false,
		padding: [20, 0, 40, 0] as [number, number, number, number],
		autoFit: true,
	};

	return (
		<div className="flex flex-col h-[450px] bg-[var(--color-card-background)] backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl">
			{/* Header */}
			<div className="px-5 py-4 border-b border-white/10 bg-white/[0.03] flex items-center justify-between">
				<h3 className="text-[11px] font-bold uppercase tracking-[0.25em] text-white">
					Portfolio Distribution (Equity)
				</h3>
				<div className="w-2 h-2 rounded-full bg-[#00FFA3] animate-pulse" />
			</div>

			{/* Chart Section */}
			<div className="flex-1 overflow-y-auto custom-scrollbar">
				{loading ? (
					<div className="flex items-center justify-center h-full text-gray-500 text-sm">
						Loading...
					</div>
				) : accounts.length === 0 ? (
					<div className="flex items-center justify-center h-full text-gray-500 text-sm">
						No accounts found.
					</div>
				) : (
					<>
						<div className="h-[240px] w-full">
							<Pie {...config} />
						</div>

						{/* Account Breakdown List */}
						<div className="px-5 pb-5 space-y-2">
							<p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-3">
								Account Breakdown
							</p>
							{accounts.map((acc, index) => {
								const equity = getMockEquity(acc.mt5_id);
								return (
									<div
										key={acc.mt5_id}
										className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-colors group"
									>
										<div className="flex items-center gap-3">
											<div
												className="w-1.5 h-1.5 rounded-full"
												style={{
													backgroundColor:
														chartColors[index % chartColors.length],
												}}
											/>
											<span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
												{acc.name}
											</span>
										</div>
										{/* Mock equity value — replace with real equity API later */}
										<span className="text-xs font-mono font-bold text-[#00FFA3]">
											${equity.toLocaleString()}
										</span>
									</div>
								);
							})}
						</div>
					</>
				)}
			</div>
		</div>
	);
}
