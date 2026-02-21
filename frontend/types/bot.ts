import { MT5 } from "./mt5";

export interface Bot {
	bot_id: string;
	mt5_id: string;
	name: string;
	currency: string;
	status: boolean;
	model_id: string;
}

export interface DeployModalProps {
	open: boolean;
	onClose: () => void;
	onSuccess?: () => void;
	mt5Id: string;
	deployedCurrencies?: string[];
}

export interface BotRowProps {
	bot: Bot;
	accountStatus: boolean;
	onDelete?: () => void;
	onStatusChange?: () => void;
}

export interface AccountCardProps {
	account: MT5;
	onDelete?: () => void;
}
