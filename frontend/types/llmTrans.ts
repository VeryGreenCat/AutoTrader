export interface LLMTrans {
	llm_id: string;
	created: string;
	logic: string;
	currency: string;
	bias_score: number;
	confidence: number;
	volatility: number;
	trend_strength: number;
	momentum: number;
	skip_flag: number;
}
