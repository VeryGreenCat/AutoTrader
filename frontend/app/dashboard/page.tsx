"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import DashboardCard from "../components/DashboardCard";
import Script from "next/script";
import LlmLogic from "../components/LlmLogic";
import Portfolio from "../components/Portfolio";
import All_ActivePosition from "../components/All_ActivePosition";
import OpenedPosition from "../components/OpenedPosition";
import ClosedPosition from "../components/ClosedPosition";

declare global {
	interface Window {
		TradingView: any;
	}
}

const DashboardContent = () => {
	const searchParams = useSearchParams();
	const account = searchParams.get("account");

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
		<section className="pb-20 max-w-7xl mx-auto px-4">
			{/* Header */}
			<div className="mb-10">
				<h2 className="text-4xl font-bold tracking-tighter uppercase text-white">
					Dashboard - {account || "Overview"}
				</h2>
				<p className="text-gray-500 text-sm mt-1">
					This page aggregates financial and trading data from every connected
					account.
				</p>
			</div>
			{/* below will be a 4 cards */}
			{!account ? (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
					<DashboardCard type={"TT_equity"} />
					<DashboardCard type={"TT_pl"} />
					<DashboardCard type={"TT_bots"} />
					<DashboardCard type={"TT_week_pl"} />
				</div>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
					<DashboardCard type={"equity"} />
					<DashboardCard type={"pl"} />
					<DashboardCard type={"bots"} />
					<DashboardCard type={"balance"} />
				</div>
			)}

			{/* below will be a 2 cards */}
			<div className="grid grid-cols-3 gap-6 mb-6">
				<div className="col-span-2 flex items-center justify-center relative overflow-hidden h-[450px]">
					<div id="tradingview_chart" className="w-full h-full" />
					<Script
						src="https://s3.tradingview.com/tv.js"
						onReady={initTradingView}
					/>
				</div>
				{account ? (
					<LlmLogic />
				) : (
					<Portfolio
						accounts={[
							{ name: "Account_1", value: 1248 },
							{ name: "Account_2", value: -100.68 },
							{ name: "Account_3", value: 500 },
							{ name: "Account_4", value: -200 },
						]}
					/>
				)}
			</div>
			{/* below will be 1 card */}
			{!account ? (
				<All_ActivePosition data={[]} />
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-6">
					<ClosedPosition
						positions={[
							{
								pair: "EURUSD",
								type: "Buy",
								entry: 1.12345,
								lot: 0.1,
								tp: 1.125,
								profit: 15.5,
							},
							{
								pair: "GBPUSD",
								type: "Sell",
								entry: 1.34567,
								lot: 0.05,
								tp: 1.34,
								profit: -10.2,
							},
							{
								pair: "EURUSD",
								type: "Buy",
								entry: 1.12345,
								lot: 0.1,
								tp: 1.125,
								profit: 15.5,
							},
							{
								pair: "GBPUSD",
								type: "Sell",
								entry: 1.34567,
								lot: 0.05,
								tp: 1.34,
								profit: -10.2,
							},
						]}
					/>
					<OpenedPosition
						positions={[
							{
								pair: "EURUSD",
								type: "Buy",
								entry: 1.12345,
								lot: 0.1,
								tp: 1.125,
								sl: 1.122,
								profit: 15.5,
							},
							{
								pair: "GBPUSD",
								type: "Sell",
								entry: 1.34567,
								lot: 0.05,
								tp: 1.34,
								sl: 1.348,
								profit: -10.2,
							},
						]}
					/>
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
