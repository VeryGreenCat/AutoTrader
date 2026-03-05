import api from "./api";

export const getLLMTrans = async (currency: string) => {
	const response = await api.get(`/llmTrans?currency=${currency}`);
	return response.data;
};
