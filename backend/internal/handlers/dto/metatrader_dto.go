package dto

import "time"

type MT5ConnectRequest struct {
	MT5ID string `json:"mt5_id"`
	Token string `json:"token"`
}

type MT5PushRequest struct {
	MT5ID         string  `json:"mt5_id"`
	Token         string  `json:"token"`
	Balance       float64 `json:"balance"`
	Equity        float64 `json:"equity"`
	RealizedToday float64 `json:"realized_today"`
}

type MT5Stats struct {
	MT5ID         string    `json:"mt5_id"`
	Balance       float64   `json:"balance"`
	Equity        float64   `json:"equity"`
	RealizedToday float64   `json:"realized_today"`
	LastSeen      time.Time `json:"last_seen"`
}

