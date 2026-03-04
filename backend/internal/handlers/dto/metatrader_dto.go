package dto

import "time"

type OpenPositionDTO struct {
	Pair    string  `json:"pair"`
	Type    string  `json:"type"`
	Entry   float64 `json:"entry"`
	Current float64 `json:"current"`
	Lot     float64 `json:"lot"`
	Profit  float64 `json:"profit"`
}

type ClosedPositionDTO struct {
	Pair    string  `json:"pair"`
	Type    string  `json:"type"`
	Entry   float64 `json:"entry"`
	Lot     float64 `json:"lot"`
	Profit  float64 `json:"profit"`
}

type MT5ConnectRequest struct {
	MT5ID string `json:"mt5_id"`
	Token string `json:"token"`
}

type MT5PushRequest struct {
	MT5ID         string  `json:"mt5_id"`
	Token         string  `json:"token"`
	Balance       float64 `json:"balance"`
	Equity        float64 `json:"equity"`
	RealizedToday   float64             `json:"realized_today"`
	RealizedWeek    float64             `json:"realized_week"`
	OpenPositions   []OpenPositionDTO   `json:"open_positions"`
	ClosedPositions []ClosedPositionDTO `json:"closed_positions"`
}

type MT5Stats struct {
	MT5ID         string    `json:"mt5_id"`
	Balance       float64   `json:"balance"`
	Equity        float64   `json:"equity"`
	RealizedToday float64   `json:"realized_today"`
	RealizedWeek    float64             `json:"realized_week"`
	LastSeen        time.Time           `json:"last_seen"`
	OpenPositions   []OpenPositionDTO   `json:"open_positions"`
	ClosedPositions []ClosedPositionDTO `json:"closed_positions"`
}


