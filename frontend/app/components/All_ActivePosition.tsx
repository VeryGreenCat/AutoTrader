"use client";

import { Table, ConfigProvider, theme } from "antd";

type Position = {
	key: string;
	pair: string;
	account: string;
	type: "BUY" | "SELL";
	lot: number;
	entry: number;
	current: number;
	pl: number;
	bot: string;
};

type Props = {
	data: Position[];
};

export default function ActivePositions({ data }: Props) {
	const columns = [
		{
			title: "MARKET",
			dataIndex: "pair",
			key: "pair",
			render: (_: any, record: Position) => (
				<div className="flex flex-col">
					<span className="text-white font-bold tracking-tight text-sm">
						{record.pair}
					</span>
					<span className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">
						{record.account}
					</span>
				</div>
			),
		},
		{
			title: "TYPE",
			dataIndex: "type",
			key: "type",
			render: (value: Position["type"]) => (
				<span
					className={`px-2 py-0.5 rounded text-[10px] font-bold ${
						value === "BUY"
							? "bg-emerald-500/10 text-[#00FFA3] border border-emerald-500/20"
							: "bg-red-500/10 text-[#FF4D4F] border border-red-500/20"
					}`}
				>
					{value}
				</span>
			),
		},
		{
			title: "LOT",
			dataIndex: "lot",
			key: "lot",
			render: (value: number) => (
				<span className="text-gray-300 font-mono text-sm">
					{value.toFixed(2)}
				</span>
			),
		},
		{
			title: "ENTRY",
			dataIndex: "entry",
			key: "entry",
			render: (value: number) => (
				<span className="text-gray-400 font-mono text-sm">
					{value.toLocaleString()}
				</span>
			),
		},
		{
			title: "CURRENT",
			dataIndex: "current",
			key: "current",
			render: (value: number) => (
				<span className="text-white font-mono text-sm font-medium">
					{value.toLocaleString()}
				</span>
			),
		},
		{
			title: "PROFIT/LOSS",
			dataIndex: "pl",
			key: "pl",
			render: (value: number) => (
				<span
					className={`text-sm font-mono font-bold ${
						value >= 0 ? "text-[#00FFA3]" : "text-[#FF4D4F]"
					}`}
				>
					{value >= 0 ? "+" : "-"}${Math.abs(value).toFixed(2)}
				</span>
			),
		},
		{
			title: "Bot",
			dataIndex: "bot",
			key: "bot",
			render: (value: string) => (
				<span className="text-[11px] text-gray-400 font-bold bg-white/5 px-2 py-1 rounded">
					{value}
				</span>
			),
		},
	];

	return (
		<ConfigProvider
			theme={{
				algorithm: theme.darkAlgorithm,
				token: {
					colorBgContainer: "transparent",
					colorBorderSecondary: "rgba(255, 255, 255, 0.05)",
					colorPrimary: "#00FFA3",
					fontFamily: "inherit",
				},
				components: {
					Table: {
						headerBg: "rgba(255, 255, 255, 0.02)",
						headerColor: "rgba(255, 255, 255, 0.45)",
						headerBorderRadius: 0,
						colorText: "#d1d5db",
						// fontSize: 12,
					},
				},
			}}
		>
			<div className="bg-[var(--color-card-background)] backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl">
				{/* Header */}
				<div className="px-5 py-4 border-b border-white/10 bg-white/[0.03] flex items-center justify-between">
					<h3 className="text-[11px] font-bold uppercase tracking-[0.25em] text-white">
						Active Trading Positions
					</h3>
					<div className="flex items-center gap-2">
						<span className="text-[10px] text-[#00FFA3] font-bold flex items-center gap-1">
							<span className="w-1.5 h-1.5 rounded-full bg-[#00FFA3] animate-pulse" />
							LIVE FEED
						</span>
					</div>
				</div>

				<div className="p-2 overflow-x-auto custom-scrollbar">
					<Table
						columns={columns}
						dataSource={data}
						pagination={false}
						className="custom-table"
						rowClassName="hover:bg-white/[0.02] transition-colors cursor-default"
					/>
				</div>
			</div>
		</ConfigProvider>
	);
}
