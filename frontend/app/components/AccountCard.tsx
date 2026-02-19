"use client";

import { useEffect, useState } from "react";
import BotRow from "./BotRow";

interface AccountData {
	accountName: string;
	equity: number;
	botsRunning: number;
	balance: number;
	connected: boolean;
	bots: any[];
}

export default function AccountCard({ accountId }: { accountId: string }) {
	const [data, setData] = useState<AccountData | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		// ---- Simulate API Call ----
		// TODO: Replace with real API:
		// GET /api/accounts/{accountId}

		setTimeout(() => {
			const mockData: AccountData = {
				accountName: "MT5_account_" + accountId,
				equity: 14205,
				botsRunning: 3,
				balance: 568,
				connected: true,
				bots: [
					{
						id: "1",
						name: "Bot_name01",
						pair: "EURUSD",
						status: "active",
						profit: 12.4,
						canRun: true,
					},
					{
						id: "2",
						name: "Bot_name02",
						pair: "THAJPY",
						status: "force_stop",
						profit: -56.32,
						canRun: false,
					},
					{
						id: "3",
						name: "Bot_name03",
						pair: "GBPUSD",
						status: "disconnected",
						profit: 12.4,
						disabled: true,
						canRun: false,
					},
					{
						id: "4",
						name: "Bot_name04",
						pair: "EURUSD",
						status: "active",
						profit: 12.4,
						canRun: true,
					},
					{
						id: "5",
						name: "Bot_name05",
						pair: "THAJPY",
						status: "force_stop",
						profit: -56.32,
						canRun: false,
					},
					{
						id: "6",
						name: "Bot_name06",
						pair: "GBPUSD",
						status: "disconnected",
						profit: 12.4,
						disabled: true,
						canRun: false,
					},
				],
			};

			setData(mockData);
			setLoading(false);
		}, 800);
	}, [accountId]);

	if (loading) {
		return (
			<div className="bg-[#0b1117] border border-[#1e293b] rounded-2xl p-6">
				<p className="text-gray-400 text-sm">Loading account...</p>
			</div>
		);
	}

	if (!data) return null;

	return (
		<div className="bg-[#0b1117] border border-[#1e293b] rounded-2xl p-6 space-y-6">
			{/* Header */}
			<div className="flex justify-between items-center">
				<div>
					<p className="text-white text-sm font-medium">{data.accountName}</p>
					<p className="text-xs text-gray-500">Account ID: {accountId}</p>
				</div>

				<div
					className={`text-xs px-3 py-1 rounded-full ${
						data.connected
							? "bg-emerald-500/15 text-emerald-400"
							: "bg-red-500/15 text-red-400"
					}`}
				>
					{data.connected ? "connected" : "disconnected"}
				</div>
			</div>

			{/* Stats */}
			<div className="grid grid-cols-3 gap-4">
				<div className="bg-[#11161c] p-4 rounded-xl">
					<p className="text-xs text-gray-500">EQUITY</p>
					<p className="text-white text-base font-medium">
						${data.equity.toLocaleString()}
					</p>
				</div>

				<div className="bg-[#11161c] p-4 rounded-xl">
					<p className="text-xs text-gray-500">BOTS RUNNING</p>
					<p className="text-emerald-400 text-base font-medium">
						{data.botsRunning}
					</p>
				</div>

				<div className="bg-[#11161c] p-4 rounded-xl">
					<p className="text-xs text-gray-500">BALANCE</p>
					<p className="text-white text-base font-medium">
						${data.balance.toLocaleString()}
					</p>
				</div>
			</div>

			{/* Bots List */}
			<div
				className={`space-y-3 ${
					data.bots.length > 5 ? "max-h-[350px] overflow-y-auto pr-2" : ""
				}`}
			>
				{data.bots.map((bot) => (
					<BotRow key={bot.id} bot={bot} />
				))}
			</div>
		</div>
	);
}
