import { addAccountProps } from "@/types/mt5";
import api from "./api";

export const getAccountById = async (userId: string) => {
	const res = await api.get(`/mt5/accounts/${userId}`);
	return res.data;
};

export const addAccount = async (accountData: addAccountProps) => {
	const res = await api.post(`/mt5/accounts`, accountData);
	return res.data;
};
