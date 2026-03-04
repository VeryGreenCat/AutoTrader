"use client";

import { Table, ConfigProvider, theme } from "antd";
import { ClosedPosition as Position } from "@/types/mt5";

interface Props {
	positions: Position[];
}

export default function ClosedPosition({ positions }: Props) {
	const columns = [
		{
			title: "MARKET",
			dataIndex: "pair",
			key: "pair",
			render: (text: string) => (
				<span className="text-white font-bold tracking-tight text-sm">
					{text}
				</span>
			),
		},
		{
			title: "TYPE",
			dataIndex: "type",
			key: "type",
			render: (value: string) => (
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
			title: "PROFIT/LOSS",
			dataIndex: "profit",
			key: "profit",
			align: "right" as const,
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
	];

	return (
		<div className="bg-[var(--color-card-background)] backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl h-full">
			{/* Header */}
			<div className="px-5 py-4 border-b border-white/10 bg-white/[0.03] flex items-center justify-between">
				<h3 className="text-[11px] font-bold uppercase tracking-[0.25em] text-white">
					Closed Positions
				</h3>
			</div>

			<div className="p-2 overflow-x-auto custom-scrollbar">
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
							},
						},
					}}
				>
					<Table
						columns={columns}
						dataSource={positions.map((p, i) => ({ ...p, key: i }))}
						pagination={false}
						className="custom-table"
						rowClassName="hover:bg-white/[0.02] transition-colors cursor-default"
						locale={{
							emptyText: (
								<div className="py-8 text-center text-gray-500 text-xs uppercase tracking-widest italic">
									No closed positions
								</div>
							),
						}}
					/>
				</ConfigProvider>
			</div>
		</div>
	);
}
