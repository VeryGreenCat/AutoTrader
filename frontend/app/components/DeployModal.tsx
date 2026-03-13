"use client";

import { useState, useEffect, useMemo } from "react";
import { Modal, Select, App } from "antd";
import { X, Info } from "lucide-react";
import { DeployModalProps } from "@/types/bot";
import { Model } from "@/types/model";
import { deployBot } from "@/services/bots";
import { getAvailableModels } from "@/services/model";

export default function DeployModal(deployData: DeployModalProps) {
	const {
		open,
		onClose,
		mt5Id,
		onSuccess,
		deployedCurrencies = [],
	} = deployData;
	const { message } = App.useApp();
	const [loading, setLoading] = useState(false);
	const [selectedPair, setSelectedPair] = useState<string | null>(null);
	const [selectedBot, setSelectedBot] = useState<string | null>(null);
	const [botOptions, setBotOptions] = useState<
		{ label: string; value: string }[]
	>([]);
	const [models, setModels] = useState<Model[]>([]);

	const currencyOptions = useMemo(() => {
		const uniqueCurrencies = Array.from(new Set(models.map((m) => m.currency)));
		return uniqueCurrencies.map((c) => {
			const isDeployed = deployedCurrencies.includes(c);
			return {
				label: isDeployed
					? `${c.length === 6 ? `${c.slice(0, 3)}/${c.slice(3)}` : c} — Already Deployed`
					: c.length === 6
						? `${c.slice(0, 3)}/${c.slice(3)}`
						: c,
				value: c,
				disabled: isDeployed,
			};
		});
	}, [models, deployedCurrencies]);

	useEffect(() => {
		const fetchModels = async () => {
			try {
				const userRes = await getAvailableModels();
				setModels(userRes.data);
			} catch (error) {
				console.error("Failed to fetch models:", error);
			}
		};
		fetchModels();
	}, []);

	// Reset state when opened/closed
	useEffect(() => {
		if (!open) {
			setSelectedPair(null);
			setSelectedBot(null);
			setBotOptions([]);
		}
	}, [open]);

	// Load bots when pair is selected
	useEffect(() => {
		if (selectedPair) {
			setSelectedBot(null);
			const options = models
				.filter((m) => m.currency === selectedPair)
				.map((m) => ({
					label: `${m.name} (${m.version})`,
					value: m.model_id,
				}));
			setBotOptions(options);
		}
	}, [selectedPair, models]);

	const handleExecute = async () => {
		if (!selectedBot) return;
		setLoading(true);

		console.log("DeployModal | mt5Id:", mt5Id);
		console.log("DeployModal | selectedBot:", selectedBot);
		try {
			await deployBot(mt5Id, selectedBot);
			message.success("Deployment successful");
			window.dispatchEvent(new CustomEvent("BOT_DEPLOYED"));
			if (onSuccess) onSuccess();
			onClose();
		} catch (error: any) {
			console.error("Deployment failed:", error);
			const errorMsg = error.response?.data?.message || "Deployment failed";
			message.error(errorMsg);
		} finally {
			setLoading(false);
		}
	};

	// AntD Dark Theme Configs for Select Dropdowns
	const selectDropdownStyle = {
		backgroundColor: "#1a1a1a",
		border: "1px solid #333",
		color: "white",
	};

	return (
		<Modal
			open={open}
			onCancel={onClose}
			footer={null}
			centered
			closable={false} // Custom close button below
			className="custom-dark-modal"
		>
			<div className="flex items-center justify-center">
				<div className="w-full max-w-md p-8 rounded-2xl bg-[#0f0f0f] border border-[#00FFA3]/20 shadow-[0_0_40px_rgba(0,255,163,0.12)] relative overflow-hidden">
					{/* Background Glow */}
					<div className="absolute -top-24 -left-24 w-48 h-48 bg-[#00FFA3]/10 rounded-full blur-3xl pointer-events-none"></div>

					{/* Header */}
					<div className="flex justify-between items-center mb-8 relative z-10">
						<h1 className="text-2xl font-bold tracking-tighter uppercase italic text-white">
							Deploy <span className="text-[#00FFA3]">AI Unit</span>
						</h1>
						<button
							onClick={onClose}
							className="text-gray-500 hover:text-white transition-colors cursor-pointer"
						>
							<X className="w-6 h-6" />
						</button>
					</div>

					<div className="space-y-6 relative z-10">
						{/* Currency Pair Select */}
						<div>
							<label className="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">
								Currency Pair
							</label>
							<Select
								className="w-full h-12"
								placeholder="Select currency pair"
								value={selectedPair}
								onChange={(val) => setSelectedPair(val)}
								options={currencyOptions}
								classNames={{ popup: { root: "dark-select-dropdown" } }}
								styles={{ popup: { root: selectDropdownStyle } }}
							/>
						</div>

						{/* Bot Version Select */}
						<div>
							<label className="block text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">
								Bot Version
							</label>
							<Select
								className="w-full h-12"
								placeholder={
									selectedPair
										? "Select bot version"
										: "Select a currency pair first"
								}
								value={selectedBot}
								onChange={(val) => setSelectedBot(val)}
								options={botOptions}
								disabled={!selectedPair}
								classNames={{ popup: { root: "dark-select-dropdown" } }}
								styles={{ popup: { root: selectDropdownStyle } }}
							/>
						</div>

						{/* Info Box */}
						<div className="bg-[#00FFA3]/5 border border-[#00FFA3]/20 rounded-xl p-4 flex items-start gap-3">
							<Info className="w-5 h-5 text-[#00FFA3] shrink-0 mt-0.5" />
							<p className="text-[#00FFA3] text-sm">
								This deployment will consume tickets at 1x rate.
							</p>
						</div>

						{/* Execute Button */}
						<button
							onClick={handleExecute}
							disabled={loading || !selectedPair || !selectedBot}
							className={`w-full font-black py-4 rounded-xl mt-4 flex items-center justify-center gap-2 transition-all uppercase tracking-wider
              ${
								loading || !selectedPair || !selectedBot
									? "bg-white/5 text-gray-500 cursor-not-allowed border border-white/5"
									: "bg-[#00FFA3] text-black shadow-[0_0_20px_rgba(0,255,163,0.3)] hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(0,255,163,0.4)] cursor-pointer"
							}`}
						>
							{loading ? "Deploying..." : "Execute Deployment"}
						</button>
					</div>
				</div>
			</div>
		</Modal>
	);
}
