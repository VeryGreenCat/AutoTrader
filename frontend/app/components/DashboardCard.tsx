import { cardType } from "@/types/dashboardCard";

const DashboardCard = ({ type }: { type: cardType }) => {
	switch (type) {
		case "TT_equity":
			return (
				<div className="bg-[var(--color-card-background)] backdrop-blur-xl border rounded-xl p-6 border-l-4 border-emerald-500">
					<p className="text-xs text-gray-500 uppercase mb-1">Total Equity</p>
					<h2 className="text-3xl font-bold">$12,450.00</h2>
					<p className="text-xs text-emerald-400 mt-2">+12.5% this month</p>
				</div>
			);
		case "TT_pl":
			return (
				<div className="bg-[var(--color-card-background)] backdrop-blur-xl border border-white/10 rounded-xl p-6">
					<p className="text-xs text-gray-500 uppercase mb-1">
						Today's total P/L
					</p>
					<h2 className="text-3xl font-bold text-[#00FFA3]">+$245.20</h2>
				</div>
			);
		case "TT_bots":
			return (
				<div className="bg-[var(--color-card-background)] backdrop-blur-xl border border-white/10 rounded-xl p-6">
					<p className="text-xs text-gray-500 uppercase mb-1">
						Total Active Bots
					</p>
					<h2 className="text-3xl font-bold">4</h2>
				</div>
			);
		case "TT_week_pl":
			return (
				<div className="bg-[var(--color-card-background)] backdrop-blur-xl border rounded-xl p-6 border-l-4 border-yellow-500">
					<p className="text-xs text-gray-500 uppercase mb-1">
						This week’s total P/L
					</p>
					<h2 className="text-3xl font-bold">$12,450.00</h2>
					<p className="text-xs text-emerald-400 mt-2">+12.5% this week</p>
				</div>
			);
		case "equity":
			return (
				<div className="bg-[var(--color-card-background)] backdrop-blur-xl border rounded-xl p-6 border-l-4 border-emerald-500">
					<p className="text-xs text-gray-500 uppercase mb-1">Equity</p>
					<h2 className="text-3xl font-bold">$12,450.00</h2>
					<p className="text-xs text-emerald-400 mt-2">+12.5% this month</p>
				</div>
			);
		case "pl":
			return (
				<div className="bg-[var(--color-card-background)] backdrop-blur-xl border border-white/10 rounded-xl p-6">
					<p className="text-xs text-gray-500 uppercase mb-1">Today's P/L</p>
					<h2 className="text-3xl font-bold text-[#00FFA3]">+$40.00</h2>
				</div>
			);
		case "bots":
			return (
				<div className="bg-[var(--color-card-background)] backdrop-blur-xl border border-white/10 rounded-xl p-6">
					<p className="text-xs text-gray-500 uppercase mb-1">
						Active Bots
					</p>
					<h2 className="text-3xl font-bold">2</h2>
				</div>
			);
		case "balance":
			return (
				<div className="bg-[var(--color-card-background)] backdrop-blur-xl border rounded-xl p-6 border-l-4 border-yellow-500">
					<p className="text-xs text-gray-500 uppercase mb-1">Balance</p>
					<h2 className="text-3xl font-bold">$10,150.00</h2>
					<p className="text-xs text-emerald-400 mt-2">+12.5% this month</p>
				</div>
			);
		case "connection":
			return (
				<div className="bg-[var(--color-card-background)] backdrop-blur-xl border border-white/10 rounded-xl p-6">
					<p className="text-xs text-gray-500 uppercase mb-1">Connection</p>
					<h2 className="text-3xl font-bold text-[#00FFA3]">connected</h2>
				</div>
			);
		default:
			return <div>dashboardCard</div>;
	}
};

export default DashboardCard;
