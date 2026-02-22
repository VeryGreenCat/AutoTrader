"use client";

import { useState, useEffect } from "react";
import { Switch, App } from "antd";
import { Trash2 } from "lucide-react";
import { deleteBot, updateBotStatus } from "@/services/bots";
import { BotRowProps } from "@/types/bot";

export default function BotRow({
	bot,
	accountStatus,
	onDelete,
	onStatusChange,
}: BotRowProps) {
	const { message, modal } = App.useApp();
	const [switchState, setSwitchState] = useState(bot.status);

	useEffect(() => {
		setSwitchState(bot.status);
	}, [bot.status]);

	const handleDeleteBot = () => {
		modal.confirm({
			title: "Delete Bot",
			content:
				"Are you sure you want to delete this bot? This action cannot be undone.",
			okText: "Delete",
			okType: "danger",
			cancelText: "Cancel",
			centered: true,
			onOk: async () => {
				try {
					await deleteBot(bot.bot_id);
					message.success("Bot deleted successfully");
					if (onDelete) onDelete();
				} catch (error) {
					console.error("Failed to delete bot:", error);
					message.error("Failed to delete bot");
				}
			},
		});
	};

	const handleStatusChange = async (checked: boolean) => {
		try {
			await updateBotStatus(bot.bot_id, checked);
			setSwitchState(checked);

			// Notify other components (like Navbar) to refresh profile data
			window.dispatchEvent(new CustomEvent("BOT_STATUS_UPDATED"));

			message.success(
				`Bot ${checked ? "activated" : "deactivated"} successfully`,
			);
		} catch (error) {
			console.error("Failed to update bot status:", error);
			message.error("Failed to update bot status");
		} finally {
			if (onStatusChange) onStatusChange();
		}
	};

	// Mock PnL for connected accounts as requested
	const pnlValue = accountStatus ? 12.45 : null;

	// Determine if row should be grayed out (bot is inactive or account is disconnected)
	const isRowDisabled = !switchState || !accountStatus;

	return (
		<div className="flex items-center justify-between p-4 bg-[#141414] rounded-xl border border-gray-800/60 hover:border-gray-700 transition-colors">
			{/* Name and Status Badge */}
			<div className="flex items-center gap-6 w-1/3">
				<span
					className={`font-semibold ${isRowDisabled ? "text-gray-600" : "text-gray-200"}`}
				>
					{bot.name}
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
					{bot.currency}
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
							: pnlValue !== null && pnlValue >= 0
								? "text-[#00FFA3]"
								: pnlValue !== null
									? "text-red-500"
									: "text-gray-500"
					}`}
				>
					{pnlValue !== null
						? `${pnlValue >= 0 ? "+" : ""}$${Math.abs(pnlValue).toFixed(2)}`
						: "--"}
				</span>
			</div>

			<div className="w-[10%] flex justify-end">
				<Switch
					checked={switchState}
					onChange={handleStatusChange}
					disabled={!accountStatus}
					style={{
						background: switchState
							? accountStatus
								? "#00FFA3"
								: "#14533D"
							: "#333",
					}}
				/>
				<button
					onClick={handleDeleteBot}
					className="ml-4 p-1.5 rounded-lg bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all cursor-pointer"
				>
					<Trash2 className="w-3.5 h-3.5" />
				</button>
			</div>
		</div>
	);
}
