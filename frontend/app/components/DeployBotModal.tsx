"use client";

import React, { useState, useEffect } from "react";
import { X, Info, ChevronDown } from "lucide-react";
import { message } from "antd"; // Ant Design for notifications

interface DeployBotModalProps {
	isOpen: boolean;
	onClose: () => void;
	onDeploy?: (data: DeploymentData) => void; // Optional callback for parent
}

export interface DeploymentData {
	pair: string;
	version: string;
}

export default function DeployBotModal({
	isOpen,
	onClose,
	onDeploy,
}: DeployBotModalProps) {
	// State Management
	const [isLoading, setIsLoading] = useState(false);
	const [formData, setFormData] = useState<DeploymentData>({
		pair: "EURUSD",
		version: "v2.4",
	});

	// Reset state when modal opens
	useEffect(() => {
		if (isOpen) {
			setFormData({ pair: "EURUSD", version: "v2.4" });
			setIsLoading(false);
		}
	}, [isOpen]);

	// Handle Select Changes
	const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	// Submit Handler
	const handleConfirm = async () => {
		setIsLoading(true);

		try {
			// 1. Simulate API Call to Go Fiber Backend
			// const res = await fetch('/api/v1/bots/deploy', { method: 'POST', body: JSON.stringify(formData) ... })

			await new Promise((resolve) => setTimeout(resolve, 1500)); // Fake delay

			// 2. Success Feedback (Ant Design)
			message.success({
				content: `Unit Deployed: ${formData.pair} [${formData.version}]`,
				style: { marginTop: "20vh" }, // Position adjustment
			});

			// 3. Trigger Parent Action
			if (onDeploy) onDeploy(formData);

			onClose();
		} catch (error) {
			message.error("Deployment Failed: Server connection refused");
		} finally {
			setIsLoading(false);
		}
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-210 flex items-center justify-center p-4 animate-in fade-in duration-200">
			<div className="glass-card w-full max-w-100 p-8 border-cyan-500/20 shadow-[0_0_50px_rgba(6,182,212,0.1)] relative rounded-2xl bg-black/40 border">
				{/* Header */}
				<div className="flex justify-between items-center mb-8">
					<h2 className="text-2xl font-black italic tracking-tighter uppercase text-white">
						Deploy <span className="text-cyan-400">AI Unit</span>
					</h2>
					<button
						onClick={onClose}
						className="text-gray-500 hover:text-white transition"
					>
						<X className="w-5 h-5" />
					</button>
				</div>

				{/* Form Content */}
				<div className="space-y-5">
					{/* Currency Pair Select */}
					<div>
						<label className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-1 block">
							Currency Pair
						</label>
						<div className="relative">
							<select
								name="pair"
								value={formData.pair}
								onChange={handleChange}
								className="w-full bg-black/40 border border-white/10 focus:border-cyan-400 rounded-xl py-3 px-4 text-sm outline-none transition appearance-none text-white cursor-pointer"
							>
								<option value="EURUSD">EUR / USD (Euro / US Dollar)</option>
								<option value="USDJPY">
									USD / JPY (US Dollar / Japanese Yen)
								</option>
								<option value="GBPUSD">
									GBP / USD (British Pound / US Dollar)
								</option>
								<option value="XAUUSD">XAU / USD (Gold / US Dollar)</option>
							</select>
							{/* Custom Chevron for appearance-none */}
							<div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
								<ChevronDown className="w-4 h-4" />
							</div>
						</div>
					</div>

					{/* Bot Version Select */}
					<div>
						<label className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mb-1 block">
							Bot Version (Logic Core)
						</label>
						<div className="relative">
							<select
								name="version"
								value={formData.version}
								onChange={handleChange}
								className="w-full bg-black/40 border border-white/10 focus:border-cyan-400 rounded-xl py-3 px-4 text-sm outline-none transition appearance-none text-white cursor-pointer"
							>
								<option value="v2.4">Aura Core v2.4 (Balanced)</option>
								<option value="v2.5-beta">Aura Prime v2.5 (Aggressive)</option>
								<option value="v1.9">Aura Legacy v1.9 (Conservative)</option>
							</select>
							<div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
								<ChevronDown className="w-4 h-4" />
							</div>
						</div>
					</div>

					{/* Info Banner */}
					<div className="bg-cyan-400/5 p-4 rounded-xl border border-cyan-400/20 flex items-center gap-3">
						<Info className="w-4 h-4 text-cyan-400 shrink-0" />
						<p className="text-[10px] text-cyan-400">
							This deployment will consume tickets at <strong>1x rate</strong>.
						</p>
					</div>
				</div>

				{/* Action Button */}
				<button
					onClick={handleConfirm}
					disabled={isLoading}
					className="w-full bg-cyan-400 text-black font-black py-4 rounded-xl mt-8 shadow-[0_10px_20px_rgba(6,182,212,0.2)] hover:scale-[1.02] hover:shadow-[0_10px_30px_rgba(6,182,212,0.4)] transition active:scale-95 uppercase tracking-tighter disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
				>
					{isLoading ? (
						<span className="flex items-center gap-2">
							<span className="w-2 h-2 bg-black rounded-full animate-bounce"></span>
							<span className="w-2 h-2 bg-black rounded-full animate-bounce [animation-delay:0.1s]"></span>
							<span className="w-2 h-2 bg-black rounded-full animate-bounce [animation-delay:0.2s]"></span>
						</span>
					) : (
						"Execute Deployment"
					)}
				</button>
			</div>
		</div>
	);
}
