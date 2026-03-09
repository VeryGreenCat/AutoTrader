package dto

type BotSignalRequest struct {
	Currency string `json:"currency" validate:"required"`
	Version  string `json:"version" validate:"required"`
	Action   string `json:"action" validate:"required"`
	MT5ID    string `json:"mt5_id"` // Optional: If provided, only this account gets the signal
}
