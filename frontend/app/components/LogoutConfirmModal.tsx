"use client";

import { Modal } from "antd";
import { LogOut, X } from "lucide-react";

interface LogoutConfirmModalProps {
	open: boolean;
	onClose: () => void;
	onConfirm: () => void;
	loading?: boolean;
}

const LogoutConfirmModal = ({
	open,
	onClose,
	onConfirm,
	loading = false,
}: LogoutConfirmModalProps) => {
	return (
		<Modal
			open={open}
			onCancel={onClose}
			footer={null}
			centered
			closeIcon={null}
			className="logout-confirm-modal"
			width={400}
		>
			<div className="relative p-6 sm:p-8 bg-[#0f0f0f] border border-white/5 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden">
				{/* Ambient Glow */}
				<div className="absolute -top-24 -right-24 w-48 h-48 bg-red-500/10 rounded-full blur-3xl opacity-50"></div>
				<div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#00FFA3]/5 rounded-full blur-3xl opacity-30"></div>

				{/* Close Button */}
				<button
					onClick={onClose}
					className="absolute top-4 right-4 p-2 text-gray-500 hover:text-white transition-colors cursor-pointer"
				>
					<X className="w-4 h-4" />
				</button>

				<div className="relative text-center">
					{/* Icon */}
					<div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.1)]">
						<LogOut className="w-8 h-8 text-red-500" />
					</div>

					{/* Text */}
					<h3 className="text-xl font-bold text-white mb-2 tracking-tight">
						Confirm <span className="text-red-500">Log Out</span>
					</h3>
					<p className="text-gray-400 text-sm leading-relaxed mb-8">
						Are you sure you want to log out?
					</p>

					{/* Actions */}
					<div className="grid grid-cols-2 gap-3">
						<button
							onClick={onClose}
							className="px-4 py-3 text-sm font-semibold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-all active:scale-95 cursor-pointer"
						>
							Cancel
						</button>
						<button
							onClick={onConfirm}
							disabled={loading}
							className="px-4 py-3 text-sm font-bold text-black bg-red-500 hover:bg-red-400 rounded-xl shadow-[0_0_20px_rgba(239,68,68,0.3)] hover:shadow-[0_0_30px_rgba(239,68,68,0.5)] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
						>
							{loading ? "Logging out..." : "Log Out"}
						</button>
					</div>
				</div>
			</div>
		</Modal>
	);
};

export default LogoutConfirmModal;
