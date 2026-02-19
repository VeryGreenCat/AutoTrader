import { Pie } from "@ant-design/charts";

type Account = {
	name: string;
	value: number;
};

type PortfolioProps = {
	accounts: Account[];
};

export default function Portfolio({ accounts }: PortfolioProps) {
	const chartColors = [
		"#00FFA3", // Emerald
		"#FF4D4F", // Rose
		"#1890FF", // Blue
		"#FFC53D", // Yellow
		"#722ED1", // Purple
		"#13C2C2", // Cyan
		"#FA8C16", // Orange
	];

	const data = accounts.map((acc) => ({
		type: acc.name,
		value: Math.abs(acc.value),
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
				style: {
					fill: "#999",
				},
			},
		},
		tooltip: {
			showTitle: false,
			showMarkers: false,
		},
		padding: [20, 0, 40, 0],
		autoFit: true,
	};

	return (
		<div className="flex flex-col h-[450px] bg-[var(--color-card-background)] backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl">
			{/* Header */}
			<div className="px-5 py-4 border-b border-white/10 bg-white/[0.03] flex items-center justify-between">
				<h3 className="text-[11px] font-bold uppercase tracking-[0.25em] text-white">
					Portfolio Distribution
				</h3>
				<div className="w-2 h-2 rounded-full bg-[#00FFA3] animate-pulse" />
			</div>

			{/* Chart Section */}
			<div className="flex-1 overflow-y-auto custom-scrollbar">
				<div className="h-[240px] w-full pt-4">
					<Pie {...config} />
				</div>

				{/* Custom List */}
				<div className="px-5 pb-5 space-y-2">
					<p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-3">
						Account Breakdown
					</p>
					{accounts.map((item, index) => (
						<div
							key={index}
							className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-colors group"
						>
							<div className="flex items-center gap-3">
								<div
									className="w-1.5 h-1.5 rounded-full"
									style={{
										backgroundColor: chartColors[index % chartColors.length],
									}}
								/>
								<span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
									{item.name}
								</span>
							</div>
							<span
								className={`text-xs font-mono font-bold ${
									item.value >= 0 ? "text-[#00FFA3]" : "text-[#FF4D4F]"
								}`}
							>
								{item.value >= 0 ? "+" : "-"}$
								{Math.abs(item.value).toLocaleString()}
							</span>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
