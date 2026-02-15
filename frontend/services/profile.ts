import api from "./api";

// this file is for profilePage related functions
// data flow ep2, ep3 is main.go

export const getProfileById = async (id: string) => {
	const response = await api.get(`/user/profile/${id}`);
	return response.data;
};
