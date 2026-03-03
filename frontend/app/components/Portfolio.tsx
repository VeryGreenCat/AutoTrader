"use client";

import { Pie } from "@ant-design/charts";
import { MT5, MT5AccountCardStats } from "@/types/mt5";

interface PortfolioProps {
	accounts: MT5[];
	accountsStats: Record<string, MT5AccountCardStats>;
	loading: boolean;
}

export default function Portfolio({
	accounts,
	accountsStats,
	loading,
}: PortfolioProps) {
	const chartColors = [
		"#00FFA3", // Emerald
		"#FF4D4F", // Rose
		"#1890FF", // Blue
		"#FFC53D", // Yellow
		"#722ED1", // Purple
		"#13C2C2", // Cyan
		"#FA8C16", // Orange
	];

	// Sort accounts: connected ones first
	const sortedAccounts = [...accounts].sort((a, b) => {
		const aConn = accountsStats[a.mt5_id]?.is_connected ? 1 : 0;
		const bConn = accountsStats[b.mt5_id]?.is_connected ? 1 : 0;
		return bConn - aConn;
	});

	// Build chart data using real equity of connected accounts only
	const data = sortedAccounts
		.filter((acc) => accountsStats[acc.mt5_id]?.is_connected)
		.map((acc) => ({
			type: acc.name,
			value: accountsStats[acc.mt5_id]?.equity || 0,
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
		tooltip: {
			formatter: (datum: any) => {
				return { name: datum.type, value: `$${datum.value.toLocaleString()}` };
			},
		},
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
							{sortedAccounts.map((acc, index) => {
								const stats = accountsStats[acc.mt5_id];
								const isConnected = stats?.is_connected;
								const equity = stats?.equity || 0;

								return (
									<div
										key={acc.mt5_id}
										className={`flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5 transition-colors group ${!isConnected ? "opacity-30 grayscale filter" : "hover:bg-white/[0.05]"}`}
									>
										<div className="flex items-center gap-3">
											<div
												className="w-1.5 h-1.5 rounded-full"
												style={{
													backgroundColor: isConnected
														? chartColors[index % chartColors.length]
														: "#444",
												}}
											/>
											<span
												className={`text-sm font-medium transition-colors ${isConnected ? "text-gray-300 group-hover:text-white" : "text-gray-500"}`}
											>
												{acc.name}
											</span>
										</div>

										<span
											className={`text-xs font-mono font-bold ${isConnected ? "text-[#00FFA3]" : "text-gray-600"}`}
										>
											{isConnected
												? `$${equity.toLocaleString()}`
												: "Disconnected"}
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
