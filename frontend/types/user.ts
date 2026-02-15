export interface UserProfile {
	user_id: string;
	email: string;
	role: string;
	tickets: number;
	auth_provider: "email" | "google";
	created_at: string;
	last_sign_in: string;
}
 