import React from "react";
import { ConfigProvider } from "antd";

const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
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
