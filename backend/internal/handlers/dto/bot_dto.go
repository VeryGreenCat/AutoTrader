package dto

type DeployBotRequest struct {
	MT5ID   string `json:"mt5_id"`
	ModelID string `json:"model_id"`
}

type BotResponse struct {
	BotID    string `json:"bot_id"`
	MT5ID    string `json:"mt5_id"`
	Status   bool   `json:"status"`
	ModelID  string `json:"model_id"`
	Name     string `json:"name"`
	Currency string `json:"currency"`
}