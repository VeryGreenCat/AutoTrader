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
} from "lucide-react";
import { useEffect, useState } from "react";
import { Dropdown, MenuProps } from "antd";
import { supabase } from "@/lib/supabase";
import { AuthMode } from "@/types/auth";
import AuthModal from "../auth/components/AuthModal";

export default function Navbar() {
	const pathname = usePathname();
	const router = useRouter();
	const [user, setUser] = useState<any>(null);
	const [openModal, setOpenModal] = useState(false);
	const [authMode, setAuthMode] = useState<AuthMode>("signin");

	// 1. Check User Session on Mount
	useEffect(() => {
		const getUser = async () => {
			const {
				data: { session },
			} = await supabase.auth.getSession();
			setUser(session?.user ?? null);
		};
		getUser();

		// Optional: Listen for auth changes (login/logout) to update UI instantly
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			setUser(session?.user ?? null);
		});

		return () => subscription.unsubscribe();
	}, []);

	// 2. Logout Function
	const handleLogout = async () => {
		await supabase.auth.signOut();
		router.push("/");
		sessionStorage.removeItem("otp_verified");
	};

	const isActive = (path: string) => pathname === path;

	const getLinkClass = (path: string) => {
		const base =
			"pb-1 transition-colors hover:text-white cursor-pointer flex items-center gap-1";
		return isActive(path)
			? `${base} text-white border-b-2 border-[#00FFA3]`
			: `${base} text-gray-400`;
	};

	// Mock Data for Accounts
	const mockAccounts = [
		{ id: "acc_1", name: "Main Trading Account", balance: "$12,450.00" },
		{ id: "acc_2", name: "Prop Firm Challenge", balance: "$50,000.00" },
		{ id: "acc_3", name: "Scalping Bot Acc", balance: "$3,210.50" },
	];

	const accountMenuItems: MenuProps["items"] = mockAccounts.map((acc) => ({
		key: acc.id,
		label: (
			<div
				className="flex items-center py-1"
				onClick={() => router.push(`/dashboard/${acc.id}`)}
			>
				<span className="font-medium text-white">{acc.name}</span>
			</div>
		),
	}));

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
							placement="bottomLeft"
							classNames={{ root: "account-dropdown" }}
						>
							<button
								onClick={() => router.push("/dashboard")}
								className={getLinkClass("/dashboard")}
							>
								Dashboard
								<ChevronDown className="w-3 h-3 opacity-50" />
							</button>
						</Dropdown>
					) : (
						<button
							onClick={() => router.push("/dashboard")}
							className={getLinkClass("/dashboard")}
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
					<div className="hidden lg:flex items-center gap-4 px-6 border-r border-white/10">
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
										<span className="text-[#00FFA3]">4.5</span> Tickets
									</span>
									<div className="w-24 h-1 bg-white/10 rounded-full mt-1 overflow-hidden border border-white/5">
										<div className="bg-linear-to-r from-[#00FFA3] to-emerald-500 h-full w-[45%] shadow-[0_0_10px_rgba(0,255,163,0.5)]"></div>
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
						<div className="text-xs flex items-center gap-1 justify-end font-bold text-[#00FFA3]">
							<Activity className="w-3 h-3 animate-pulse" />
							Connected
						</div>
					</div>

					{/* PROFILE DROPDOWN AREA */}
					<div className="relative group">
						{/* Avatar Trigger */}
						<div className="w-10 h-10 rounded-full bg-linear-to-tr from-emerald-400 to-blue-500 border-2 border-white/10 cursor-pointer hover:scale-105 transition shadow-[0_0_15px_rgba(0,255,163,0.2)]"></div>

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
