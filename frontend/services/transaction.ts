import api from "./api";
import { Acc_PnL_request } from "../types/transaction";

export const DisplayAcc_PnL = async (data: Acc_PnL_request) => {
	const res = await api.get(`/transaction/acc_pnl`, {
		params: data,
	});
	return res.data;
};
