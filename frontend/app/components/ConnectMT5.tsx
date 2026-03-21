"use client";

import { Modal, App } from "antd";
import { useState } from "react";
import { Copy, Check, Download, X } from "lucide-react";
import { addAccount } from "@/services/mt5";

interface ConnectMT5Props {
	open: boolean;
	setOpen: (open: boolean) => void;
	onSuccess?: () => void;
}

export default function ConnectMT5({
	open,
	setOpen,
	onSuccess,
}: ConnectMT5Props) {
	const { message } = App.useApp();
	const [name, setName] = useState("");
	const [mt5Id, setMt5Id] = useState("");
	const [token, setToken] = useState("");
	const [loading, setLoading] = useState(false);

	const generateToken = () => {
		if (!name || !mt5Id) return;

		setLoading(true);

		const generated =
			"AUR-" +
			Math.random().toString(36).substring(2, 8).toUpperCase() +
			"-" +
			Math.random().toString(36).substring(2, 6).toUpperCase();

		setToken(generated);
		setLoading(false);
		window.dispatchEvent(new CustomEvent("MT5_TOKEN_GENERATED"));
	};

	const [copied, setCopied] = useState(false);

	const handleCopy = () => {
		navigator.clipboard.writeText(token);
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	const handleConnect = async () => {
		window.dispatchEvent(new CustomEvent("MT5_CONNECT_CLICKED"));
		try {
			setLoading(true);

			const userId = localStorage.getItem("user_id");
			if (!userId) {
				message.error("User ID not found");
				return;
			}

			if (!name || !mt5Id || !token) {
				message.error("Please fill in all fields");
				return;
			}

			// API Call: Get User Accounts
			const userRes = await addAccount({
				name: name,
				mt5_id: mt5Id,
				user_id: userId,
				token: token,
			});

			console.log("ConnectMT5 | userRes:", userRes.message);
			message.success("Account added successfully");

			// Notify other components (like Navbar) to refresh accounts data
			window.dispatchEvent(new CustomEvent("MT5_ACCOUNTS_UPDATED"));

			if (onSuccess) onSuccess();
		} catch (error) {
			console.error("Failed to fetch accounts data", error);
		} finally {
			setLoading(false);
		}
		handleCancel();
	};

	const handleCancel = () => {
		setOpen(false);
	};

	const canGenerate = name.trim() !== "" && mt5Id.trim() !== "";

	return (
		<Modal
			open={open}
			onCancel={handleCancel}
			footer={null}
			centered
			closeIcon={null}
			mask={{ closable: false }}
		>
			<div className="flex items-center justify-center p-4">
				<div
					id="connect-mt5-modal-content"
					className="w-full max-w-md p-8 rounded-2xl 
                   bg-[#0f0f0f] 
                   border border-[#00FFA3]/20
                   shadow-[0_0_40px_rgba(0,255,163,0.12)]
                   relative"
				>
					{/* Custom Close Icon */}
					<button
						onClick={handleCancel}
						className="absolute top-4 right-4 text-gray-600 hover:text-white transition-colors cursor-pointer p-1 group"
					>
						<X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
					</button>
					<div className="absolute -top-24 -left-24 w-48 h-48 bg-[#00FFA3]/10 rounded-full blur-3xl"></div>

					{/* Header */}
					<div className="text-center mb-8">
						<h2 className="text-2xl font-black italic tracking-tighter uppercase text-white">
							ADD <span className="text-[#00FFA3]">MT5 ACCOUNT</span>
						</h2>
						<p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mt-2">
							Add your MT5 account to connect
						</p>
					</div>

					{/* Form */}
					<div className="space-y-4">
						{/* Account Name */}
						<div>
							<label className="text-[9px] text-gray-500 uppercase font-bold tracking-widest ml-1 mb-1 block">
								Account Name
							</label>
							<input
								id="account-name-input"
								type="text"
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder="My Account Name"
								className="w-full bg-black/40 border border-white/10 focus:border-[#00FFA3] rounded-xl py-3 px-4 text-sm text-white placeholder-gray-600 outline-none transition focus:shadow-[0_0_20px_rgba(0,255,163,0.1)]"
							/>
						</div>

						{/* MT5 ID */}
						<div>
							<label className="text-[9px] text-gray-500 uppercase font-bold tracking-widest ml-1 mb-1 block">
								MT5 Login ID
							</label>
							<input
								id="mt5-id-input"
								type="text"
								value={mt5Id}
								onChange={(e) => setMt5Id(e.target.value)}
								placeholder="8821932"
								className="w-full bg-black/40 border border-white/10 focus:border-[#00FFA3] rounded-xl py-3 px-4 text-sm text-white placeholder-gray-600 outline-none transition focus:shadow-[0_0_20px_rgba(0,255,163,0.1)]"
							/>
						</div>

						{/* Generate Token Button */}
						{!token && (
							<button
								id="generate-token-btn"
								onClick={generateToken}
								disabled={!canGenerate || loading}
								className="w-full bg-[#00FFA3] text-black font-black py-3 rounded-xl mt-2 shadow-[0_10px_20px_rgba(0,255,163,0.2)] hover:scale-[1.02] transition active:scale-95 uppercase tracking-tighter disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
							>
								{loading ? "Generating..." : "Generate Token"}
							</button>
						)}

						{/* Token Display */}
						{token && (
							<div className="mt-4">
								<label className="text-[9px] text-gray-500 uppercase font-bold tracking-widest ml-1 mb-1 block">
									System Access Token
								</label>
								<div className="relative">
									<input
										type="text"
										value={token}
										readOnly
										className="w-full bg-black/40 border border-[#00FFA3]/40 rounded-xl py-3 px-4 text-sm text-[#00FFA3] outline-none"
									/>
									{copied ? (
										<Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#00FFA3]" />
									) : (
										<Copy
											onClick={handleCopy}
											className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#00FFA3] cursor-pointer hover:scale-110 transition"
										/>
									)}
								</div>
								<p className="text-[10px] text-gray-500 mt-1">
									Copy this token into your MT5 Expert Advisor to connect.
								</p>
							</div>
						)}

						{/* Action Buttons Pack */}
						{token && (
							<div className="flex flex-col gap-3 mt-8">
								<a
									id="download-ea-link"
									href="/MT5_Connector.ex5"
									download="MT5_Connector.ex5"
									className="group flex items-center justify-center gap-3 w-full 
                      bg-[#00FFA3]/[0.03] border border-[#00FFA3]/20 
                      shadow-[0_0_20px_rgba(0,255,163,0.1)]
                      py-4 rounded-xl 
                      hover:bg-[#00FFA3]/[0.08] hover:border-[#00FFA3]/40
                      hover:shadow-[0_0_25px_rgba(0,255,163,0.2)]
                      transition-all duration-300 active:scale-[0.98] 
                      cursor-pointer"
								>
									<Download className="w-5 h-5 text-[#00FFA3] group-hover:scale-110 transition-transform" />
									<span className="text-[#00FFA3] text-[11px] uppercase tracking-[0.2em] font-black">
										Download Expert Advisor (EA)
									</span>
								</a>

								<button
									id="connect-account-btn"
									onClick={handleConnect}
									className="w-full bg-[#00FFA3] text-black font-black py-4 rounded-xl shadow-[0_10px_20px_rgba(0,255,163,0.2)] hover:scale-[1.02] hover:shadow-[0_10px_30px_rgba(0,255,163,0.4)] transition active:scale-95 uppercase tracking-tighter cursor-pointer text-sm"
								>
									Connect to this MT5 Account
								</button>
							</div>
						)}
					</div>
				</div>
			</div>
		</Modal>
	);
}
