package dto

type BotSignalRequest struct {
	Currency string `json:"currency" validate:"required"`
	Version  string `json:"version" validate:"required"`
	Action   string `json:"action" validate:"required,oneof=BUY SELL HOLD"`
}
