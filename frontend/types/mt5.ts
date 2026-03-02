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
}

export interface MT5AccountCardStats {
	equity: number;
	balance: number;
	is_connected: boolean;
}
