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
}
