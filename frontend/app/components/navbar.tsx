"use client";

import { usePathname, useRouter } from "next/navigation";
import {
	Cpu,
	Ticket,
	Plus,
	Activity,
	LogOut,
	User,
	LogIn,
	ChevronDown,
	Info,
	Menu,
	X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Dropdown, MenuProps } from "antd";
import { supabase } from "@/lib/supabase";
import { AuthMode } from "@/types/auth";
import AuthModal from "../auth/components/AuthModal";
import { getAccountById } from "@/services/mt5";
import { MT5 } from "@/types/mt5";
import { getProfileById } from "@/services/profile";
import { UserProfile } from "@/types/user";
import LogoutConfirmModal from "./LogoutConfirmModal";

export default function Navbar() {
	const pathname = usePathname();
	const router = useRouter();
	const [user, setUser] = useState<any>(null);
	const [openModal, setOpenModal] = useState(false);
	const [authMode, setAuthMode] = useState<AuthMode>("signin");
	const [accounts, setAccounts] = useState<MT5[]>([]);

	const [profile, setProfile] = useState<UserProfile | null>(null);
	const [displaySeconds, setDisplaySeconds] = useState<number>(0);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
	const [isLoggingOut, setIsLoggingOut] = useState(false);

	// 1. Check User Session on Mount
	useEffect(() => {
		const getUser = async () => {
			const {
				data: { session },
			} = await supabase.auth.getSession();
			setUser(session?.user ?? null);
		};
		getUser();

		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			setUser(session?.user ?? null);
		});

		return () => subscription.unsubscribe();
	}, []);

	// 2. Fetch Accounts and Profile
	useEffect(() => {
		const fetchData = async () => {
			if (user?.id) {
				try {
					const [accRes, profileRes] = await Promise.all([
						getAccountById(user.id),
						getProfileById(user.id),
					]);
					setAccounts(accRes.data);
					setProfile(profileRes.data);
				} catch (error) {
					console.error("Failed to fetch data in Navbar:", error);
				}
			} else {
				setAccounts([]);
				setProfile(null);
			}
		};

		fetchData();

		// Fetch only when status is updated elsewhere
		window.addEventListener("BOT_STATUS_UPDATED", fetchData);
		window.addEventListener("MT5_ACCOUNTS_UPDATED", fetchData);

		return () => {
			window.removeEventListener("BOT_STATUS_UPDATED", fetchData);
			window.removeEventListener("MT5_ACCOUNTS_UPDATED", fetchData);
		};
	}, [user]);

	// 3. Handle Real-time Ticket Countdown
	useEffect(() => {
		if (!profile) {
			setDisplaySeconds(0);
			// console.log("no profile");
			return;
		}

		if (!profile.bot_started_at) {
			setDisplaySeconds(profile.remaining_seconds);
			// console.log("no bot started at");
			return;
		}

		// console.log("bot started at", profile.bot_started_at);
		const startTime = new Date(profile.bot_started_at).getTime() / 1000;
		// console.log("start time", startTime);
		const expirationTimestamp = startTime + profile.remaining_seconds;
		// console.log("expiration timestamp", expirationTimestamp);

		const updateDisplay = () => {
			const now = Date.now() / 1000;
			const left = Math.max(0, expirationTimestamp - now);
			setDisplaySeconds(left);
		};

		updateDisplay();
		const countdownInterval = setInterval(updateDisplay, 1000);

		return () => clearInterval(countdownInterval);
	}, [profile]);

	// 4. Logout Function
	const handleLogout = async () => {
		setIsLoggingOut(true);
		try {
			await supabase.auth.signOut();
			router.push("/");
			sessionStorage.removeItem("otp_verified");
			localStorage.removeItem("user_id");
			setIsLogoutModalOpen(false);
		} catch (error) {
			console.error("Logout failed:", error);
		} finally {
			setIsLoggingOut(false);
		}
	};

	const formatTime = (seconds: number) => {
		const hrs = Math.floor(seconds / 3600);
		const mins = Math.floor((seconds % 3600) / 60);
		const secs = Math.floor(seconds % 60);
		return `${hrs.toString().padStart(2, "0")}:${mins
			.toString()
			.padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
	};

	const isActive = (path: string) => pathname === path;

	const getLinkClass = (path: string) => {
		const base =
			"pb-1 transition-colors hover:text-white cursor-pointer flex items-center gap-1";
		return isActive(path)
			? `${base} text-white border-b-2 border-[#00FFA3]`
			: `${base} text-gray-400`;
	};

	const sortedAccounts = [...accounts].sort((a, b) => {
		if (a.status === b.status) return 0;
		return a.status ? -1 : 1;
	});

	const accountMenuItems: MenuProps["items"] = sortedAccounts.map((acc) => ({
		key: acc.mt5_id,
		disabled: !acc.status,
		label: (
			<div
				className={`flex items-center py-1 ${!acc.status ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}`}
				onClick={() => {
					if (acc.status) {
						router.push(`/dashboard?account=${acc.name}`);
					}
				}}
			>
				<span className="font-medium text-white">{acc.name}</span>
			</div>
		),
	}));

	const hasConnectedAccount = accounts.some((acc) => acc.status);

	return (
		<>
			<nav className="fixed top-0 w-full z-50 bg-black/80 backdrop-blur-xl border-b border-white/5 py-4 px-8 flex justify-between items-center">
				{/* LEFT: Logo */}
				<div
					onClick={() => router.push("/")}
					className="flex items-center gap-3 group cursor-pointer"
				>
					<div className="w-8 h-8 bg-[#00FFA3] rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(0,255,163,0.4)] group-hover:shadow-[0_0_25px_rgba(0,255,163,0.6)] transition">
						<Cpu className="text-black w-5 h-5" />
					</div>
					<span className="text-xl font-bold tracking-tighter italic text-white">
						Auto<span className="text-[#00FFA3]">Trader</span>
					</span>
				</div>

				{/* CENTER: Navigation Links */}
				<div className="hidden md:flex gap-8 font-medium text-sm">
					<button
						onClick={() => router.push("/")}
						className={getLinkClass("/")}
					>
						Home
					</button>
					{pathname.startsWith("/dashboard") ? (
						<Dropdown
							menu={{ items: accountMenuItems }}
							placement="bottom"
							classNames={{ root: "account-dropdown" }}
							disabled={!hasConnectedAccount}
						>
							<button
								onClick={() => {
									if (hasConnectedAccount) {
										router.push("/dashboard");
									}
								}}
								className={`${getLinkClass("/dashboard")} ${!hasConnectedAccount ? "opacity-30 cursor-not-allowed grayscale" : ""}`}
								disabled={!hasConnectedAccount}
							>
								Dashboard
								<ChevronDown className="w-3 h-3 opacity-50" />
							</button>
						</Dropdown>
					) : (
						<button
							onClick={() => {
								router.push("/dashboard");
							}}
							className={`${getLinkClass("/dashboard")}`}
						>
							Dashboard
						</button>
					)}

					<button
						onClick={() => router.push("/bots")}
						className={getLinkClass("/bots")}
					>
						My Bots
					</button>
					<button
						onClick={() => router.push("/billing")}
						className={getLinkClass("/billing")}
					>
						Billing
					</button>
				</div>

				{/* RIGHT: System Fuel + Status + Profile */}
				<div className="flex items-center gap-6">
					{/* System Fuel */}
					<div
						id="navbar-system-fuel"
						className="hidden lg:flex items-center gap-4 px-6 border-r border-white/10"
					>
						<div className="text-right">
							<div className="flex items-center justify-end gap-2 mb-1">
								<Ticket className="w-3 h-3 text-[#00FFA3]" />
								<p className="text-[10px] text-gray-500 uppercase tracking-widest">
									System Fuel
								</p>
							</div>

							<div className="flex items-center gap-3">
								<div className="flex flex-col items-end">
									<span className="text-xs font-bold text-white">
										<span className="text-[#00FFA3]">
											{(displaySeconds / 43200).toFixed(2)}
										</span>{" "}
										Tickets
										<span className="text-[10px] text-gray-500 ml-2 font-mono">
											({formatTime(displaySeconds)})
										</span>
									</span>
									<div className="w-32 h-1 bg-white/10 rounded-full mt-1 overflow-hidden border border-white/5">
										<div
											className="bg-linear-to-r from-[#00FFA3] to-emerald-500 h-full shadow-[0_0_10px_rgba(0,255,163,0.5)] transition-all duration-1000 ease-linear"
											style={{
												width: `${((displaySeconds % 43200) / 43200) * 100}%`,
											}}
										></div>
									</div>
								</div>

								<button
									onClick={() => router.push("/buyTickets")}
									className="w-7 h-7 rounded-lg bg-[#00FFA3]/10 border border-[#00FFA3]/20 flex items-center justify-center hover:bg-[#00FFA3] hover:text-black transition-all group active:scale-95 cursor-pointer"
								>
									<Plus className="w-4 h-4 group-hover:scale-110 transition" />
								</button>
							</div>
						</div>
					</div>

					{/* MT5 Status */}
					<div className="hidden sm:block text-right">
						<p className="text-[10px] text-gray-500 uppercase tracking-widest mb-0.5">
							MT5 Status
						</p>
						{(() => {
							const connectedCount = accounts.filter(
								(acc) => acc.status,
							).length;
							return (
								<div
									className={`text-xs flex items-center gap-1 justify-end font-bold transition-colors ${
										connectedCount > 0 ? "text-[#00FFA3]" : "text-red-500"
									}`}
								>
									<Activity
										className={`w-3 h-3 ${connectedCount > 0 ? "animate-pulse" : ""}`}
									/>
									{connectedCount > 0
										? `${connectedCount} Connected`
										: "Disconnected"}
								</div>
							);
						})()}
					</div>

					{/* PROFILE DROPDOWN AREA */}
					<div className="relative group hidden md:block">
						{/* Avatar Trigger */}
						<div className="w-10 h-10 rounded-full bg-linear-to-tr from-emerald-400 to-blue-500 border-2 border-white/10 cursor-pointer hover:scale-105 transition shadow-[0_0_15px_rgba(0,255,163,0.2)] flex items-center justify-center">
							<User className="w-5 h-5 text-white/90" />
						</div>

						{/* Dropdown Menu (Visible on Group Hover) */}
						<div className="absolute right-0 top-full pt-4 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform group-hover:translate-y-0 translate-y-2">
							<div className="bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden">
								{user ? (
									// LOGGED IN MENU
									<div className="flex flex-col">
										<button
											onClick={() => {
												setIsMobileMenuOpen(false);
												router.push("/profile");
											}}
											className="flex items-center gap-2 px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-[#00FFA3] transition-colors text-left cursor-pointer"
										>
											<User className="w-4 h-4" />
											Profile
										</button>
										<button
											onClick={() => {
												setIsMobileMenuOpen(false);
												if (pathname === "/bots") {
													window.dispatchEvent(
														new CustomEvent("START_PAGE_TOUR"),
													);
												} else {
													sessionStorage.setItem("start_tour", "true");
													router.push("/bots");
												}
											}}
											className="flex items-center gap-2 px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-[#00FFA3] transition-colors text-left cursor-pointer"
										>
											<Info className="w-4 h-4" />
											Tutorial
										</button>
										<button
											onClick={() => {
												setIsMobileMenuOpen(false);
												setIsLogoutModalOpen(true);
											}}
											className="flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-white/5 hover:text-red-300 transition-colors text-left cursor-pointer"
										>
											<LogOut className="w-4 h-4" />
											Log Out
										</button>
									</div>
								) : (
									// LOGGED OUT MENU
									<div className="flex flex-col p-1">
										<button
											onClick={() => {
												setIsMobileMenuOpen(false);
												setOpenModal(true);
											}}
											className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-white bg-[#00FFA3]/10 hover:bg-[#00FFA3] hover:text-black rounded-lg transition-all cursor-pointer"
										>
											<LogIn className="w-4 h-4" />
											Log In
										</button>
									</div>
								)}
							</div>
						</div>
					</div>

					{/* Mobile Menu Toggle */}
					<button
						onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
						className="md:hidden w-10 h-10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
					>
						{isMobileMenuOpen ? (
							<X className="w-6 h-6" />
						) : (
							<Menu className="w-6 h-6" />
						)}
					</button>
				</div>
			</nav>

			{/* Sidebar Drawer (Mobile) */}
			<div
				className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
					isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
				}`}
				onClick={() => setIsMobileMenuOpen(false)}
			/>

			<div
				className={`fixed top-0 left-0 bottom-0 w-72 z-50 bg-[#0B0B0B] border-r border-white/5 shadow-2xl transition-transform duration-300 ease-in-out md:hidden flex flex-col ${
					isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
				}`}
			>
				{/* Drawer Header */}
				<div className="p-6 flex items-center justify-between border-b border-white/5">
					<div
						onClick={() => {
							setIsMobileMenuOpen(false);
							router.push("/");
						}}
						className="flex items-center gap-3 cursor-pointer"
					>
						<div className="w-8 h-8 bg-[#00FFA3] rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(0,255,163,0.4)]">
							<Cpu className="text-black w-5 h-5" />
						</div>
						<span className="text-xl font-bold tracking-tighter italic text-white">
							Auto<span className="text-[#00FFA3]">Trader</span>
						</span>
					</div>
				</div>

				{/* Drawer Content */}
				<div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
					{/* Navigation Links */}
					<div className="mb-6 flex flex-col gap-1">
						<p className="px-4 text-[10px] text-gray-500 uppercase tracking-widest mb-2">
							Navigation
						</p>
						<button
							onClick={() => {
								setIsMobileMenuOpen(false);
								router.push("/");
							}}
							className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-all ${
								isActive("/")
									? "bg-[#00FFA3]/10 text-[#00FFA3]"
									: "text-gray-400 hover:bg-white/5 hover:text-white"
							}`}
						>
							Home
						</button>
						<button
							onClick={() => {
								setIsMobileMenuOpen(false);
								if (hasConnectedAccount) router.push("/dashboard");
							}}
							className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-all ${
								isActive("/dashboard")
									? "bg-[#00FFA3]/10 text-[#00FFA3]"
									: "text-gray-400 hover:bg-white/5 hover:text-white"
							} ${!hasConnectedAccount ? "opacity-30 grayscale cursor-not-allowed" : ""}`}
							disabled={!hasConnectedAccount}
						>
							Dashboard
						</button>
						<button
							onClick={() => {
								setIsMobileMenuOpen(false);
								router.push("/bots");
							}}
							className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-all ${
								isActive("/bots")
									? "bg-[#00FFA3]/10 text-[#00FFA3]"
									: "text-gray-400 hover:bg-white/5 hover:text-white"
							}`}
						>
							My Bots
						</button>
						<button
							onClick={() => {
								setIsMobileMenuOpen(false);
								router.push("/billing");
							}}
							className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-all ${
								isActive("/billing")
									? "bg-[#00FFA3]/10 text-[#00FFA3]"
									: "text-gray-400 hover:bg-white/5 hover:text-white"
							}`}
						>
							Billing
						</button>
					</div>

					{/* Status Information (Visible only here on mobile) */}
					<div className="mb-6 flex flex-col gap-4 px-4 py-4 rounded-xl bg-white/5 border border-white/5">
						<div>
							<p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">
								MT5 Status
							</p>
							{(() => {
								const connectedCount = accounts.filter(
									(acc) => acc.status,
								).length;
								return (
									<div
										className={`text-sm flex items-center gap-2 font-bold ${
											connectedCount > 0 ? "text-[#00FFA3]" : "text-red-500"
										}`}
									>
										<Activity
											className={`w-4 h-4 ${connectedCount > 0 ? "animate-pulse" : ""}`}
										/>
										{connectedCount > 0
											? `${connectedCount} Connected`
											: "Disconnected"}
									</div>
								);
							})()}
						</div>

						<div className="pt-4 border-t border-white/5">
							<div className="flex items-center justify-between mb-3">
								<div className="flex items-center gap-2">
									<Ticket className="w-3 h-3 text-[#00FFA3]" />
									<p className="text-[10px] text-gray-500 uppercase tracking-widest">
										System Fuel
									</p>
								</div>
								<button
									onClick={() => {
										setIsMobileMenuOpen(false);
										router.push("/buyTickets");
									}}
									className="text-[10px] font-bold text-[#00FFA3] hover:underline"
								>
									Add More
								</button>
							</div>

							<div className="flex flex-col gap-1">
								<span className="text-sm font-bold text-white">
									<span className="text-[#00FFA3]">
										{(displaySeconds / 43200).toFixed(2)}
									</span>{" "}
									Tickets
								</span>
								<span className="text-[10px] text-gray-500 font-mono">
									Expires in: {formatTime(displaySeconds)}
								</span>
								<div className="w-full h-1.5 bg-white/10 rounded-full mt-2 overflow-hidden border border-white/5">
									<div
										className="bg-linear-to-r from-[#00FFA3] to-emerald-500 h-full shadow-[0_0_10px_rgba(0,255,163,0.5)] transition-all duration-1000 ease-linear"
										style={{
											width: `${((displaySeconds % 43200) / 43200) * 100}%`,
										}}
									></div>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Drawer Footer */}
				<div className="p-4 border-t border-white/5">
					{user ? (
						<button
							onClick={() => {
								setIsMobileMenuOpen(false);
								setIsLogoutModalOpen(true);
							}}
							className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-red-400/10 hover:text-red-300 rounded-lg transition-all active:scale-95"
						>
							<LogOut className="w-4 h-4" />
							Log Out
						</button>
					) : (
						<button
							onClick={() => {
								setIsMobileMenuOpen(false);
								setOpenModal(true);
							}}
							className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white bg-[#00FFA3]/10 hover:bg-[#00FFA3] hover:text-black hover:shadow-[0_0_20px_rgba(0,255,163,0.4)] rounded-lg transition-all active:scale-95 active:shadow-[0_0_25px_rgba(0,255,163,0.6)] cursor-pointer"
						>
							<LogIn className="w-4 h-4" />
							Log In
						</button>
					)}
				</div>
			</div>

			<AuthModal
				open={openModal}
				setOpen={setOpenModal}
				mode={authMode}
				setMode={setAuthMode}
			/>

			<LogoutConfirmModal
				open={isLogoutModalOpen}
				onClose={() => setIsLogoutModalOpen(false)}
				onConfirm={handleLogout}
				loading={isLoggingOut}
			/>
		</>
	);
}
