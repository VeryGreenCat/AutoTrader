export type AuthMode = "signin" | "signup";

export interface AuthModalProps {
	open: boolean;
	setOpen: (value: boolean) => void;
	mode: AuthMode;
	setMode: (mode: AuthMode) => void;
}
