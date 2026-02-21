import { ConfigProvider, App, theme } from "antd";

const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
	return (
		<ConfigProvider
			theme={{
				algorithm: theme.darkAlgorithm,
				token: {
					colorPrimary: "#00FFA3",
					colorBgBase: "#0b0e11",
					colorTextBase: "#e0e0e0",
					borderRadius: 12,
					fontFamily: "inherit",
				},
				components: {
					Message: {
						contentBg: "#141414",
						colorText: "#e0e0e0",
					},
				},
			}}
		>
			<App>{children}</App>
		</ConfigProvider>
	);
};

export default ThemeProvider;
