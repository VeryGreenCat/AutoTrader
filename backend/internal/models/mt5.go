package models

type MT5 struct {
	MT5ID    string  `json:"mt5_id" gorm:"primaryKey;column:mt5_id"`
	UserID   string  `json:"user_id" gorm:"column:user_id"`
	Name     string  `json:"name" gorm:"column:name"`
	Token    string  `json:"token" gorm:"column:token"`
	Status   bool    `json:"status" gorm:"column:status"`
	Balance  float64 `json:"balance" gorm:"column:balance"`
	Equity   float64 `json:"equity" gorm:"column:equity"`
	TodayPnL float64 `json:"today_pnl" gorm:"column:today_pnl"`
}

func (MT5) TableName() string {
	return "MT5"
}
