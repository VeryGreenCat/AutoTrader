import { useState, useEffect } from "react";
import { Table, ConfigProvider, theme } from "antd";
import { getBillById } from "@/services/billing";
import { Billing } from "@/types/billing";

const TransHist = () => {
	const [bills, setBills] = useState<Billing[]>([]);
	const [billsLoading, setBillsLoading] = useState(true);

	useEffect(() => {
		const userId = localStorage.getItem("user_id");
		if (!userId) return;

		const fetchBills = async (userId: string) => {
			try {
				const res = await getBillById(userId);
				const sortedBills = (res.data || []).sort(
					(a: Billing, b: Billing) =>
						new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
				);
				setBills(sortedBills);
				console.log("bills", res.data);
			} catch (error) {
				console.error("Failed to fetch bills:", error);
			} finally {
				setBillsLoading(false);
			}
		};

		fetchBills(userId);
	}, []);

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
			render: (date: string | null) => (
				<span className="text-sm text-gray-400">
					{date
						? new Date(date).toLocaleDateString("en-US", {
								month: "short",
								day: "numeric",
								year: "numeric",
							})
						: "- Buy Tickets -"}
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
	);
};

export default TransHist;
