"use client";

import React, { useState, useEffect } from "react";
import { X, Mail, Lock, ShieldCheck } from "lucide-react";
import { message } from "antd"; // Using AntD only for clean notifications
import { supabase } from "@/lib/supabase";

interface AuthModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
	// State Management
	const [isLogin, setIsLogin] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [formData, setFormData] = useState({
		email: "",
		password: "",
		confirmPassword: "",
	});

	// Reset form when modal opens/closes
	useEffect(() => {
		if (!isOpen) {
			setFormData({ email: "", password: "", confirmPassword: "" });
			setIsLoading(false);
		}
	}, [isOpen]);

	// Handle Input Changes
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	// Toggle between Login and Signup
	const toggleMode = () => {
		setIsLogin(!isLogin);
		setFormData((prev) => ({ ...prev, confirmPassword: "" })); // Clear confirm pass
	};

	// Submit Handler (Connecting to Go Fiber)
	const handleSubmit = async () => {
		// 1. Basic Validation
		if (!formData.email || !formData.password) {
			message.error("Please fill in all fields");
			return;
		}

		if (!isLogin && formData.password !== formData.confirmPassword) {
			message.error("Passwords do not match");
			return;
		}

		setIsLoading(true);

		try {
			// 2. Determine Endpoint (Go Fiber Backend)
			// Assuming your Go backend has /api/v1/auth/login and /api/v1/auth/register
			const endpoint = isLogin ? "/api/v1/auth/login" : "/api/v1/auth/register";

			const response = await fetch(
				`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}${endpoint}`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						email: formData.email,
						password: formData.password,
					}),
				},
			);

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.message || "Authentication failed");
			}

			// 3. Success Handling
			message.success(isLogin ? "Access Granted" : "Account Initialized");

			// Store JWT if your Go Fiber sends one back
			if (data.token) {
				localStorage.setItem("auth_token", data.token);
			}

			onClose();
		} catch (error: any) {
			message.error(error.message);
		} finally {
			setIsLoading(false);
		}
	};

	// Prevent rendering if closed
	if (!isOpen) return null;

	const signInWithGoogle = async () => {
		const { error } = await supabase.auth.signInWithOAuth({
			provider: "google",
			options: {
				redirectTo: `${window.location.origin}/auth/callback`,
			},
		});

		if (error) console.error(error);
	};

	return (
		<div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-200 flex items-center justify-center p-4 animate-in fade-in duration-200">
			{/* CSS for the glass card effect if not globally defined */}
			<style jsx>{`
				.glass-card {
					background: rgba(255, 255, 255, 0.03);
					backdrop-filter: blur(20px);
					-webkit-backdrop-filter: blur(20px);
					border: 1px solid rgba(255, 255, 255, 0.05);
				}
			`}</style>

			<div className="glass-card w-full max-w-100 p-8 border-[#00FFA3]/20 relative overflow-hidden shadow-[0_0_50px_rgba(0,255,163,0.1)] rounded-2xl">
				{/* Decorative Background Blob */}
				<div className="absolute -top-24 -left-24 w-48 h-48 bg-[#00FFA3]/10 rounded-full blur-3xl"></div>

				{/* Header Section */}
				<div className="text-center mb-8 relative">
					<button
						onClick={onClose}
						className="absolute -top-2 -right-2 text-gray-500 hover:text-white transition"
					>
						<X className="w-5 h-5" />
					</button>
					<h2 className="text-2xl font-black italic tracking-tighter uppercase text-white">
						{isLogin ? (
							<>
								SYSTEM <span className="text-[#00FFA3]">ACCESS</span>
							</>
						) : (
							<>
								Claim <span className="text-[#00FFA3]">10 Tickets</span>
							</>
						)}
					</h2>
					<p className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mt-2">
						{isLogin
							? "Enter credentials to proceed"
							: "Create an account to start your 120hr trial"}
					</p>
				</div>

				{/* Google Auth Button */}
				<button
					onClick={signInWithGoogle}
					className="w-full flex items-center justify-center gap-3 bg-white/5 border border-white/10 hover:bg-white/10 py-3 rounded-xl transition group"
				>
					{/* Note: In Next.js, use Image component, but simplified here for snippets */}
					<img
						src="https://www.google.com/favicon.ico"
						alt="Google"
						className="w-4 h-4 grayscale group-hover:grayscale-0 transition"
					/>
					<span className="text-xs font-bold uppercase tracking-wider text-white">
						{isLogin ? "Sign in with Google" : "Sign up with Google"}
					</span>
				</button>

				{/* Divider */}
				<div className="flex items-center gap-4 my-6">
					<div className="h-px flex-1 bg-white/10"></div>
					<span className="text-[10px] text-gray-600 font-bold">OR</span>
					<div className="h-px flex-1 bg-white/10"></div>
				</div>

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

					{/* Confirm Password (Signup Only) */}
					{!isLogin && (
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
					)}
				</div>

				{/* Submit Button */}
				<button
					onClick={handleSubmit}
					disabled={isLoading}
					className="w-full bg-[#00FFA3] text-black font-black py-4 rounded-xl mt-8 shadow-[0_10px_20px_rgba(0,255,163,0.2)] hover:scale-[1.02] hover:shadow-[0_10px_30px_rgba(0,255,163,0.4)] transition active:scale-95 uppercase tracking-tighter disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
				>
					{isLoading ? (
						<span className="animate-pulse">Processing...</span>
					) : (
						<span>{isLogin ? "Enter System" : "Initialize Account"}</span>
					)}
				</button>

				{/* Footer Toggle */}
				<p className="text-center mt-6 text-[11px] text-gray-500">
					<span>{isLogin ? "Don't have access?" : "Already an operator?"}</span>
					<button
						onClick={toggleMode}
						className="text-[#00FFA3] font-bold hover:underline ml-1 outline-none"
					>
						{isLogin ? "Claim Tickets" : "Sign In"}
					</button>
				</p>
			</div>
		</div>
	);
}
