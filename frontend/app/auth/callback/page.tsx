"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

import { Skeleton, ConfigProvider, theme } from "antd";

export default function AuthCallback() {
	const router = useRouter();

	useEffect(() => {
		const checkSession = async () => {
			const {
				data: { session },
			} = await supabase.auth.getSession();

			if (!session) {
				router.push("/");
			}
		};

		checkSession();
	}, [router]);

	return (
		<ConfigProvider
			theme={{
				algorithm: theme.darkAlgorithm,
			}}
		>
			<div className="max-w-7xl mx-auto px-4 md:px-8 pt-10 animate-in fade-in duration-700">
				{/* Header Skeleton (Matches Bots Page) */}
				<div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
					<div className="space-y-2">
						<Skeleton.Button active size="large" style={{ width: 250 }} />
						<Skeleton.Input active size="small" style={{ width: 350 }} />
					</div>
					<div className="flex flex-col items-end gap-1">
						<Skeleton.Input active size="small" style={{ width: 150 }} />
						<Skeleton.Input active size="small" style={{ width: 200 }} />
					</div>
				</div>

				{/* Bot Account Cards (Vertical Stack) */}
				<div className="space-y-8">
					{[1, 2].map((i) => (
						<div
							key={i}
							className="bg-[#0b1117] border border-[#1e293b] rounded-2xl p-8"
						>
							<div className="flex justify-between items-start mb-6">
								<Skeleton active avatar paragraph={{ rows: 2 }} />
							</div>
							<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
								{[1, 2, 3, 4].map((j) => (
									<Skeleton.Button
										key={j}
										active
										block
										style={{ height: 60 }}
									/>
								))}
							</div>
						</div>
					))}

					{/* Add Account Card Skeleton */}
					<div className="bg-[#0b1117]/50 border border-[#1e293b] border-dashed rounded-2xl p-12 flex flex-col items-center gap-3">
						<Skeleton.Avatar active size="large" />
						<Skeleton.Input active size="small" />
					</div>
				</div>
			</div>
		</ConfigProvider>
	);
}
