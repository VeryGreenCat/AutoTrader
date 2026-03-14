"use client";

import React from "react";
import {
	Terminal,
	FolderOpen,
	FolderTree,
	FileCode,
	RefreshCcw,
	Settings,
	Globe,
	CheckCircle2,
	Rocket,
	Zap,
	Fuel,
	Info,
} from "lucide-react";

const steps = [
	{
		title: "1. Link Your MetaTrader 5 Account",
		icon: <Terminal className="w-6 h-6 text-[#00FFA3]" />,
		description:
			"The first step to automated trading is linking your MT5 terminal to our platform. Navigate to the 'Bot Manager' and click on the 'Add MT5 Account' card to open the connection terminal.",
	},
	{
		title: "2. Provide Account Details",
		icon: <Info className="w-6 h-6 text-[#00FFA3]" />,
		description:
			"Enter a recognizable name for your account (e.g., 'Main Trading' or 'Markets Live 1') and your official MT5 Login ID. This ID is essential for our platform to communicate with the correct terminal.",
	},
	{
		title: "3. Generate and Configure",
		icon: <Zap className="w-6 h-6 text-[#00FFA3]" />,
		description:
			"Click 'Generate Token' to create your unique access key. This key belongs only to you and should never be shared. Download the 'MT5_Connector.ex5' file which you'll need to install in your terminal.",
	},
	{
		title: "4. Installation: Open Data Folder",
		icon: <FolderOpen className="w-6 h-6 text-[#00FFA3]" />,
		description:
			"In your MetaTrader 5 terminal, go to File > Open Data Folder. This opens the hidden directory where MetaTrader stores all its user files and terminal data.",
		image: "/images/tour/pic1.png",
	},
	{
		title: "5. Navigate to MQL5",
		icon: <FolderTree className="w-6 h-6 text-[#00FFA3]" />,
		description:
			"Inside the data folder, double-click to open the 'MQL5' folder. This is the heart of MetaTrader where all custom programs are located.",
		image: "/images/tour/pic2.png",
	},
	{
		title: "6. Open the Experts Folder",
		icon: <FolderTree className="w-6 h-6 text-[#00FFA3]" />,
		description:
			"Within the MQL5 directory, find and open the 'Experts' folder. This specific folder is where Expert Advisors (trading robots) must be placed to be recognized by MT5.",
		image: "/images/tour/pic3.png",
	},
	{
		title: "7. Install the Connector",
		icon: <FileCode className="w-6 h-6 text-[#00FFA3]" />,
		description:
			"Paste the 'MT5_Connector.ex5' file you downloaded earlier into this Experts folder. This file acts as the secure bridge between MT5 and our AutoTrader cloud.",
		image: "/images/tour/pic4.png",
	},
	{
		title: "8. Refresh and Verify",
		icon: <RefreshCcw className="w-6 h-6 text-[#00FFA3]" />,
		description:
			"Return to MT5. In the 'Navigator' panel (left side), right-click 'Expert Advisors' and select 'Refresh'. The 'MT5_Connector' should now appear in the list.",
		image: "/images/tour/pic5.png",
	},
	{
		title: "9. EA Configuration: Common Tab",
		icon: <Settings className="w-6 h-6 text-[#00FFA3]" />,
		description:
			"Double-click 'MT5_Connector' to attach it to a chart. In the 'Common' tab, you MUST check 'Allow Algo Trading'. Without this, MT5 will block our server from placing trades.",
		image: "/images/tour/ea_config_left.png",
	},
	{
		title: "10. EA Configuration: Inputs",
		icon: <Settings className="w-6 h-6 text-[#00FFA3]" />,
		description:
			"Go to the 'Inputs' tab. Paste your unique Token into the field and ensure the Server URL is correctly set to our API address. Click OK to start the connector.",
		image: "/images/tour/ea_config_right.png",
	},
	{
		title: "11. Network Permissions",
		icon: <Globe className="w-6 h-6 text-[#00FFA3]" />,
		description:
			"Go to Tools > Options > Expert Advisors. Check 'Allow WebRequest for listed URL' and add our Server URL to the list. This allows MT5 to talk to our trade prediction server.",
		image: "/images/tour/webrequest_setup.png",
	},
	{
		title: "12. Connection Success",
		icon: <CheckCircle2 className="w-6 h-6 text-[#00FFA3]" />,
		description:
			"Check the 'Experts' tab in your terminal's bottom window. It should display 'Connected Successfully'. If it does, your terminal is now receiving real-time AI predictions!",
		image: "/images/tour/connection_success.png",
	},
	{
		title: "13. Deploy Your AI Bot",
		icon: <Rocket className="w-6 h-6 text-[#00FFA3]" />,
		description:
			"Back in our web dashboard, click 'Deploy New Bot' on your connected account. Choose your trading pair and select the AI model version you want to use.",
	},
	{
		title: "14. Activation and Fuel",
		icon: <Fuel className="w-6 h-6 text-[#00FFA3]" />,
		description:
			"Toggle the activation switch to 'Active' to start trading. Note: Bots consume 'System Fuel' tickets while running. Keep your fuel balance above zero to avoid interruptions.",
	},
];

export default function HowToUseDoc() {
	return (
		<div className="space-y-12 pb-10 pl-8 pr-4">
			<div className="space-y-16">
				{steps.map((step, index) => (
					<div key={index} className="relative pl-12 border-l border-white/5">
						{/* Timeline Dot */}
						<div className="absolute -left-[17px] top-0 w-8 h-8 rounded-full bg-black border border-white/10 flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.5)]">
							{step.icon}
						</div>

						<div className="space-y-4">
							<h4 className="text-xl font-bold text-white tracking-tight">
								{step.title}
							</h4>
							<p className="text-gray-400 leading-relaxed text-md max-w-2xl">
								{step.description}
							</p>

							{step.image && (
								<div className="pt-2">
									<img
										src={step.image}
										alt={step.title}
										className="w-full max-w-3xl rounded-xl border border-white/5 shadow-2xl transition-transform hover:scale-[1.01]"
									/>
								</div>
							)}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
