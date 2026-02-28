// services/payment.ts
import api from "./api";

export const createCheckoutSession = async (
	id: string,
	type: "billing" | "ticket" = "billing", // default to billing
) => {
	const payload =
		type === "billing" ? { bill_id: id, type } : { package_id: id, type };

	const res = await api.post(`/payment/create-checkout-session`, payload);
	return res.data;
};
