"use client";

import { useState, useEffect } from "react";
import { Gift } from "lucide-react";
import { Table, ConfigProvider, theme } from "antd";
import CompletePayment from "../components/CompletePayment";
import { getBillById, getUnpaidBills } from "@/services/billing";
import { Billing } from "@/types/billing";
import { Acc_PnL_response } from "@/types/transaction";
import { DisplayAcc_PnL } from "@/services/transaction";

export default function BillingPage() {
	const [accounts, setAccounts] = useState<Acc_PnL_response[]>([]);
	const [unpaidBill, setUnpaidBill] = useState<Billing | null>(null);
	const [bills, setBills] = useState<Billing[]>([]);
	const [loading, setLoading] = useState(true);
	const [billsLoading, setBillsLoading] = useState(true);

	useEffect(() => {
		const userId = localStorage.getItem("user_id");
		if (!userId) return;

		const fetchUnpaidBill = async (userId: string) => {
			try {
				const res = await getUnpaidBills(userId);
				setUnpaidBill(res.data || null);
				console.log("unpaidBill", res.data);
			} catch (error) {
				console.error("Failed to fetch bill:", error);
			} finally {
				setLoading(false);
			}
		};

		const fetchBills = async (userId: string) => {
			try {
				const res = await getBillById(userId);
				setBills(res.data || []);
				console.log("bills", res.data);
			} catch (error) {
				console.error("Failed to fetch bills:", error);
			} finally {
				setBillsLoading(false);
			}
		};

		fetchUnpaidBill(userId);
		fetchBills(userId);
	}, []);

	useEffect(() => {
		const fetchAccounts = async () => {
			if (unpaidBill) {
				try {
					const res = await DisplayAcc_PnL({
						user_id: unpaidBill.user_id,
						start_period: unpaidBill.start_period,
						end_period: unpaidBill.end_period,
					});
					console.log(
						"req",
						unpaidBill.user_id,
						unpaidBill.start_period,
						unpaidBill.end_period,
					);
					setAccounts(res.data || []);
					console.log("accounts", res.data);
				} catch (error) {
					console.error("Failed to fetch accounts:", error);
				} finally {
					setLoading(false);
				}
			}
		};

		fetchAccounts();
	}, [unpaidBill]);

	const NET_PROFIT = accounts.reduce((acc, account) => acc + account.pnl, 0);
	const PERFORMANCE_FEE = NET_PROFIT * 0.05;

	const columns = [
		{
			title: "Billing Date",
			dataIndex: "created_at",
			key: "created_at",
			render: (text: string, record: Billing) => (
				<div className="flex flex-col">
					<span className="text-sm font-medium text-white group-hover:text-[#00FFA3] transition-colors">
						{new Date(text).toLocaleDateString("en-US", {
							month: "short",
							day: "numeric",
							year: "numeric",
						})}
					</span>
					<span className="text-[10px] text-gray-600 font-mono">
						ID: {record.bill_id}
					</span>
				</div>
			),
		},
		{
			title: "Amount",
			dataIndex: "amount",
			key: "amount",
			align: "right" as const,
			render: (amount: number) => (
				<span className="text-sm font-bold font-mono text-white">
					${amount.toFixed(2)}
				</span>
			),
		},
		{
			title: "Status",
			dataIndex: "status",
			key: "status",
			align: "center" as const,
			render: (status: string) => (
				<span
					className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
						status === "paid"
							? "bg-[#00FFA3]/10 text-[#00FFA3] border border-[#00FFA3]/20"
							: "bg-orange-500/10 text-orange-400 border border-orange-500/20"
					}`}
				>
					{status}
				</span>
			),
		},
		{
			title: "Due Date",
			dataIndex: "due_date",
			key: "due_date",
			align: "center" as const,
			render: (date: string) => (
				<span className="text-sm text-gray-400">
					{new Date(date).toLocaleDateString("en-US", {
						month: "short",
						day: "numeric",
						year: "numeric",
					})}
				</span>
			),
		},
		{
			title: "Paid At",
			dataIndex: "paid_at",
			key: "paid_at",
			align: "center" as const,
			render: (date: string | null) => (
				<span className="text-sm text-gray-400">
					{date
						? new Date(date).toLocaleDateString("en-US", {
								month: "short",
								day: "numeric",
								year: "numeric",
							})
						: "—"}
				</span>
			),
		},
	];

	return (
		<section className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 max-w-7xl mx-auto px-4">
			{/* Header */}
			<div className="mb-10">
				<h2 className="text-4xl font-bold tracking-tighter uppercase italic text-white">
					Weekly <span className="text-[#00FFA3]">Settlement</span>
				</h2>
				<p className="text-gray-500 text-sm mt-1">
					Settle your weekly performance fee to keep your bots running.
				</p>
			</div>

			{!unpaidBill ? (
				<div className="glass-card p-12 border border-white/5 bg-white/5 rounded-2xl text-center">
					<div className="max-w-md mx-auto">
						<div className="w-16 h-16 bg-[#00FFA3]/10 rounded-full flex items-center justify-center mx-auto mb-6">
							<Gift className="w-8 h-8 text-[#00FFA3]" />
						</div>
						<h3 className="text-xl font-bold text-white mb-2">
							No Outstanding Bills
						</h3>
						<p className="text-gray-500 text-sm">
							You're all caught up! There are no pending or overdue performance
							fees at this time.
						</p>
					</div>
				</div>
			) : (
				<div className="grid grid-cols-12 gap-8">
					{/* Left: Performance Log */}
					<div className="col-span-12 lg:col-span-7 space-y-6">
						<div className="glass-card p-6 border border-white/5 bg-white/5 rounded-2xl">
							<div className="flex justify-between items-center mb-6">
								<h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
									Account Performance Log
								</h3>
								<h3 className="text-xs font-bold text-orange-400 tracking-widest">
									Period:{" "}
									{new Date(unpaidBill.start_period).toLocaleDateString(
										"en-US",
										{
											month: "short",
											day: "numeric",
											year: "numeric",
										},
									)}{" "}
									-{" "}
									{new Date(unpaidBill.end_period).toLocaleDateString("en-US", {
										month: "short",
										day: "numeric",
										year: "numeric",
									})}
								</h3>
							</div>

							<div className="space-y-3">
								{loading ? (
									<div className="text-center py-4 text-gray-500 text-xs">
										Loading accounts...
									</div>
								) : accounts.length === 0 ? (
									<div className="text-center py-4 text-gray-500 text-xs">
										No accounts found.
									</div>
								) : (
									accounts.map((account) => (
										<div
											key={account.mt5_id}
											className="flex justify-between items-center p-4 bg-white/5 rounded-xl border-l-2 border-[#00FFA3]"
										>
											<div>
												<p className="text-xs font-bold text-white">
													{account.mt5_name}
												</p>
											</div>
											<div className="text-right">
												<p
													className={`text-sm font-mono ${account.pnl >= 0 ? "text-[#00FFA3]" : "text-red-400"}`}
												>
													{account.pnl >= 0 ? "+" : "-"}$
													{Math.abs(account.pnl).toFixed(2)}
												</p>
											</div>
										</div>
									))
								)}
							</div>

							<div className="mt-8 pt-6 border-t border-white/10">
								<div className="flex justify-between items-center mb-4 px-2">
									<span className="text-gray-400 text-sm">
										Total Accounts Net Profit:
									</span>
									<span className="text-sm font-medium font-mono text-gray-300">
										${NET_PROFIT.toFixed(2)}
									</span>
								</div>

								<div className="bg-[#00FFA3]/10 p-5 rounded-2xl border border-[#00FFA3]/30 mt-4 shadow-[0_0_20px_rgba(0,255,163,0.1)]">
									<div className="flex justify-between items-center mb-4">
										<span className="text-sm font-black uppercase text-white tracking-wider">
											Amount Due (5% Fee)
										</span>
										<span className="text-3xl font-black text-[#00FFA3] font-mono">
											${PERFORMANCE_FEE.toFixed(2)}
										</span>
									</div>

									<div className="flex justify-between items-center pt-4 border-t border-[#00FFA3]/20 mt-2">
										<div className="flex items-center gap-2">
											<Gift className="w-4 h-4 text-cyan-400" />
											<span className="text-xs text-cyan-400/80">
												Rebate: 1 Ticket per $20 Profit
											</span>
										</div>
										<span className="text-xs font-bold text-black bg-cyan-400 px-3 py-1 rounded-full uppercase tracking-wider">
											+{Math.floor(PERFORMANCE_FEE / 20)} Free Tickets
										</span>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Right: Payment */}
					<CompletePayment
						subtotal={unpaidBill.amount}
						transFee={0}
						billId={unpaidBill.bill_id}
					/>
				</div>
			)}

			{/* Transaction History Table */}
			<div className="mt-16">
				<div className="flex items-center gap-3 mb-8">
					<div className="h-[1px] w-8 bg-[#00FFA3]"></div>
					<h3 className="text-sm font-bold uppercase tracking-[0.3em] text-white">
						Transaction Ledger
					</h3>
					<div className="h-[1px] flex-1 bg-white/10"></div>
				</div>

				<div className="glass-card border border-white/5 bg-white/5 rounded-2xl overflow-hidden shadow-2xl">
					<div className="p-4 overflow-x-auto custom-scrollbar">
						<ConfigProvider
							theme={{
								algorithm: theme.darkAlgorithm,
								token: {
									colorBgContainer: "transparent",
									colorBorderSecondary: "rgba(255, 255, 255, 0.05)",
									colorPrimary: "#00FFA3",
									fontFamily: "inherit",
								},
								components: {
									Table: {
										headerBg: "rgba(255, 255, 255, 0.02)",
										headerColor: "rgba(255, 255, 255, 0.45)",
										headerBorderRadius: 0,
										colorText: "#d1d5db",
									},
								},
							}}
						>
							<Table
								columns={columns}
								dataSource={bills}
								rowKey="bill_id"
								loading={billsLoading}
								pagination={{
									pageSize: 10,
									showSizeChanger: false,
									hideOnSinglePage: true,
									className: "custom-pagination",
								}}
								className="custom-table"
								locale={{
									emptyText: (
										<div className="py-12 text-center text-gray-500 text-xs uppercase tracking-widest italic">
											No transaction records archived.
										</div>
									),
								}}
							/>
						</ConfigProvider>
					</div>
				</div>
			</div>
		</section>
	);
}
