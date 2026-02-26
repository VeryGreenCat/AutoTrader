// services/payment.ts
import api from "./api";

export const createCheckoutSession = async (billId: string) => {
	const res = await api.post(`/payment/create-checkout-session`, {
		bill_id: billId,
	});
	return res.data;
};
