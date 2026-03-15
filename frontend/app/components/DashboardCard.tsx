import { cardType } from "@/types/dashboardCard";

const DashboardCard = ({
	type,
	value,
	subValue,
}: {
	type: cardType;
	value?: number | string;
	subValue?: string | number;
}) => {
	const renderSubValue = (val?: string | number) => {
		if (val === undefined || val === null) return null;
		
		if (typeof val === "number") {
			const isPositive = val >= 0;
			return (
				<p className={`text-xs mt-2 ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
					{isPositive ? "▲" : "▼"} {Math.abs(val).toFixed(2)}%
				</p>
			);
		}
		
		return <p className="text-xs text-emerald-400 mt-2">{val}</p>;
	};

	const formatCurrency = (val: number) => {
		const isNegative = val < 0;
		const absVal = Math.abs(val);
		return `${isNegative ? "-" : "+"}$${absVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
	};

	const formatStandard = (val: number) => {
		return `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
	};

	switch (type) {
		case "TT_equity":
			return (
				<div className="bg-[var(--color-card-background)] backdrop-blur-xl border rounded-xl p-6 border-l-4 border-emerald-500">
					<p className="text-xs text-gray-500 uppercase mb-1">Total Equity</p>
					<h2 className="text-3xl font-bold">
						{typeof value === "number"
							? formatStandard(value)
							: value || "$0.00"}
					</h2>
					{subValue ? renderSubValue(subValue) : <p className="text-xs text-gray-500 mt-2">Floating P/L active</p>}
				</div>
			);
		case "TT_pl":
			return (
				<div className="bg-[var(--color-card-background)] backdrop-blur-xl border border-white/10 rounded-xl p-6">
					<p className="text-xs text-gray-500 uppercase mb-1">
						Today's total P/L
					</p>
					<h2
						className={`text-3xl font-bold ${typeof value === "number" && value < 0 ? "text-red-500" : "text-[#00FFA3]"}`}
					>
						{typeof value === "number"
							? formatCurrency(value)
							: value || "+$0.00"}
					</h2>
				</div>
			);
		case "TT_bots":
			return (
				<div className="bg-[var(--color-card-background)] backdrop-blur-xl border border-white/10 rounded-xl p-6">
					<p className="text-xs text-gray-500 uppercase mb-1">
						Total Active Bots
					</p>
					<h2 className="text-3xl font-bold">{value || "0"}</h2>
				</div>
			);
		case "TT_week_pl":
			return (
				<div className="bg-[var(--color-card-background)] backdrop-blur-xl border rounded-xl p-6 border-l-4 border-yellow-500">
					<p className="text-xs text-gray-500 uppercase mb-1">
						This week’s total P/L
					</p>
					<h2
						className={`text-3xl font-bold ${typeof value === "number" && value < 0 ? "text-red-500" : "text-[#00FFA3]"}`}
					>
						{typeof value === "number"
							? formatCurrency(value)
							: value || "+$0.00"}
					</h2>
					{subValue ? renderSubValue(subValue) : <p className="text-xs text-gray-500 mt-2">Cumulative week</p>}
				</div>
			);
		case "equity":
			return (
				<div className="bg-[var(--color-card-background)] backdrop-blur-xl border rounded-xl p-6 border-l-4 border-emerald-500">
					<p className="text-xs text-gray-500 uppercase mb-1">Equity</p>
					<h2 className="text-3xl font-bold">
						{typeof value === "number"
							? formatStandard(value)
							: value || "$0.00"}
					</h2>
					{subValue ? renderSubValue(subValue) : <p className="text-xs text-gray-500 mt-2">Account Equity</p>}
				</div>
			);
		case "pl":
			return (
				<div className="bg-[var(--color-card-background)] backdrop-blur-xl border border-white/10 rounded-xl p-6">
					<p className="text-xs text-gray-500 uppercase mb-1">Today's P/L</p>
					<h2
						className={`text-3xl font-bold ${typeof value === "number" && value < 0 ? "text-red-500" : "text-[#00FFA3]"}`}
					>
						{typeof value === "number"
							? formatCurrency(value)
							: value || "+$0.00"}
					</h2>
				</div>
			);
		case "bots":
			return (
				<div className="bg-[var(--color-card-background)] backdrop-blur-xl border border-white/10 rounded-xl p-6">
					<p className="text-xs text-gray-500 uppercase mb-1">Active Bots</p>
					<h2 className="text-3xl font-bold">{value || "0"}</h2>
				</div>
			);
		case "balance":
			return (
				<div className="bg-[var(--color-card-background)] backdrop-blur-xl border rounded-xl p-6 border-l-4 border-yellow-500">
					<p className="text-xs text-gray-500 uppercase mb-1">Balance</p>
					<h2 className="text-3xl font-bold">
						{typeof value === "number"
							? formatStandard(value)
							: value || "$0.00"}
					</h2>
					{subValue ? renderSubValue(subValue) : <p className="text-xs text-gray-500 mt-2">Available Balance</p>}
				</div>
			);
		case "connection":
			return (
				<div className="bg-[var(--color-card-background)] backdrop-blur-xl border border-white/10 rounded-xl p-6">
					<p className="text-xs text-gray-500 uppercase mb-1">Connection</p>
					<h2
						className={`text-3xl font-bold ${value === "connected" ? "text-[#00FFA3]" : "text-red-500"}`}
					>
						{value || "disconnected"}
					</h2>
				</div>
			);
		default:
			return <div>dashboardCard</div>;
	}
};

export default DashboardCard;
