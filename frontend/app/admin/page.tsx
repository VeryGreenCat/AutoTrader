"use client";

import { useState } from "react";
import { Search, Activity } from "lucide-react";
import { message } from "antd"; // Ant Design for notifications

// --- Mock Data Type ---
interface UserData {
	id: string;
	joinDate: string;
	accounts: number;
	lastPaymentAmount: number;
	lastPaymentDate: string;
	fuel: number;
	botsRunning: number;
	status: "active" | "disabled";
}

// --- Mock Data ---
const INITIAL_USERS: UserData[] = [
	{
		id: "#USR-8821932-X",
		joinDate: "01/12/24",
		accounts: 3,
		lastPaymentAmount: 71.97,
		lastPaymentDate: "Oct 27, 2025",
		fuel: 142.5,
		botsRunning: 8,
		status: "active",
	},
	{
		id: "#USR-1049281-Z",
		joinDate: "22/10/25",
		accounts: 1,
		lastPaymentAmount: 9.0,
		lastPaymentDate: "Oct 20, 2025",
		fuel: 4.2,
		botsRunning: 0,
		status: "disabled",
	},
	{
		id: "#USR-3392104-A",
		joinDate: "05/11/25",
		accounts: 5,
		lastPaymentAmount: 120.5,
		lastPaymentDate: "Nov 01, 2025",
		fuel: 89.0,
		botsRunning: 12,
		status: "active",
	},
];

