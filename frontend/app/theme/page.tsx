import React from "react";
import { ConfigProvider } from "antd";

const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
	const primaryColor = "#000000";
	return (
		<div>
			<ConfigProvider
				theme={{
					token: {},
					components: {
						Modal: {
							contentBg: "transparent",
						},
					},
				}}
			>
				{children}
			</ConfigProvider>
		</div>
	);
};

export default ThemeProvider;
