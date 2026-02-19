export interface UserProfile {
	user_id: string;
	email: string;
	remaining_seconds: number;
	bot_started_at: string;
	role: string;
	auth_provider: "email" | "google";
	created_at: string;
	last_sign_in: string;
}
