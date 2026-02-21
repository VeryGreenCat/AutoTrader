"use client";

import { useEffect, useState } from "react";
import { Switch } from "antd";

// --- Types ---
interface BotDetail {
	id: string;
	name: string;
	isActive: boolean;
	pair: string;
	pnl: number;
}

// --- Mock API ---
const getBotById = async (botId: string): Promise<BotDetail> => {
	return new Promise((resolve) => {
		// Simulating variations based on ID for demonstration
		setTimeout(() => {
			resolve({
				id: botId,
				name: "Bot_name01",
				isActive: botId === "b1",
				pair: botId === "b1" ? "EURUSD" : botId === "b2" ? "tha/jpy" : "gbpusd",
				pnl: botId === "b2" ? -656.32 : 12.4,
			});
		}, 300);
	});
};

interface BotRowProps {
	botId: string;
	accountStatus: boolean; // Helps determine overarching disconnects
}

export default function BotRow({ botId, accountStatus }: BotRowProps) {
	const [botData, setBotData] = useState<BotDetail | null>(null);
	const [switchState, setSwitchState] = useState(false);

	useEffect(() => {
		getBotById(botId).then((data) => {
			setBotData(data);
			setSwitchState(data.isActive);
		});
	}, [botId]);

	if (!botData) {
		return (
			<div className="w-full h-16 bg-[#141414] animate-pulse rounded-xl border border-gray-800"></div>
		);
	}

	// Determine if row should be grayed out (bot is inactive or account is disconnected)
	const isRowDisabled = !switchState || !accountStatus;

	return (
		<div className="flex items-center justify-between p-4 bg-[#141414] rounded-xl border border-gray-800/60 hover:border-gray-700 transition-colors">
			{/* Name and Status Badge */}
			<div className="flex items-center gap-6 w-1/3">
				<span
					className={`font-semibold ${isRowDisabled ? "text-gray-600" : "text-gray-200"}`}
				>
					{botData.name}
				</span>
				<div
					className={`px-3 py-0.5 rounded-full border text-xs font-bold uppercase tracking-wider
          ${
						switchState
							? "border-[#00FFA3]/30 text-[#00FFA3] bg-[#00FFA3]/5"
							: "border-red-500/30 text-red-500 bg-red-500/5"
					}
          ${isRowDisabled && switchState ? "opacity-50" : ""}`} // Drops opacity slightly if disabled by account status but switch is on
				>
					{switchState ? "active" : "inactive"}
				</div>
			</div>

			{/* Currency Pair */}
			<div className="w-1/4">
				<span
					className={`uppercase font-medium tracking-wider ${isRowDisabled ? "text-gray-700" : "text-gray-400"}`}
				>
					{botData.pair}
				</span>
			</div>

			{/* PnL */}
			<div className="w-1/4 flex items-center gap-2">
				<span
					className={`text-sm ${isRowDisabled ? "text-gray-600" : "text-gray-500"}`}
				>
					Profit / Loss :
				</span>
				<span
					className={`font-bold ${
						isRowDisabled
							? "text-gray-700"
							: botData.pnl >= 0
								? "text-[#00FFA3]"
								: "text-red-500"
					}`}
				>
					{botData.pnl >= 0 ? "+" : ""}${Math.abs(botData.pnl).toFixed(2)}
				</span>
			</div>

			<div className="w-[10%] flex justify-end">
				<Switch
					checked={switchState}
					onChange={(checked) => setSwitchState(checked)}
					disabled={!accountStatus}
					style={{
						background: switchState
							? accountStatus
								? "#00FFA3"
								: "#14533D"
							: "#333",
					}}
				/>
			</div>
		</div>
	);
}
