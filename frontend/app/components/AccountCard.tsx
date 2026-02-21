"use client";

import { useEffect, useState } from "react";
import BotRow from "./BotRow";
import DeployModal from "./DeployModal";
import { Server, Plus, Trash2 } from "lucide-react";
import { Modal, message } from "antd";
import { deleteAccount } from "@/services/mt5";
import { MT5 } from "@/types/mt5";
import { Bot } from "@/types/bot";
import { getBotsByMt5Id } from "@/services/bots";

export default function AccountCard({
	account,
	onDelete,
}: {
	account: MT5;
	onDelete?: () => void;
}) {
	const [bots, setBots] = useState<Bot[]>([]);
	const [loading, setLoading] = useState(true);
	const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);

	const handleDelete = () => {
		Modal.confirm({
			title: "Delete Account",
			content: `Are you sure you want to delete "${account.name}"? This action cannot be undone.`,
			okText: "Delete",
			okType: "danger",
			cancelText: "Cancel",
			centered: true,
			onOk: async () => {
				try {
					await deleteAccount(account.mt5_id);
					message.success("Account deleted successfully");
					if (onDelete) onDelete();
				} catch (error) {
					console.error("Failed to delete account:", error);
					message.error("Failed to delete account");
				}
			},
		});
	};

	const fetchBots = async () => {
		if (account?.mt5_id) {
			try {
				const res = await getBotsByMt5Id(account.mt5_id);
				setBots(res.data);
			} catch (error) {
				console.error("Failed to fetch bots:", error);
			} finally {
				setLoading(false);
			}
		}
	};

	useEffect(() => {
		fetchBots();
	}, [account]);

	if (!account) return null;

	// Mocking equity and active bot counts since they aren't in the MT5 interface
	const activeBotsCount = bots.filter((b) => b.status).length;
	const totalBotsCount = bots.length;
	const mockEquity = account.balance * 1.05; // Just for display purposes

	return (
		<div className="w-full bg-[#0a0a0a] rounded-2xl border border-gray-800 p-1 font-sans text-white mb-6">
			{/* Top Header Card */}
			<div className="bg-[#141414] rounded-xl border border-gray-800 p-4 flex flex-wrap lg:flex-nowrap items-center justify-between gap-6 mb-4">
				{/* Account Info */}
				<div className="flex items-center gap-4 min-w-[250px]">
					<div className="w-14 h-14 rounded-xl bg-[#00FFA3]/10 border border-[#00FFA3]/30 flex items-center justify-center shadow-[0_0_15px_rgba(0,255,163,0.1)]">
						<Server className="w-6 h-6 text-[#00FFA3]" />
					</div>
					<div className="flex flex-col">
						<h3 className="font-bold text-lg leading-tight">{account.name}</h3>
						<span className="text-gray-500 text-xs">
							Token: {account.token}
						</span>
						<span className="text-gray-500 text-xs">
							mt5ID: {account.mt5_id}
						</span>
					</div>
				</div>

				{/* Stats Section */}
				<div className="flex gap-8 lg:gap-16 flex-1 px-4 border-l border-r border-gray-800">
					<div className="flex flex-col">
						<span className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">
							Equity
						</span>
						<span className="text-2xl font-bold">
							$
							{mockEquity.toLocaleString(undefined, {
								minimumFractionDigits: 0,
								maximumFractionDigits: 0,
							})}
						</span>
					</div>
					<div className="flex flex-col">
						<span className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">
							Bots Running
						</span>
						<span className="text-2xl font-bold text-[#00FFA3]">
							{activeBotsCount}
							<span className="text-gray-500 text-lg">/{totalBotsCount}</span>
						</span>
					</div>
					<div className="flex flex-col">
						<span className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">
							Balance
						</span>
						<span className="text-2xl font-bold">
							{account.balance.toLocaleString(undefined, {
								minimumFractionDigits: 2,
							})}
						</span>
					</div>
				</div>

				{/* Action & Status Indicator */}
				<div className="flex flex-col items-end justify-center min-w-[150px] gap-3">
					<div
						className={`px-4 py-1.5 rounded-full border flex items-center gap-2 text-sm font-medium capitalize
            ${
							account.status
								? "border-[#00FFA3]/30 text-[#00FFA3]"
								: "border-red-500/30 text-red-500"
						}`}
					>
						<div
							className={`w-2 h-2 rounded-full ${account.status ? "bg-[#00FFA3] shadow-[0_0_8px_rgba(0,255,163,0.8)] animate-pulse" : "bg-red-500 shadow-[0_0_8px_rgba(255,0,0,0.8)]"}`}
						></div>
						{account.status ? "connected" : "disconnected"}
					</div>
					<div className="flex gap-2">
						<button
							onClick={handleDelete}
							className="text-[10px] font-bold uppercase tracking-wider bg-red-500/10 text-red-500 border border-red-500/30 px-3 py-1.5 rounded-md flex items-center gap-1 hover:bg-red-500 hover:text-white transition-all w-max cursor-pointer"
						>
							<Trash2 className="w-3 h-3" />
						</button>
						<button
							onClick={() => setIsDeployModalOpen(true)}
							disabled={!account.status}
							className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-md flex items-center gap-1 transition-all w-max
                ${
									account.status
										? "bg-[#00FFA3] text-black hover:shadow-[0_0_15px_rgba(0,255,163,0.4)] cursor-pointer"
										: "bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700"
								}`}
						>
							<Plus className="w-3 h-3" /> Deploy New Bot
						</button>
					</div>
				</div>
			</div>

			{/* Bot List (Scrollable if > 5 items) */}
			<div className="px-2 pb-2 max-h-[400px] overflow-y-auto space-y-2 custom-scrollbar">
				{loading ? (
					<div className="text-center py-8 text-gray-500 text-sm">
						Loading Bots...
					</div>
				) : bots.length === 0 ? (
					<div className="text-center py-8 text-gray-500 text-sm">
						No bots deployed yet.
					</div>
				) : (
					bots.map((bot) => (
						<BotRow
							key={bot.bot_id}
							botId={bot.bot_id}
							accountStatus={account.status}
						/>
					))
				)}
			</div>

			{/* Deployment Modal */}
			<DeployModal
				open={isDeployModalOpen}
				onClose={() => setIsDeployModalOpen(false)}
				onSuccess={fetchBots}
				mt5Id={account.mt5_id}
			/>
		</div>
	);
}
