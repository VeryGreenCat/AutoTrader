export type AuthMode = "signin" | "signup" | "otp";

export interface AuthModalProps {
	open: boolean;
	setOpen: (value: boolean) => void;
	mode: AuthMode;
	setMode: (mode: AuthMode) => void;
}
