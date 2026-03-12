"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AccountCard from "../components/AccountCard";
import ConnectMT5 from "../components/ConnectMT5";
import { getAccountById } from "@/services/mt5";
import { Spin, App } from "antd";
import { MT5 } from "@/types/mt5";

export default function Bots() {
	const { modal } = App.useApp();
	const router = useRouter();
	const [accounts, setAccounts] = useState<MT5[]>([]);
	const [openModal, setOpenModal] = useState(false);
	const [loading, setLoading] = useState(true);
	const [isBanned, setIsBanned] = useState(false);
	const [hasNoTime, setHasNoTime] = useState(false);
	const userId = localStorage.getItem("user_id");

	const fetchData = async () => {
		try {
			setLoading(true);

			if (!userId) {
				setLoading(false);
				return;
			}

			// API Call: Get User Accounts and Ban Status
			const userRes = await getAccountById(userId);

			const userIsBanned = !!userRes.is_banned;
			const userHasNoTime = userRes.remaining_seconds <= 0;

			setIsBanned(userIsBanned);
			setHasNoTime(userHasNoTime);

			if (userIsBanned) {
				modal.confirm({
					title: "Action Required: Outstanding Balance",
					content:
						"Your account has been temporarily suspended due to an unpaid billing balance. All trading bots will remain disabled until the outstanding balance is settled. Please manage any open positions manually in your MT5 terminal to prevent unexpected losses.",
					okText: "Go to Billing",
					okType: "danger",
					cancelText: "Cancel",
					centered: true,
					onOk: () => {
						router.push("/billing");
					},
				});
			} else if (userHasNoTime) {
				modal.confirm({
					title: "Balance Depleted: Bots Deactivated",
					content:
						"Your time balance has reached zero. All trading bots have been automatically deactivated. Please purchase more tickets to resume automated trading. In the meantime, please manage any open positions manually in your MT5 terminal.",
					okText: "Top Up Now",
					okType: "danger",
					cancelText: "Cancel",
					centered: true,
					onOk: () => {
						router.push("/buyTickets");
					},
				});
			}

			// Sort accounts: connected (true) first, then disconnected (false)
			const sortedAccounts = [...userRes.data].sort((a, b) => {
				if (a.status === b.status) return 0;
				return a.status ? -1 : 1;
			});

			setAccounts(sortedAccounts);
		} catch (error) {
			console.error("Failed to fetch data", error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchData();

		window.addEventListener("MT5_ACCOUNTS_UPDATED", fetchData);
		return () => {
			window.removeEventListener("MT5_ACCOUNTS_UPDATED", fetchData);
		};
	}, []);

	return (
		<section className="pb-20 max-w-7xl mx-auto px-4">
			{/* Header */}
			<div className="mb-10">
				<h2 className="text-4xl font-bold tracking-tighter uppercase italic text-white">
					Bot <span className="text-[#00FFA3]">Manager</span>
				</h2>
				<p className="text-gray-500 text-sm mt-1">
					Overview of linked MT5 terminals and active bots.
				</p>
			</div>

			<div className="space-y-8">
				{loading ? (
					<div className="flex items-center justify-center">
						<Spin size="large" />
					</div>
				) : (
					accounts.map((account) => (
						<AccountCard
							key={account.mt5_id}
							account={account}
							isBanned={isBanned || hasNoTime}
							onDelete={fetchData}
						/>
					))
				)}

				{/* Add Account Button */}
				<div
					onClick={() => setOpenModal(true)}
					className="cursor-pointer bg-[#0b1117] border border-[#1e293b] rounded-2xl p-10 text-center hover:border-[#00FFA3] transition"
				>
					<div className="flex flex-col items-center gap-3">
						<div className="w-12 h-12 rounded-full bg-[#11161c] flex items-center justify-center text-2xl text-gray-400">
							+
						</div>

						<p className="text-sm text-gray-400 font-medium">Add MT5 Account</p>

						<p className="text-xs text-gray-600">
							Expand your account to multiple brokers
						</p>
					</div>
				</div>
			</div>

			{/* Add Account Modal */}
			{openModal && (
				<ConnectMT5
					open={openModal}
					setOpen={setOpenModal}
					onSuccess={fetchData}
				/>
			)}
		</section>
	);
}
