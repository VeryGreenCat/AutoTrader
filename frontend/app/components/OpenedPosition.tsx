"use client";

interface Position {
	pair: string;
	type: "Buy" | "Sell";
	entry: number;
	lot: number;
	tp: number;
	sl: number;
	profit: number;
}

interface Props {
	positions: Position[];
}

export default function OpenPosition({ positions }: Props) {
	return (
		<div className="bg-[var(--color-card-background)] border border-[#1f2937] rounded-2xl p-6 w-full">
			<h2 className="text-gray-300 text-sm font-medium tracking-wider mb-4">
				ACTIVE POSITIONS
			</h2>

			<div
				className={`space-y-5 ${positions.length > 3 ? "max-h-[420px] overflow-y-auto pr-2" : ""}`}
			>
				{positions.map((pos, index) => (
					<div
						key={index}
						className="bg-[#11161c] border border-[#1e293b] rounded-xl p-5 flex justify-between items-center"
					>
						{/* Left */}
						<div>
							<p className="text-white font-medium text-base">{pos.pair}</p>
							<p className="text-gray-400 text-sm">
								{pos.type} @ {pos.entry}
							</p>
							<p className="text-gray-400 text-sm">Lot: {pos.lot}</p>
						</div>

						{/* Middle */}
						<div className="text-gray-400 text-sm space-y-1 text-right">
							<p>TP: {pos.tp}</p>
							<p>SL: {pos.sl}</p>
						</div>

						{/* Right Profit */}
						<div
							className={`px-4 py-1.5 rounded-lg font-medium text-sm ${
								pos.profit >= 0
									? "bg-emerald-500/15 text-emerald-400"
									: "bg-red-500/15 text-red-400"
							}`}
						>
							{pos.profit >= 0 ? "+" : ""}${pos.profit.toFixed(2)}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
