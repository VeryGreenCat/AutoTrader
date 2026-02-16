// tailwind.config.js
module.exports = {
	content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			colors: {
				primary: "var(--color-primary)",
				background: "var(--color-background)",
				backgroundSecondary: "var(--color-background-secondary)",
				text: "var(--color-text)",
				textSecondary: "var(--color-text-secondary)",
			},
		},
	},
	plugins: [],
};
