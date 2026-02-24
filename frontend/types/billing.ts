export interface Billing {
	bill_id: string;
	user_id: string;
	amount: number;
	created_at: string;
	status: string;
	start_period: string;
	end_period: string;
	payment_id: string;
	paid_at: string | null;
	due_date: string;
}
