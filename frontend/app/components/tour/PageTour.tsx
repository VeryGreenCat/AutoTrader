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
				setOpen(false); // Close tour on final activation
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
			title: "Welcome",
			description:
				"We'll guide you through linking MT5 and starting your first bot.",
			target: null,
		},
		{
			title: "Link MT5",
			description: (
				<div>
					<p className="mb-2">
						Click <b>Next</b> below to open the MT5 connection terminal.
					</p>
					<p className="text-[11px] text-gray-500">
						No MT5 yet?{" "}
						<a
							href="https://www.metatrader5.com/en/download"
							target="_blank"
							rel="noreferrer"
							className="text-[#00FFA3] underline"
						>
							Download it here
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
			title: "Account Info",
			description: "Enter your account name and MT5 Login ID.",
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
			title: "Connect",
			description: "Gen Token, download EA, then click Connect.",
			target: () => document.getElementById("generate-token-btn")!,
			placement: "right",
			mask: false,
		},
		{
			title: "Open Data Folder",
			description: "In MT5, go to File > Open Data Folder.",
			cover: (
				<img
					src="/images/tour/pic1.png"
					alt="S1"
					className="w-full aspect-video object-cover rounded shadow-lg border border-white/5"
				/>
			),
			target: null,
		},
		{
			title: "MQL5 Folder",
			description: "Inside the data folder, open the 'MQL5' folder.",
			cover: (
				<img
					src="/images/tour/pic2.png"
					alt="S2"
					className="w-full aspect-video object-cover rounded shadow-lg border border-white/5"
				/>
			),
			target: null,
		},
		{
			title: "Experts Folder",
			description: "Open the 'Experts' folder.",
			cover: (
				<img
					src="/images/tour/pic3.png"
					alt="S3"
					className="w-full aspect-video object-cover rounded shadow-lg border border-white/5"
				/>
			),
			target: null,
		},
		{
			title: "Paste Connector",
			description:
				"Paste the 'MT5_Connector.ex5' file into the Experts folder.",
			cover: (
				<img
					src="/images/tour/pic4.png"
					alt="S4"
					className="w-full aspect-video object-cover rounded shadow-lg border border-white/5"
				/>
			),
			target: null,
		},
		{
			title: "Refresh Experts",
			description: "Right-click 'Experts' in MT5 Navigator and select Refresh.",
			cover: (
				<img
					src="/images/tour/pic5.png"
					alt="S5"
					className="w-full aspect-video object-cover rounded shadow-lg border border-white/5"
				/>
			),
			target: null,
		},
		{
			title: "EA Common Tab",
			description:
				"Double-click EA. In 'Common' tab, enable 'Allow Algo Trading'.",
			cover: (
				<img
					src="/images/tour/ea_config_left.png"
					alt="C1"
					className="w-full aspect-video object-cover rounded border border-white/5"
				/>
			),
			target: null,
		},
		{
			title: "EA Inputs Tab",
			description: "In 'Inputs' tab, enter your Token and Server URL.",
			cover: (
				<img
					src="/images/tour/ea_config_right.png"
					alt="C2"
					className="w-full aspect-video object-cover rounded border border-white/5"
				/>
			),
			target: null,
		},
		{
			title: "WebRequest",
			description: "Tools > Options > EA. Allow WebRequest for our Server URL.",
			cover: (
				<img
					src="/images/tour/webrequest_setup.png"
					alt="WR"
					className="w-full aspect-video object-cover rounded border border-white/5"
				/>
			),
			target: null,
		},
		{
			title: "Success",
			description:
				"Check Experts tab. It should show 'Connected Successfully'.",
			cover: (
				<img
					src="/images/tour/connection_success.png"
					alt="OK"
					className="w-full aspect-video object-cover rounded border border-white/5"
				/>
			),
			target: null,
		},
		{
			title: "Deploy Bot",
			description: "Click Deploy. Select your pair and bot version.",
			target: () => document.getElementById("deploy-bot-btn")!,
			mask: false,
		},
		{
			title: "Activation",
			description: "Toggle switch to start. Bot stops if ticket is 0.",
			target: () => document.getElementById("bot-activation-switch")!,
			placement: "left",
		},
	];

	useEffect(() => {
		const card = document.getElementById("add-account-card");
		if (open && current === 1) {
			if (card) card.style.pointerEvents = "none";
		} else {
			if (card) card.style.pointerEvents = "auto";
		}
	}, [open, current]);

	return (
		<Tour
			open={open}
			onClose={() => setOpen(false)}
			current={current}
			onChange={setCurrent}
			steps={steps}
			// @ts-ignore
			width={600}
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
