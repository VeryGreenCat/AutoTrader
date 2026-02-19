import axios from "axios";
import { supabase } from "@/lib/supabase";

// config axios aka preaddress envelope (send to domain http://localhost:5000/api)
// then the envelope will add more details like "send this request to this endpoint"
// data flow ep1, the ep0 is frontend and the ep2 is profile.ts

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const api = axios.create({
	baseURL: API_URL + "/api", // add /api to the base url because it is cool
	headers: {
		"Content-Type": "application/json",
	},
});

// This interceptor runs before EVERY request automatically
api.interceptors.request.use(async (config) => {
	const {
		data: { session },
	} = await supabase.auth.getSession();
	if (session?.access_token) {
		config.headers.Authorization = `Bearer ${session.access_token}`;
	}
	return config;
});

export default api;
