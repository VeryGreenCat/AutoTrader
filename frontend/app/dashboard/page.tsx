"use client";

import Script from "next/script";
import { Suspense } from "react";
import { Bot } from "@/types/bot";
import { useEffect, useState } from "react";
import LlmLogic from "../components/LlmLogic";
import Portfolio from "../components/Portfolio";
import { getBotsByMt5Id } from "@/services/bots";
import { useSearchParams } from "next/navigation";
import { MT5, MT5AccountCardStats } from "@/types/mt5";
import DashboardCard from "../components/DashboardCard";
import ClosedPosition from "../components/ClosedPosition";
import OpenedPosition from "../components/OpenedPosition";
import { getAccountById, getMt5Stats } from "@/services/mt5";
import All_ActivePosition from "../components/All_ActivePosition";

declare global {
	interface Window {
		TradingView: any;
	}
}

const DashboardContent = () => {
	const searchParams = useSearchParams();
	const accountParam = searchParams.get("account");
	const [accounts, setAccounts] = useState<MT5[]>([]);
	const [accountsStats, setAccountsStats] = useState<
		Record<string, MT5AccountCardStats>
	>({});
	const [accountsBots, setAccountsBots] = useState<Record<string, Bot[]>>({});
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const userId = localStorage.getItem("user_id");
				if (!userId) return;

				// 1. Get all accounts
				const accRes = await getAccountById(userId);
				const userAccounts: MT5[] = accRes.data || [];

				// Check for status changes or account count changes to notify Navbar
				// We use accounts state from closure - it will be the value from the last render
				setAccounts((prevAccounts) => {
					const hasChanged =
						userAccounts.length !== prevAccounts.length ||
						userAccounts.some((acc) => {
							const existing = prevAccounts.find(
								(a) => a.mt5_id === acc.mt5_id,
							);
							return existing && existing.status !== acc.status;
						});

					if (hasChanged && prevAccounts.length > 0) {
						window.dispatchEvent(new CustomEvent("MT5_ACCOUNTS_UPDATED"));
					}
					return userAccounts;
				});

				// 2. Fetch stats and bots for each account in parallel
				const statsPromises = userAccounts.map(async (acc) => {
					try {
						const [statsRes, botsRes] = await Promise.all([
							acc.status
								? getMt5Stats(acc.mt5_id)
								: Promise.resolve({ data: null, is_connected: false }),
							getBotsByMt5Id(acc.mt5_id),
						]);
						return {
							mt5_id: acc.mt5_id,
							stats: statsRes.data || null,
							is_connected: statsRes.is_connected,
							bots: botsRes.data || [],
						};
					} catch (e) {
						return {
							mt5_id: acc.mt5_id,
							stats: null,
							is_connected: false,
							bots: [],
						};
					}
				});

				const results = await Promise.all(statsPromises);
				// console.log("results", results);

				const statsMap: Record<string, MT5AccountCardStats> = {};
				const botsMap: Record<string, Bot[]> = {};

				results.forEach((res) => {
					if (res.stats) {
						statsMap[res.mt5_id] = {
							...res.stats,
							is_connected: res.is_connected,
						};
					}
					botsMap[res.mt5_id] = res.bots;
				});

				setAccountsStats(statsMap);
				setAccountsBots(botsMap);
			} catch (error) {
				console.error("Dashboard: failed to fetch data", error);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
		const interval = setInterval(fetchData, 60000); // Poll every 1 minute

		window.addEventListener("MT5_ACCOUNTS_UPDATED", fetchData);

		return () => {
			clearInterval(interval);
			window.removeEventListener("MT5_ACCOUNTS_UPDATED", fetchData);
		};
	}, []);

	// Aggregations
	const activeAccounts = accounts.filter(
		(acc) => accountsStats[acc.mt5_id]?.is_connected,
	);

	const totalEquity = activeAccounts.reduce(
		(sum, acc) => sum + (accountsStats[acc.mt5_id]?.equity || 0),
		0,
	);
	const totalTodayPL = activeAccounts.reduce(
		(sum, acc) => sum + (accountsStats[acc.mt5_id]?.realized_today || 0),
		0,
	);
	const totalWeekPL = activeAccounts.reduce(
		(sum, acc) => sum + (accountsStats[acc.mt5_id]?.realized_week || 0),
		0,
	);
	const totalActiveBots = accounts.reduce((sum, acc) => {
		const bots = accountsBots[acc.mt5_id] || [];
		return sum + bots.filter((b) => b.status).length;
	}, 0);

	// Specific account view
	const selectedAccount = accounts.find((acc) => acc.name === accountParam);
	const selectedStats = selectedAccount
		? accountsStats[selectedAccount.mt5_id]
		: null;
	const selectedBots = selectedAccount
		? accountsBots[selectedAccount.mt5_id] || []
		: [];
	const activeBotsForSelected = selectedBots.filter((b) => b.status).length;

	// Aggregate all active open positions for the All_ActivePosition component
	const allActivePositions = accounts.flatMap((acc) => {
		const stats = accountsStats[acc.mt5_id];
		if (!stats || !stats.open_positions) return [];
		return stats.open_positions.map((pos, idx) => ({
			key: `${acc.mt5_id}-${idx}`,
			pair: pos.pair,
			account: acc.name,
			type: pos.type as "BUY" | "SELL",
			lot: pos.lot,
			entry: pos.entry,
			current: pos.current,
			pl: pos.profit,
			bot: "Manual",
		}));
	});

	const initTradingView = () => {
		if (typeof window !== "undefined" && window.TradingView) {
			new window.TradingView.widget({
				symbol: "FX:EURUSD",
				interval: "1",
				timezone: "Etc/UTC",
				theme: "dark",
				style: "1",
				locale: "en",
				toolbar_bg: "#1e1e1e",
				enable_publishing: false,
				hide_top_toolbar: false,
				hide_legend: false,
				save_image: false,
				container_id: "tradingview_chart",
				allow_symbol_change: true,
				autosize: true,
			});
		}
	};

	return (
		<section className="pb-10 max-w-7xl mx-auto px-4">
			{/* Header */}
			<div className="mb-10">
				<h2 className="text-4xl font-bold tracking-tighter uppercase text-white">
					Dashboard - {accountParam || "Overview"}
				</h2>

				<p className="text-gray-500 text-sm mt-1">
					This page aggregates financial and trading data from every connected
					account.
				</p>
			</div>
			{/* below will be a 4 cards */}
			{!accountParam ? (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
					<DashboardCard
						type={"TT_equity"}
						value={totalEquity}
						subValue={`Across ${activeAccounts.length} accounts`}
					/>
					<DashboardCard type={"TT_pl"} value={totalTodayPL} />
					<DashboardCard
						type={"TT_bots"}
						value={totalActiveBots}
						subValue="Execution engines"
					/>
					<DashboardCard type={"TT_week_pl"} value={totalWeekPL} />
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
					<DashboardCard
						type={"equity"}
						value={selectedStats?.equity || 0}
						subValue={
							selectedStats
								? ((selectedStats.equity - selectedStats.balance) /
										selectedStats.balance) *
									100
								: undefined
						}
					/>
					<DashboardCard
						type={"pl"}
						value={selectedStats?.realized_today || 0}
					/>
					<DashboardCard
						type={"bots"}
						value={activeBotsForSelected}
						subValue="Targeted strategies"
					/>
					<DashboardCard
						type={"balance"}
						value={selectedStats?.balance || 0}
						subValue={
							selectedStats?.is_connected
								? "Live MT5 Balance"
								: "Last known state"
						}
					/>
				</div>
			)}

			<div className="grid grid-cols-3 gap-6 mb-6">
				<div className="col-span-2 flex items-center justify-center relative overflow-hidden h-[450px]">
					<div id="tradingview_chart" className="w-full h-full" />
					<Script
						src="https://s3.tradingview.com/tv.js"
						onReady={initTradingView}
					/>
				</div>
				{accountParam ? (
					<LlmLogic bots={selectedBots} accountName={accountParam} />
				) : (
					<Portfolio
						accounts={accounts}
						accountsStats={accountsStats}
						loading={loading}
					/>
				)}
			</div>
			{/* below will be 1 card */}
			{!accountParam ? (
				<All_ActivePosition data={allActivePositions} />
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-6">
					<ClosedPosition positions={selectedStats?.closed_positions || []} />
					<OpenedPosition positions={selectedStats?.open_positions || []} />
				</div>
			)}
		</section>
	);
};

export default function DashboardPage() {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<DashboardContent />
		</Suspense>
	);
}
