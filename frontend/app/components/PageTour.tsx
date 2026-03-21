"use client";

import React, { useEffect, useState } from "react";
import { Tour, Button, Modal, App, Carousel } from "antd";
import type { TourProps } from "antd";
import {
	Download,
	ChevronLeft,
	ChevronRight,
	Copy,
	Check,
	Play,
} from "lucide-react";

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
	const [copyingURL, setCopyingURL] = useState(false);
	const { message } = App.useApp();

	const serverUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";

	const copyToClipboard = (text: string) => {
		navigator.clipboard.writeText(text).then(() => {
			setCopyingURL(true);
			message.success("Server URL copied to clipboard!");
			setTimeout(() => setCopyingURL(false), 2000);
		});
	};

	useEffect(() => {
		const hasSeenTour = localStorage.getItem("has_seen_tour");

		// Logic to detect new user:
		// 1. remaining_seconds is exactly 432000 (120 hours)
		// 2. bot_started_at is null
		// 3. no accounts added yet
		// 4. haven't shown the tour prompt in this session
		if (
			!hasSeenTour &&
			user?.remaining_seconds === 432000 &&
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

		const handleTokenGenerated = () => {
			if (openRef.current) {
				setCurrent(3); // Jump to "Connect" step after generating token
			}
		};

		const handleConnectClicked = () => {
			if (openRef.current) {
				setCurrent(4); // Jump to "Open Data Folder" step (page 5)
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
		window.addEventListener("MT5_TOKEN_GENERATED", handleTokenGenerated);
		window.addEventListener("MT5_CONNECT_CLICKED", handleConnectClicked);
		window.addEventListener("BOT_DEPLOYED", handleBotDeployed);
		window.addEventListener("BOT_STATUS_UPDATED", handleBotActivated);

		return () => {
			window.removeEventListener("START_PAGE_TOUR", handleManualStart);
			window.removeEventListener("CONNECT_MT5_OPENED", handleModalOpened);
			window.removeEventListener("MT5_ACCOUNTS_UPDATED", handleAccountAdded);
			window.removeEventListener("MT5_TOKEN_GENERATED", handleTokenGenerated);
			window.removeEventListener("MT5_CONNECT_CLICKED", handleConnectClicked);
			window.removeEventListener("BOT_DEPLOYED", handleBotDeployed);
			window.removeEventListener("BOT_STATUS_UPDATED", handleBotActivated);
		};
	}, []);

	const steps: TourProps["steps"] = [
		{
			title: (
				<div className="text-2xl font-bold mb-1">Welcome to AutoTrader!</div>
			),
			description: (
				<div className="text-lg text-gray-400 leading-relaxed">
					We'll guide you step-by-step through linking your MetaTrader 5
					terminal and starting your very first automated trading bot.
				</div>
			),
			target: null,
		},
		{
			title: <div className="text-2xl font-bold mb-1">Open MetaTrader 5</div>,
			description: (
				<div className="text-lg text-gray-400 leading-relaxed">
					<p className="mb-4">
						Open MetaTrader 5 and right click on 'Accounts' to <b>create</b> a
						new MT5 account if you don't have one.
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
			cover: (
				<img
					src="/images/tour/createAcc.png"
					alt="Create Account"
					className="w-full aspect-video object-cover rounded shadow-xl border border-white/10"
				/>
			),
			target: null,
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
					Enter any display name and your MT5 Login ID. <br /> This identifies
					your terminal to our system. <br /> Then click <b>"Generate Token"</b>
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
					Download the <b>'Expert Advisor (EA)'</b> file and <br />
					click <b>'Connect to this MT5 account'</b> to link <br />
					your terminal.
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
				<div className="text-base text-gray-400 leading-relaxed mb-4">
					In your MetaTrader 5 terminal, navigate to the top menu bar, click on{" "}
					<b>'File &gt; Open Data Folder'</b> from the dropdown list.
					<br />
					<b>IMPORTANT:</b> Algo Trading must always be enabled{" [ "}
					<Play className="inline-block w-4 h-4 text-[#00FFA3] fill-[#00FFA3] mb-1" />{" "}
					{" ]."}
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
					Inside the Folder, locate and open the <b>'MQL5'</b> folder.
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
					Within the MQL5 folder, find and open the <b>'Experts'</b> folder.
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
					earlier into this Experts folder.
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
					In your MT5 terminal, expand 'Expert Advisors' and hit right-click,
					then select <b>'Refresh'</b>. The connector should now appear.
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
			title: (
				<div className="text-2xl font-bold mb-1">Expert Advisor Common Tab</div>
			),
			description: (
				<div className="text-lg text-gray-400 leading-relaxed mb-4">
					<b>Double-click</b> the 'MT5_Connector' inside the Experts Advisors. A
					configuration window will pop up. In the <b>'Common'</b> tab, ensure
					that the <b>'Allow Algo Trading'</b> checkbox is checked. Then click
					<b> 'Inputs'</b> tab.
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
			title: (
				<div className="text-2xl font-bold mb-1">Expert Advisor Inputs Tab</div>
			),
			description: (
				<div className="text-lg text-gray-400 leading-relaxed mb-4">
					<p className="mb-4">
						Switch over to the <b>'Inputs'</b> tab. Here, you must paste your
						generated <b>Token</b> and <b>Backend API URL</b>. <br /> Click{" "}
						<b>'OK' </b>when done.
					</p>
					<div className="flex items-center gap-2 mt-2">
						<span className="text-gray-500 text-sm font-medium shrink-0">
							Backend API URL:
						</span>
						<code
							className="text-[#00FFA3] font-mono text-sm bg-[#00FFA3]/10 px-2 py-0.5 rounded border border-[#00FFA3]/20 truncate flex-1"
							title={serverUrl}
						>
							{serverUrl}
						</code>
						<Button
							type="text"
							className="text-gray-400 hover:text-[#00FFA3] p-1 h-auto shrink-0"
							onClick={() => copyToClipboard(serverUrl)}
						>
							{copyingURL ? (
								<Check className="w-4 h-4" />
							) : (
								<Copy className="w-4 h-4" />
							)}
						</Button>
					</div>
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
			title: <div className="text-2xl font-bold mb-1">Allow WebRequest</div>,
			description: (
				<div className="text-lg text-gray-400 leading-relaxed mb-4">
					<p className="mb-4">
						For the connection to work, MT5 needs permission to communicate
						outward. Go to <b>Tools &gt; Options &gt; 'Expert Advisors'</b>
						tab, check <b>'Allow WebRequest for listed URL'</b>, and add our
						Server URL.
					</p>

					<div className="flex items-center gap-2 mt-2">
						<span className="text-gray-500 text-sm font-medium shrink-0">
							Server URL:
						</span>
						<code
							className="text-[#00FFA3] font-mono text-sm bg-[#00FFA3]/10 px-2 py-0.5 rounded border border-[#00FFA3]/20 truncate flex-1"
							title={serverUrl}
						>
							{serverUrl}
						</code>
						<Button
							type="text"
							className="text-gray-400 hover:text-[#00FFA3] p-1 h-auto shrink-0"
							onClick={() => copyToClipboard(serverUrl)}
						>
							{copyingURL ? (
								<Check className="w-4 h-4" />
							) : (
								<Copy className="w-4 h-4" />
							)}
						</Button>
					</div>
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
					the Toolbox window). You should see a <b>'Connected Successfully' </b>
					message. If not, try closing and reopening the app.
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
					pair and choose the Bot's version you want to run.
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
					Keep an eye on your System Fuel tickets here. Bots consume fuel while
					active. If your tickets run to zero, all bots will automatically
					pause.
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

	const isLargeStep = current === 1 || (current >= 4 && current <= 12);

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
