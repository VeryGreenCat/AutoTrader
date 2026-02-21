import api from "./api";

export const deployBot = async (mt5Id: string, modelId: string) => {
	const response = await api.post("/bots/deploy-bot", {
		mt5_id: mt5Id,
		model_id: modelId,
	});
	return response.data;
};

export const getBotsByMt5Id = async (mt5Id: string) => {
	const response = await api.get(`/bots/${mt5Id}`);
	return response.data;
};

export const deleteBot = async (botId: string) => {
	const response = await api.delete(`/bots/${botId}`);
	return response.data;
};
