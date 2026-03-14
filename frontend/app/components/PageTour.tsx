"use client";

import React, { useEffect, useState } from "react";
import { Tour, Button, Modal, App, Carousel } from "antd";
import type { TourProps } from "antd";
import { Download, ChevronLeft, ChevronRight } from "lucide-react";

interface PageTourProps {
	user: {
		remaining_seconds: number;
		bot_started_at: string | null;
	} | null;
	accountsCount: number;
}

const PageTour: React.FC<PageTourProps> = ({ user, accountsCount }) => {
	const [open, setOpen] = useState<boolean>(false);
	const [current, setCurrent] = useState<number>(0);
	const { message } = App.useApp();

	useEffect(() => {
		const hasSeenTour = localStorage.getItem("has_seen_tour");

		// Logic to detect new user:
		// 1. remaining_seconds is exactly 43200 (12 hours)
		// 2. bot_started_at is null
		// 3. no accounts added yet
		// 4. haven't shown the tour prompt in this session
		if (
			!hasSeenTour &&
			user?.remaining_seconds === 43200 &&
			!user?.bot_started_at &&
			accountsCount === 0
		) {
			Modal.confirm({
				title: "Welcome to AutoTrader!",
				content:
					"Would you like a professional guided tour to help you set up your first MT5 connection and start your trading bot?",
				okText: "Start Tutorial",
				cancelText: "Maybe Later",
				onOk: () => {
					setOpen(true);
					localStorage.setItem("has_seen_tour", "true");
				},
				onCancel: () => {
					localStorage.setItem("has_seen_tour", "true");
				},
				centered: true,
			});
		}
	}, [user, accountsCount]);

	// Use refs to avoid stale closures in event listeners
	const openRef = React.useRef(open);
	const currentRef = React.useRef(current);

	useEffect(() => {
		openRef.current = open;
	}, [open]);

	useEffect(() => {
		currentRef.current = current;
	}, [current]);

	useEffect(() => {
		const handleManualStart = () => {
			setCurrent(0);
			setOpen(true);
		};

		const handleModalOpened = () => {
			if (openRef.current) {
				// Small delay to allow Modal to mount its elements
				setTimeout(() => {
					setCurrent(2); // Jump to "Account Info" inside the modal
				}, 100);
			}
		};

		const handleAccountAdded = () => {
			if (openRef.current) {
				setCurrent(4); // Jump to first MT5 Setup step
			}
		};

		const handleBotDeployed = () => {
			if (openRef.current) {
				setCurrent(13); // Jump to "Activation" step (was index 12)
			}
		};

		const handleBotActivated = () => {
			if (openRef.current) {
				setCurrent(15); // Progress to final System Fuel step
			}
		};

		window.addEventListener("START_PAGE_TOUR", handleManualStart);
		window.addEventListener("CONNECT_MT5_OPENED", handleModalOpened);
		window.addEventListener("MT5_ACCOUNTS_UPDATED", handleAccountAdded);
		window.addEventListener("BOT_DEPLOYED", handleBotDeployed);
		window.addEventListener("BOT_STATUS_UPDATED", handleBotActivated);

		return () => {
			window.removeEventListener("START_PAGE_TOUR", handleManualStart);
			window.removeEventListener("CONNECT_MT5_OPENED", handleModalOpened);
			window.removeEventListener("MT5_ACCOUNTS_UPDATED", handleAccountAdded);
			window.removeEventListener("BOT_DEPLOYED", handleBotDeployed);
			window.removeEventListener("BOT_STATUS_UPDATED", handleBotActivated);
		};
	}, []);

	const steps: TourProps["steps"] = [
		{
			title: <div className="text-2xl font-bold mb-1">Welcome</div>,
			description: (
				<div className="text-lg text-gray-400 leading-relaxed">
					We'll guide you step-by-step through linking your MetaTrader 5
					terminal and starting your very first automated trading bot.
				</div>
			),
			target: null,
		},
		{
			title: <div className="text-2xl font-bold mb-1">Link MT5</div>,
			description: (
				<div className="text-lg text-gray-400 leading-relaxed">
					<p className="mb-4">
						To begin, click <b>Next</b> below to open the MT5 connection
						terminal window.
					</p>
					<p className="text-sm text-gray-500">
						Don't have MT5 installed yet?{" "}
						<a
							href="https://www.metatrader5.com/en/download"
							target="_blank"
							rel="noreferrer"
							className="text-[#00FFA3] underline"
						>
							Download the official terminal here
						</a>
						.
					</p>
				</div>
			),
			target: () => document.getElementById("add-account-card")!,
			nextButtonProps: {
				onClick: () => {
					window.dispatchEvent(new CustomEvent("OPEN_CONNECT_MT5"));
				},
			},
		},
		{
			title: <div className="text-2xl font-bold mb-1">Account Info</div>,
			description: (
				<div className="text-lg text-gray-400 leading-relaxed">
					Enter any recognizable name for your account and your official MT5
					Login ID. This identifies your terminal to our system.
				</div>
			),
			target: () => document.getElementById("connect-mt5-modal-content")!,
			placement: "right",
			mask: false,
			prevButtonProps: {
				onClick: () => {
					window.dispatchEvent(new CustomEvent("CLOSE_CONNECT_MT5"));
					setCurrent(1);
				},
			},
		},
		{
			title: <div className="text-2xl font-bold mb-1">Connect</div>,
			description: (
				<div className="text-lg text-gray-400 leading-relaxed">
					Click 'Generate Token' to create your secure access key. After
					generating, download the EA file and click Connect to verify.
				</div>
			),
			target: () => document.getElementById("connect-mt5-modal-content")!,
			placement: "right",
			mask: false,
			nextButtonProps: {
				onClick: () => {
					window.dispatchEvent(new CustomEvent("CLOSE_CONNECT_MT5"));
				},
			},
		},
		{
			title: <div className="text-2xl font-bold mb-1">Open Data Folder</div>,
			description: (
				<div className="text-lg text-gray-400 leading-relaxed mb-4">
					In your MetaTrader 5 terminal, navigate to the top menu bar, click on{" "}
					<b>'File'</b>, and then select <b>'Open Data Folder'</b> from the
					dropdown list. This will open the core directory where all your MT5
					files are stored.
				</div>
			),
			cover: (
				<img
					src="/images/tour/pic1.png"
					alt="S1"
					className="w-full aspect-video object-cover rounded shadow-xl border border-white/10"
				/>
			),
			target: null,
			prevButtonProps: {
				onClick: () => {
					window.dispatchEvent(new CustomEvent("OPEN_CONNECT_MT5"));
					setCurrent(3); // Go back to Connect step (index 3)
				},
			},
		},
		{
			title: <div className="text-2xl font-bold mb-1">MQL5 Folder</div>,
			description: (
				<div className="text-lg text-gray-400 leading-relaxed mb-4">
					Inside the newly opened data folder window, locate and double-click to
					open exactly the <b>'MQL5'</b> folder. This directory contains all the
					custom indicators, scripts, and Expert Advisors for your terminal.
				</div>
			),
			cover: (
				<img
					src="/images/tour/pic2.png"
					alt="S2"
					className="w-full aspect-video object-cover rounded shadow-xl border border-white/10"
				/>
			),
			target: null,
		},
		{
			title: <div className="text-2xl font-bold mb-1">Experts Folder</div>,
			description: (
				<div className="text-lg text-gray-400 leading-relaxed mb-4">
					Within the MQL5 directory, find and open the <b>'Experts'</b> folder.
					This is the specific location where MetaTrader 5 looks for automated
					trading robots.
				</div>
			),
			cover: (
				<img
					src="/images/tour/pic3.png"
					alt="S3"
					className="w-full aspect-video object-cover rounded shadow-xl border border-white/10"
				/>
			),
			target: null,
		},
		{
			title: <div className="text-2xl font-bold mb-1">Paste Connector</div>,
			description: (
				<div className="text-lg text-gray-400 leading-relaxed mb-4">
					Now, paste the <b>'MT5_Connector.ex5'</b> file that you downloaded
					earlier directly into this Experts folder. This file is the secure
					bridge that allows our platform to communicate with your terminal.
				</div>
			),
			cover: (
				<img
					src="/images/tour/pic4.png"
					alt="S4"
					className="w-full aspect-video object-cover rounded shadow-xl border border-white/10"
				/>
			),
			target: null,
		},
		{
			title: <div className="text-2xl font-bold mb-1">Refresh Experts</div>,
			description: (
				<div className="text-lg text-gray-400 leading-relaxed mb-4">
					Go back to your MT5 terminal. In the 'Navigator' panel on the left
					(press Ctrl+N if hidden), expand 'Expert Advisors', right-click
					anywhere in that list, and select <b>'Refresh'</b>. The connector
					should now appear.
				</div>
			),
			cover: (
				<img
					src="/images/tour/pic5.png"
					alt="S5"
					className="w-full aspect-video object-cover rounded shadow-xl border border-white/10"
				/>
			),
			target: null,
		},
		{
			title: <div className="text-2xl font-bold mb-1">EA Common Tab</div>,
			description: (
				<div className="text-lg text-gray-400 leading-relaxed mb-4">
					Double-click the 'MT5_Connector' from the Navigator to attach it to a
					chart. A configuration window will pop up. In the 'Common' tab, ensure
					that the <b>'Allow Algo Trading'</b> checkbox is verified.
				</div>
			),
			cover: (
				<img
					src="/images/tour/ea_config_left.png"
					alt="C1"
					className="w-full aspect-video object-cover rounded shadow-xl border border-white/10"
				/>
			),
			target: null,
		},
		{
			title: <div className="text-2xl font-bold mb-1">EA Inputs Tab</div>,
			description: (
				<div className="text-lg text-gray-400 leading-relaxed mb-4">
					Switch over to the 'Inputs' tab in the same window. Here, you must
					paste your generated <b>Token</b> and verify that the{" "}
					<b>Server URL</b> matches exactly. Click 'OK' when done.
				</div>
			),
			cover: (
				<img
					src="/images/tour/ea_config_right.png"
					alt="C2"
					className="w-full aspect-video object-cover rounded shadow-xl border border-white/10"
				/>
			),
			target: null,
		},
		{
			title: <div className="text-2xl font-bold mb-1">WebRequest</div>,
			description: (
				<div className="text-lg text-gray-400 leading-relaxed mb-4">
					For the connection to work, MT5 needs permission to communicate
					outward. Go to Tools &gt; Options (or press Ctrl+O), navigate to the
					'Expert Advisors' tab, check <b>'Allow WebRequest for listed URL'</b>,
					and add our Server URL.
				</div>
			),
			cover: (
				<img
					src="/images/tour/webrequest_setup.png"
					alt="WR"
					className="w-full aspect-video object-cover rounded shadow-xl border border-white/10"
				/>
			),
			target: null,
		},
		{
			title: <div className="text-2xl font-bold mb-1">Success</div>,
			description: (
				<div className="text-lg text-gray-400 leading-relaxed mb-4">
					Look at the 'Experts' tab at the very bottom of your MT5 terminal (in
					the Toolbox window). If everything was set up correctly, you should
					see a <b>'Connected Successfully'</b> message. You are ready to close
					this guide!
				</div>
			),
			cover: (
				<img
					src="/images/tour/connection_success.png"
					alt="OK"
					className="w-full aspect-video object-cover rounded shadow-xl border border-white/10"
				/>
			),
			target: null,
		},
		{
			title: <div className="text-2xl font-bold mb-1">Deploy Bot</div>,
			description: (
				<div className="text-lg text-gray-400 leading-relaxed">
					You are now ready to trade! Click the <b>'Deploy New Bot'</b> button
					to create your first automated strategy. Select your preferred trading
					pair and choose the algorithm version you want to run.
				</div>
			),
			target: () => {
				const el = document.getElementById("deploy-bot-btn");
				if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
				return el!;
			},
		},
		{
			title: <div className="text-2xl font-bold mb-1">Activation</div>,
			description: (
				<div className="text-lg text-gray-400 leading-relaxed">
					Once deployed, your bot will appear in the list. Just toggle this
					activation switch to start live trading immediately!
				</div>
			),
			target: () => {
				const el = document.getElementById("bot-activation-switch");
				if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
				return el!;
			},
			placement: "left",
		},
		{
			title: <div className="text-2xl font-bold mb-1">System Fuel</div>,
			description: (
				<div className="text-lg text-gray-400 leading-relaxed">
					Keep an eye on your System Fuel tickets here. Bots consume fuel while active. If your tickets run to zero, all bots will automatically pause.
				</div>
			),
			target: () => document.getElementById("navbar-system-fuel")!,
			placement: "bottom",
		},
	];

	useEffect(() => {
		const card = document.getElementById("add-account-card");
		const deployBtn = document.getElementById("deploy-bot-btn");
		const activationSwitch = document.getElementById("bot-activation-switch");
		const systemFuel = document.getElementById("navbar-system-fuel");

		// Reset all to auto first
		if (card) card.style.pointerEvents = "auto";
		if (deployBtn) deployBtn.style.pointerEvents = "auto";
		if (activationSwitch) activationSwitch.style.pointerEvents = "auto";
		if (systemFuel) systemFuel.style.pointerEvents = "auto";

		// Only disable pointer events if the tour is open AND on specific steps
		if (open) {
			if (current === 1) {
				if (card) card.style.pointerEvents = "none";
			} else if (current === 13) {
				if (deployBtn) deployBtn.style.pointerEvents = "none";
			} else if (current === 14) {
				if (activationSwitch) activationSwitch.style.pointerEvents = "none";
			} else if (current === 15) {
				if (systemFuel) systemFuel.style.pointerEvents = "none";
			}
		}
	}, [open, current]);

	const isLargeStep = current >= 4 && current <= 12;

	return (
		<Tour
			open={open}
			onClose={() => setOpen(false)}
			current={current}
			onChange={setCurrent}
			steps={steps}
			// @ts-ignore
			width={isLargeStep ? "80vw" : 600}
			mask={{
				color: "rgba(0, 0, 0, 0.85)",
			}}
			styles={{
				section: {
					backgroundColor: "#252525",
					border: "1px solid rgba(255, 255, 255, 0.12)",
					borderRadius: "16px",
					padding: "16px",
				},
			}}
			indicatorsRender={(current, total) => (
				<div className="flex items-center gap-1.5 px-1 translate-y-[2px]">
					<span className="text-[12px] font-bold text-[#00FFA3]">
						{current + 1}
					</span>
					<span className="text-[10px] text-gray-600 font-bold">/</span>
					<span className="text-[11px] font-medium text-gray-500">{total}</span>
				</div>
			)}
		/>
	);
};

export default PageTour;
