"use client";

import { useState, useEffect } from "react";
import { Mail, Lock, ShieldCheck } from "lucide-react";
import { Modal, message } from "antd";
import { supabase } from "@/lib/supabase";
import { AuthModalProps } from "@/types/auth";

const AuthModal = ({ open, setOpen, mode, setMode }: AuthModalProps) => {
	const [loading, setLoading] = useState(false);
	const [formData, setFormData] = useState({
		email: "",
		password: "",
		confirmPassword: "",
	});

	useEffect(() => {
		if (!open) {
			setFormData({ email: "", password: "", confirmPassword: "" });
			setLoading(false);
		}
	}, [open]);

	const signInWithGoogle = async () => {
		const { error } = await supabase.auth.signInWithOAuth({
			provider: "google",
			options: {
				redirectTo: `${window.location.origin}/auth/callback`,
				queryParams: {
					prompt: "select_account",
				},
			},
		});

		if (error) console.error(error);
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleSubmit = async () => {
		if (!formData.email || !formData.password) {
			message.error("Please fill in all fields");
			return;
		}

		if (mode === "signup" && formData.password !== formData.confirmPassword) {
			message.error("Passwords do not match");
			return;
		}

		try {
			if (mode === "signin") {
				const { data, error } = await supabase.auth.signInWithPassword({
					email: formData.email,
					password: formData.password,
				});
				if (error) throw error;
				message.success("Access Granted");
			} else {
				const { data, error } = await supabase.auth.signUp({
					email: formData.email,
					password: formData.password,
				});
				if (error) throw error;
				message.success("Account created");
			}
			window.location.href = `${window.location.origin}/auth/callback`;
			handleCancel();
		} catch (error: any) {
			message.error(error.message);
		}
	};

	const handleCancel = () => {
		setOpen(false);
	};

	if (mode === "signin") {
		return (
			<Modal
				open={open}
				onCancel={handleCancel}
				loading={loading}
				footer={null}
				centered
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
						<div className="text-center mb-8 relative">
							<h2 className="text-2xl font-black italic tracking-tighter uppercase text-white">
								SYSTEM <span className="text-[#00FFA3]">ACCESS</span>
							</h2>
							<p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mt-2">
								Enter credentials to proceed
							</p>
						</div>
						<GoogleAuthButton displayMode="signin" />
						{/* Form Fields */}
						<div className="space-y-4">
							{/* Email */}
							<div>
								<label className="text-[9px] text-gray-500 uppercase font-bold tracking-widest ml-1 mb-1 block">
									Email Address
								</label>
								<div className="relative">
									<Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
									<input
										type="email"
										name="email"
										value={formData.email}
										onChange={handleChange}
										placeholder="operator@aura-ai.com"
										className="w-full bg-black/40 border border-white/10 focus:border-[#00FFA3] rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-gray-600 outline-none transition focus:shadow-[0_0_20px_rgba(0,255,163,0.1)]"
									/>
								</div>
							</div>

							{/* Password */}
							<div>
								<label className="text-[9px] text-gray-500 uppercase font-bold tracking-widest ml-1 mb-1 block">
									Access Password
								</label>
								<div className="relative">
									<Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
									<input
										type="password"
										name="password"
										value={formData.password}
										onChange={handleChange}
										placeholder="••••••••"
										className="w-full bg-black/40 border border-white/10 focus:border-[#00FFA3] rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-gray-600 outline-none transition focus:shadow-[0_0_20px_rgba(0,255,163,0.1)]"
									/>
								</div>
							</div>
						</div>
						{/* Submit Button */}
						<button
							onClick={handleSubmit}
							className="w-full bg-[#00FFA3] text-black font-black py-4 rounded-xl mt-8 shadow-[0_10px_20px_rgba(0,255,163,0.2)] hover:scale-[1.02] hover:shadow-[0_10px_30px_rgba(0,255,163,0.4)] transition active:scale-95 uppercase tracking-tighter disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer"
						>
							{loading ? (
								<span className="animate-pulse">Processing...</span>
							) : (
								"Sign In"
							)}
						</button>

						{/* Footer Toggle */}
						<p className="text-center mt-6 text-[11px] text-gray-500">
							<span>Don't have an account? </span>
							<button
								onClick={() => setMode("signup")}
								className="text-[#00FFA3] font-bold hover:underline ml-1 outline-none cursor-pointer"
							>
								Sign Up Now
							</button>
						</p>
					</div>
				</div>
			</Modal>
		);
	}

	if (mode === "signup") {
		return (
			<Modal
				open={open}
				onCancel={handleCancel}
				loading={loading}
				footer={null}
				centered
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
						<div className="text-center mb-8 relative">
							<h2 className="text-2xl font-black italic tracking-tighter uppercase text-white">
								Claim <span className="text-[#00FFA3]">10 Tickets</span>
							</h2>
							<p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mt-2">
								Create an account to start your 120 hours trial
							</p>
						</div>
						<GoogleAuthButton displayMode="signup" />
						{/* Form Fields */}
						<div className="space-y-4">
							{/* Email */}
							<div>
								<label className="text-[9px] text-gray-500 uppercase font-bold tracking-widest ml-1 mb-1 block">
									Email Address
								</label>
								<div className="relative">
									<Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
									<input
										type="email"
										name="email"
										value={formData.email}
										onChange={handleChange}
										placeholder="operator@aura-ai.com"
										className="w-full bg-black/40 border border-white/10 focus:border-[#00FFA3] rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-gray-600 outline-none transition focus:shadow-[0_0_20px_rgba(0,255,163,0.1)]"
									/>
								</div>
							</div>

							{/* Password */}
							<div>
								<label className="text-[9px] text-gray-500 uppercase font-bold tracking-widest ml-1 mb-1 block">
									Access Password
								</label>
								<div className="relative">
									<Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
									<input
										type="password"
										name="password"
										value={formData.password}
										onChange={handleChange}
										placeholder="••••••••"
										className="w-full bg-black/40 border border-white/10 focus:border-[#00FFA3] rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-gray-600 outline-none transition focus:shadow-[0_0_20px_rgba(0,255,163,0.1)]"
									/>
								</div>
							</div>

							{/* Confirm Password  */}

							<div className="animate-in fade-in slide-in-from-top-2 duration-300">
								<label className="text-[9px] text-gray-500 uppercase font-bold tracking-widest ml-1 mb-1 block">
									Verify Password
								</label>
								<div className="relative">
									<ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
									<input
										type="password"
										name="confirmPassword"
										value={formData.confirmPassword}
										onChange={handleChange}
										placeholder="••••••••"
										className="w-full bg-black/40 border border-white/10 focus:border-[#00FFA3] rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-gray-600 outline-none transition focus:shadow-[0_0_20px_rgba(0,255,163,0.1)]"
									/>
								</div>
							</div>
						</div>
						{/* Submit Button */}
						<button
							onClick={handleSubmit}
							className="w-full bg-[#00FFA3] text-black font-black py-4 rounded-xl mt-8 shadow-[0_10px_20px_rgba(0,255,163,0.2)] hover:scale-[1.02] hover:shadow-[0_10px_30px_rgba(0,255,163,0.4)] transition active:scale-95 uppercase tracking-tighter disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center cursor-pointer"
						>
							{loading ? (
								<span className="animate-pulse">Processing...</span>
							) : (
								"Create Account"
							)}
						</button>

						{/* Footer Toggle */}
						<p className="text-center mt-6 text-[11px] text-gray-500">
							<span>Already has an account? </span>
							<button
								onClick={() => setMode("signin")}
								className="text-[#00FFA3] font-bold hover:underline ml-1 outline-none cursor-pointer"
							>
								Sign In
							</button>
						</p>
					</div>
				</div>
			</Modal>
		);
	}

	function GoogleAuthButton({ displayMode }: { displayMode: string }) {
		return (
			<>
				<button
					onClick={signInWithGoogle}
					className="w-full flex items-center justify-center gap-3 bg-white/5 border border-white/10 hover:bg-white/10 py-3 rounded-xl transition group cursor-pointer"
				>
					<img
						src="https://www.google.com/favicon.ico"
						alt="Google"
						className="w-4 h-4 grayscale group-hover:grayscale-0 transition"
					/>
					<span className="text-xs font-bold uppercase tracking-wider text-white">
						{displayMode === "signin"
							? "Sign in with Google"
							: "Sign up with Google"}
					</span>
				</button>

				<div className="flex items-center gap-4 my-6">
					<div className="h-px flex-1 bg-white/10"></div>
					<span className="text-[10px] text-gray-600 font-bold">OR</span>
					<div className="h-px flex-1 bg-white/10"></div>
				</div>
			</>
		);
	}
};

export default AuthModal;
