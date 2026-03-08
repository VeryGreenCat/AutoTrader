"use client";

import { Spin } from "antd";

const loading = () => {
	return (
		<div className="flex justify-center items-center min-h-screen">
			<div className="text-center">
				<Spin size="large" />
				<p className="text-gray-600 mt-4 text-lg font-medium">Loading...</p>
			</div>
		</div>
	);
};

export default loading;
