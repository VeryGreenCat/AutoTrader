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

export interface OpenPosition {
	pair: string;
	type: "BUY" | "SELL";
	entry: number;
	current: number;
	lot: number;
	profit: number;
}

export interface ClosedPosition {
	pair: string;
	type: "BUY" | "SELL";
	entry: number;
	lot: number;
	profit: number;
}

export interface MT5AccountCardStats {
	equity: number;
	balance: number;
	realized_today: number;
	realized_week: number;
	is_connected: boolean;
	open_positions: OpenPosition[];
	closed_positions: ClosedPosition[];
}
