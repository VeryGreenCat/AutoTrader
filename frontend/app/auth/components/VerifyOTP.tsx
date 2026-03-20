"use client";

import {
	ShieldCheck,
	Lock,
	RefreshCw,
	AlertCircle,
	ArrowRight,
} from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { App, Modal } from "antd";

export default function VerifyOTP({
	open,
	setOpen,
}: {
	open: boolean;
	setOpen: (open: boolean) => void;
}) {
	const { message } = App.useApp();
	const [code, setCode] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	// New State for Resend Timer
	const [timeLeft, setTimeLeft] = useState(60); // Start with 60s cooldown
	const [canResend, setCanResend] = useState(false);

	const router = useRouter();

	// 1. Send OTP on mount (Initial Send)
	useEffect(() => {
		if (sessionStorage.getItem("otp_verified")) return;
		const sendOtp = async () => {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (!user) return;

			await supabase.auth.signInWithOtp({
				email: user.email!,
				options: { shouldCreateUser: false },
			});
			console.log("Initial OTP sent");
		};
		sendOtp();
	}, []);

	// 2. Countdown Logic
	useEffect(() => {
		if (timeLeft > 0) {
			const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
			return () => clearTimeout(timerId);
		} else {
			setCanResend(true);
		}
	}, [timeLeft]);

	// 3. Resend Function
	const handleResend = async () => {
		if (!canResend) return;

		setError("");
		setCode("");
		setCanResend(false);
		setTimeLeft(30); // Reset timer to 30s

		const {
			data: { user },
		} = await supabase.auth.getUser();
		if (!user) return;

		const { error } = await supabase.auth.signInWithOtp({
			email: user.email!,
			options: { shouldCreateUser: false },
		});

		if (error) {
			setError("Wait a bit before retrying!");
		}
		message.success("New OTP sent!");
	};

	const handleVerify = async () => {
		setLoading(true);
		setError("");

		const {
			data: { user },
		} = await supabase.auth.getUser();
		if (!user) {
			setLoading(false);
			return;
		}

		const { error } = await supabase.auth.verifyOtp({
			email: user.email!,
			token: code,
			type: "email",
		});

		if (error) {
			setError("Incorrect code. Please try again.");
			setCode("");
			setLoading(false);
		} else {
			if (typeof window !== "undefined") {
				sessionStorage.setItem("otp_verified", "true");
				localStorage.setItem("user_id", user.id);
			}
			router.push("/bots");
			router.refresh();
			setOpen(false);
		}
	};

	const handleCancel = () => {
		setOpen(false);
	};

	const handleLogout = async () => {
		await supabase.auth.signOut();
		localStorage.removeItem("user_id");
		sessionStorage.removeItem("otp_verified");
		window.location.reload();
	};

	return (
		<Modal
			open={open}
			onCancel={handleCancel}
			loading={loading}
			footer={null}
			centered
			mask={{ closable: false }}
			keyboard={false}
			closable={false}
			closeIcon={null}
		>
			<div className="flex items-center justify-center p-4">
				<div
					className="w-full max-w-md p-8 rounded-2xl 
                  bg-[#0f0f0f] 
                  border border-[#00FFA3]/20
                  shadow-[0_0_40px_rgba(0,255,163,0.12)]
                  relative"
				>
					<div className="absolute -top-24 -left-24 w-48 h-48 bg-[#00FFA3]/10 rounded-full blur-3xl"></div>
					{/* Header Section */}
					<div className="text-center mb-8">
						<div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#00FFA3]/10 mb-4 border border-[#00FFA3]/20 shadow-[0_0_15px_rgba(0,255,163,0.2)]">
							<ShieldCheck className="w-6 h-6 text-[#00FFA3]" />
						</div>
						<h1 className="text-3xl font-bold tracking-tighter uppercase italic mb-2 text-white">
							Security <span className="text-[#00FFA3]">Check</span>
						</h1>
						<p className="text-gray-400 text-xs uppercase tracking-widest font-bold">
							Authentication Required
						</p>
					</div>

					{/* Instructions */}
					<p className="text-gray-400 text-sm text-center mb-8 leading-relaxed">
						We have transmitted a{" "}
						<span className="text-white font-bold">6-digit secure code</span> to
						your registered terminal.
					</p>

					{/* Input Field */}
					<div className="relative mb-6 group">
						<div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
							<Lock className="h-5 w-5 text-gray-500 group-focus-within:text-[#00FFA3] transition-colors duration-300" />
						</div>
						<input
							type="text"
							value={code}
							onChange={(e) => setCode(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter" && code.length === 6 && !loading) {
									handleVerify();
								}
							}}
							placeholder="000 000"
							maxLength={6}
							className="w-full bg-black/50 border border-white/10 text-white text-center text-2xl font-mono font-bold py-4 pl-10 pr-4 rounded-xl focus:outline-none focus:border-[#00FFA3] focus:bg-[#00FFA3]/5 focus:shadow-[0_0_20px_rgba(0,255,163,0.1)] transition-all duration-300 tracking-[0.5em] placeholder-gray-700"
						/>
					</div>

					{/* Error Message */}
					{error && (
						<div className="flex items-center justify-center gap-2 text-red-400 text-xs font-bold uppercase tracking-wide mb-6 bg-red-500/10 py-3 rounded-lg border border-red-500/20 animate-in fade-in slide-in-from-top-1">
							<AlertCircle className="w-4 h-4" />
							{error}
						</div>
					)}

					{/* Confirm Button */}
					<button
						onClick={handleVerify}
						disabled={loading || code.length < 6}
						className={`w-full font-black py-4 rounded-xl mb-6 flex items-center justify-center gap-2 transition-all uppercase tracking-wider cursor-pointer
            ${
							loading || code.length < 6
								? "bg-white/5 text-gray-500 cursor-not-allowed border border-white/5"
								: "bg-[#00FFA3] text-black shadow-[0_0_20px_rgba(0,255,163,0.3)] hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(0,255,163,0.4)]"
						}`}
					>
						{loading ? (
							<>
								<RefreshCw className="w-4 h-4 animate-spin" /> Verifying...
							</>
						) : (
							<>
								Confirm Identity <ArrowRight className="w-4 h-4" />
							</>
						)}
					</button>

					{/* Resend Timer & Emergency Exit */}
					<div className="text-center pt-2 border-t border-white/5 space-y-4">
						<button
							onClick={handleResend}
							disabled={!canResend}
							className={`text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 mx-auto px-4 py-2 rounded-lg cursor-pointer
              ${
								canResend
									? "text-[#00FFA3] hover:text-white hover:bg-white/5 cursor-pointer"
									: "text-gray-600 cursor-not-allowed"
							}`}
						>
							{canResend ? (
								<>
									<RefreshCw className="w-3 h-3" /> Resend Code
								</>
							) : (
								<span>
									Resend available in{" "}
									<span className="font-mono text-white ml-1">{timeLeft}s</span>
								</span>
							)}
						</button>

						<button
							onClick={handleLogout}
							className="text-[9px] text-gray-700 hover:text-red-400 font-black uppercase tracking-[0.2em] transition-colors cursor-pointer block mx-auto outline-none"
						>
							Not your account? Sign Out
						</button>
					</div>
				</div>
			</div>
		</Modal>
	);
}
