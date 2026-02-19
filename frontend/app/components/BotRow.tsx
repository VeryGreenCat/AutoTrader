"use client";

import { useState } from "react";
import { Switch, message } from "antd";

interface Bot {
	id: string;
	name: string;
	pair: string;
	status: "active" | "force_stop" | "disconnected";
	profit: number;
	canRun?: boolean;
	disabled?: boolean;
}

interface Props {
	bot: Bot;
}

export default function BotRow({ bot }: Props) {
	const isForceStop = bot.status === "force_stop";

	// Internal state to manage the bot's running status independently
	// Automatically force to 'false' if it's a force stop
	const [isRunning, setIsRunning] = useState(
		isForceStop ? false : (bot.canRun ?? true),
	);
	const [isUpdating, setIsUpdating] = useState(false);

	const handleToggle = async (checked: boolean) => {
		setIsUpdating(true);
		try {
			// ---- Placeholder API Call ----
			console.log(`Sending API request: POST /api/bots/${bot.id}/toggle`, {
				enabled: checked,
			});

			await new Promise((resolve) => setTimeout(resolve, 600));

			setIsRunning(checked);
			message.success(`${bot.name} ${checked ? "started" : "stopped"}`);
		} catch (error) {
			message.error("Failed to update bot status");
		} finally {
			setIsUpdating(false);
		}
	};

	const statusColor = {
		active: "text-emerald-400 border-emerald-400 bg-emerald-400/5",
		force_stop: "text-red-500 border-red-500 bg-red-500/5", // Changed to red for the warning
		disconnected: "text-gray-400 border-gray-400 bg-gray-400/5",
	};

	// Determine UI State
	const isRowInactive = !isRunning || isForceStop;

	// Determine Display Status Text
	let displayStatus = bot.status.replace("_", " ");
	let displayColor = statusColor[bot.status] || statusColor.disconnected;

	if (isForceStop) {
		displayStatus = "! unpaid bill / ran out of ticket !";
		displayColor = statusColor.force_stop;
	} else if (!isRunning) {
		displayStatus = "disconnected";
		displayColor = statusColor.disconnected;
	}

	return (
		<div
			className={`grid grid-cols-5 items-center bg-[#0f141a] border border-[#1e293b] rounded-xl px-5 py-3 transition-all duration-300 ${
				isForceStop ? "opacity-40 cursor-not-allowed" : ""
			}`}
		>
			{/* Data Columns - Grayed out if inactive/force_stop */}
			<div
				className={`contents transition-opacity duration-300 ${
					isRowInactive ? "opacity-50 grayscale-[0.5]" : "opacity-100"
				}`}
			>
				{/* Name & ID */}
				<div className="col-span-1">
					<p className="text-sm text-white font-semibold truncate">
						{bot.name}
					</p>
					<p className="text-[10px] text-gray-500 font-mono uppercase tracking-wider">
						ID: {bot.id}
					</p>
				</div>

				{/* Status - Dynamic based on logic */}
				<div className="col-span-1 justify-self-start">
					<span
						className={`text-[9px] px-2 py-0.5 rounded border font-bold uppercase tracking-tight ${displayColor}`}
					>
						{displayStatus}
					</span>
				</div>

				{/* Pair */}
				<div className="col-span-1 text-sm text-gray-400 font-medium">
					{bot.pair}
				</div>

				{/* Profit */}
				<div
					className={`col-span-1 text-sm font-bold ${
						bot.profit >= 0 ? "text-emerald-400" : "text-red-400"
					}`}
				>
					{bot.profit >= 0 ? "+" : ""}${bot.profit.toFixed(2)}
				</div>
			</div>

			{/* Toggle Column - Stays bright unless force_stop */}
			<div className="col-span-1 justify-self-end">
				<Switch
					checked={isRunning}
					onChange={handleToggle}
					loading={isUpdating}
					disabled={isForceStop}
					size="small"
					className={isRunning && !isForceStop ? "!bg-emerald-500" : ""}
				/>
			</div>
		</div>
	);
}
