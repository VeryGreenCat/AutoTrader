package dto

import "time"

type DisplayAcc_PnLRequest struct {
	UserID      string    `json:"user_id" query:"user_id"`
	StartPeriod time.Time `json:"start_period" query:"start_period"`
	EndPeriod   time.Time `json:"end_period" query:"end_period"`
}
 
type DisplayAcc_PnLResponse struct {
	MT5ID   string  `json:"mt5_id" gorm:"column:mt5_id"`
	MT5Name string  `json:"mt5_name" gorm:"column:mt5_name"`
	PnL     float64 `json:"pnl" gorm:"column:pnl"`
}