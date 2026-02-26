export interface Transaction {
	TransactionID: string;
	MT5ID: string;
	Created: Date;
	PNL: number;
	BotID: string;
	TradeType: string;
	UserID: string;
}

export interface Acc_PnL_response {
	mt5_id: string; 
	mt5_name: string;
	pnl: number;
}

export interface Acc_PnL_request {
	user_id: string;
	start_period: string;
	end_period: string;
}
