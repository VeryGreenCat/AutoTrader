import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Navbar from "./components/navbar";
import AuthProvider from "./auth/components/AuthProvider";
import ThemeProvider from "./theme/page";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	title: "AuraAI - Trading Intelligence",
	description: "Advanced AI Trading Bot Platform",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body className={`${inter.className} bg-black text-white min-h-screen`}>
				<ThemeProvider>
					<AuthProvider>
						<Navbar />
						<main className="pt-24 px-4 md:px-8 max-w-7xl mx-auto">
							{children}
						</main>
					</AuthProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
