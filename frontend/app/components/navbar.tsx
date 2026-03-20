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

export default function Navbar() {
	const pathname = usePathname();
	const router = useRouter();
	const [user, setUser] = useState<any>(null);
	const [openModal, setOpenModal] = useState(false);
	const [authMode, setAuthMode] = useState<AuthMode>("signin");
	const [accounts, setAccounts] = useState<MT5[]>([]);

	const [profile, setProfile] = useState<UserProfile | null>(null);
	const [displaySeconds, setDisplaySeconds] = useState<number>(0);

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
		await supabase.auth.signOut();
		router.push("/");
		sessionStorage.removeItem("otp_verified");
		localStorage.removeItem("user_id");
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
								if (hasConnectedAccount) {
									router.push("/dashboard");
								}
							}}
							className={`${getLinkClass("/dashboard")} ${!hasConnectedAccount ? "opacity-30 cursor-not-allowed grayscale" : ""}`}
							disabled={!hasConnectedAccount}
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
					<div className="relative group">
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
											onClick={() => router.push("/profile")}
											className="flex items-center gap-2 px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-[#00FFA3] transition-colors text-left cursor-pointer"
										>
											<User className="w-4 h-4" />
											Profile
										</button>
										<button
											onClick={() => {
												if (pathname === "/bots") {
													window.dispatchEvent(new CustomEvent("START_PAGE_TOUR"));
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
											onClick={handleLogout}
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
											onClick={() => setOpenModal(true)}
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
				</div>
			</nav>

			<AuthModal
				open={openModal}
				setOpen={setOpenModal}
				mode={authMode}
				setMode={setAuthMode}
			/>
		</>
	);
}