export default function AdminPage() {
	const [searchTerm, setSearchTerm] = useState("");
	const [users, setUsers] = useState<UserData[]>(INITIAL_USERS);

	// Filter Logic
	const filteredUsers = users.filter((user) =>
		user.id.toLowerCase().includes(searchTerm.toLowerCase()),
	);

	// Action Handler
	const handleLockFleet = (userId: string) => {
		message.loading({ content: "Locking protocols initiated...", key: "lock" });

		setTimeout(() => {
			message.success({
				content: `Fleet for ${userId} has been emergency locked.`,
				key: "lock",
				duration: 3,
			});

			// Update local state to reflect change (optional visual feedback)
			setUsers((prev) =>
				prev.map((u) =>
					u.id === userId ? { ...u, status: "disabled", botsRunning: 0 } : u,
				),
			);
		}, 1500);
	};

	return (
		<section className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
			{/* Header Section */}
			<div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
				<div>
					<h2 className="text-4xl font-bold tracking-tighter uppercase italic text-white">
						Command <span className="text-red-500">Authority</span>
					</h2>
					<p className="text-gray-500 text-sm mt-1">
						Global User Management & Fleet Oversight
					</p>
				</div>

				{/* Search Input */}
				<div className="relative w-full md:w-96">
					<Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
					<input
						type="text"
						placeholder="Search by User ID (e.g. #USR-882...)"
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-xs text-white focus:border-[#00FFA3] outline-none transition-all placeholder:text-gray-600"
					/>
				</div>
			</div>

			{/* KPI Cards Grid */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
				<div className="glass-card p-6 border-[#00FFA3]/10 bg-[#00FFA3]/5 rounded-2xl border">
					<p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-1">
						Total Gross Revenue
					</p>
					<p className="text-3xl font-black italic text-white">$42,105.50</p>
					<div className="mt-2 flex items-center gap-2">
						<span className="text-[10px] text-[#00FFA3] font-bold">
							+12% vs last week
						</span>
					</div>
				</div>

				<div className="glass-card p-6 border-white/5 bg-white/5 rounded-2xl border">
					<p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-1">
						Performance Fees (10%)
					</p>
					<p className="text-2xl font-mono font-bold text-cyan-400">
						$12,490.12
					</p>
					<p className="text-[9px] text-gray-500 mt-1 uppercase">
						Earned from user profits
					</p>
				</div>

				<div className="glass-card p-6 border-white/5 bg-white/5 rounded-2xl border">
					<p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-1">
						Ticket Sales Income
					</p>
					<p className="text-2xl font-mono font-bold text-purple-400">
						$29,615.38
					</p>
					<p className="text-[9px] text-gray-500 mt-1 uppercase">
						Direct Fuel purchases
					</p>
				</div>

				<div className="glass-card p-6 border-white/5 bg-white/5 rounded-2xl border">
					<p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-1">
						Weekly Net Income
					</p>
					<p className="text-2xl font-mono font-bold text-[#00FFA3]">
						+$3,120.00
					</p>
					<p className="text-[9px] text-gray-500 mt-1 uppercase">
						Current 7-day window
					</p>
				</div>
			</div>

			{/* Secondary Metrics Grid */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
				<div className="glass-card p-6 border-white/5 bg-white/5 rounded-2xl border flex flex-col justify-between">
					<div className="flex justify-between items-start">
						<div>
							<p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">
								Global Latency
							</p>
							<p className="text-2xl font-mono font-bold text-emerald-400">
								14ms
							</p>
						</div>
						<div className="w-12 h-12 rounded-full border-2 border-emerald-500/20 flex items-center justify-center">
							<Activity className="w-5 h-5 text-emerald-500" />
						</div>
					</div>
					<p className="text-[9px] text-gray-500 mt-4 italic">
						Average round-trip time (VPS to Broker NY4)
					</p>
				</div>

				<div className="glass-card p-6 border-white/5 bg-white/5 rounded-2xl border">
					<p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-2">
						Fleet Deployment
					</p>
					<div className="flex items-end gap-2">
						<p className="text-3xl font-bold font-mono text-white">1,024</p>
						<p className="text-sm text-gray-500 pb-1">/ 1,500 Bots Online</p>
					</div>
					<div className="w-full bg-white/5 h-1.5 rounded-full mt-4 overflow-hidden">
						<div className="bg-[#00FFA3] h-full" style={{ width: "68%" }}></div>
					</div>
				</div>

				<div className="glass-card p-6 border-white/5 bg-white/5 rounded-2xl border">
					<p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest mb-2">
						MT5 Bridge Status
					</p>
					<div className="flex items-end gap-2">
						<p className="text-3xl font-bold font-mono text-white">312</p>
						<p className="text-sm text-gray-500 pb-1 text-red-400">
							/ 8 Accounts Offline
						</p>
					</div>
					<p className="text-[9px] text-gray-600 mt-4 uppercase">
						Target Stability: 99.9%
					</p>
				</div>
			</div>

			{/* Admin Table */}
			<div className="glass-card border border-white/10 rounded-2xl overflow-hidden overflow-x-auto bg-black/20 backdrop-blur-md">
				<table className="w-full text-left border-collapse">
					<thead className="bg-white/5 text-[10px] text-gray-500 uppercase tracking-widest font-bold">
						<tr>
							<th className="px-6 py-5">User Identity</th>
							<th className="px-6 py-5">MT5 Accounts</th>
							<th className="px-6 py-5">Latest Payment</th>
							<th className="px-6 py-5">Fuel (Tickets)</th>
							<th className="px-6 py-5">Fleet Status</th>
							<th className="px-6 py-5 text-right">Emergency Actions</th>
						</tr>
					</thead>
					<tbody className="text-xs font-mono divide-y divide-white/5">
						{filteredUsers.length > 0 ? (
							filteredUsers.map((user) => (
								<tr key={user.id} className="hover:bg-white/[0.02] transition">
									{/* User ID */}
									<td className="px-6 py-5">
										<span className="text-white font-bold block">
											{user.id}
										</span>
										<span className="text-[9px] text-gray-600 font-sans">
											joined_{user.joinDate}
										</span>
									</td>

									{/* Accounts */}
									<td className="px-6 py-5 text-gray-300">
										<span className="px-2 py-1 bg-white/5 rounded border border-white/10">
											{user.accounts.toString().padStart(2, "0")} Account
											{user.accounts !== 1 && "s"}
										</span>
									</td>

									{/* Payment */}
									<td className="px-6 py-5">
										<span
											className={
												user.lastPaymentAmount > 50
													? "text-[#00FFA3]"
													: "text-white"
											}
										>
											${user.lastPaymentAmount.toFixed(2)}
										</span>
										<p className="text-[9px] text-gray-600 font-sans uppercase">
											{user.lastPaymentDate}
										</p>
									</td>

									{/* Fuel */}
									<td className="px-6 py-5 text-gray-300">
										<span className="font-bold">{user.fuel} Tickets</span>
									</td>

									{/* Fleet Status */}
									<td className="px-6 py-5">
										<div className="flex items-center gap-2">
											<span
												className={`w-1.5 h-1.5 rounded-full ${user.botsRunning > 0 ? "bg-[#00FFA3]" : "bg-red-500"}`}
											></span>
											<span className="text-[10px] uppercase text-gray-400">
												{user.botsRunning > 0
													? `${user.botsRunning} Bots Running`
													: "All Disabled"}
											</span>
										</div>
									</td>

									{/* Actions */}
									<td className="px-6 py-5 text-right">
										<button
											onClick={() => handleLockFleet(user.id)}
											className="px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all font-bold text-[9px] uppercase active:scale-95"
										>
											Lock All Bots
										</button>
									</td>
								</tr>
							))
						) : (
							<tr>
								<td
									colSpan={6}
									className="px-6 py-8 text-center text-gray-500 italic"
								>
									No users found matching "{searchTerm}"
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</section>
	);
}
