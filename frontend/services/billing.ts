import api from "./api";

export const getBillById = async (userId: string) => {
	const res = await api.get(`/billing/${userId}`);
	return res.data;
};

export const getUnpaidBills = async (userId: string) => {
	const res = await api.get(`/billing/unpaid/${userId}`);
	return res.data;
};
