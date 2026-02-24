import api from "./api";

export const createCheckoutSession = async (amount: number, userId: string) => {
	const res = await api.post(`/payment/create-checkout-session`, {
		user_id: userId,
		amount: amount,
	});
	return res.data;
};
