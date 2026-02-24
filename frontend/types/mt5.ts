export interface addAccountProps {
	mt5_id: string;
	user_id: string;
	name: string;
	token: string;
}

export interface MT5 {
	mt5_id: string;
	user_id: string;
	name: string;
	token: string;
	status: boolean;
	balance: number;
	equity: number;
	today_pnl: number;
}
