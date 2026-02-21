import api from "./api";

export const getAvailableModels = async () => {
	const response = await api.get("/models/available-models");
	return response.data;
};
