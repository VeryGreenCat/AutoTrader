package models

import "time"

type Transaction struct {
    TransactionID string     `json:"transaction_id" gorm:"primaryKey;column:transaction_id"`
    MT5ID         string     `json:"mt5_id" gorm:"column:mt5_id"`
    Created       *time.Time `json:"created" gorm:"column:created"`
    PNL           float64    `json:"pnl" gorm:"column:pnl"`
    BotID         string     `json:"bot_id" gorm:"column:bot_id"`
    TradeType     *string    `json:"trade_type" gorm:"column:trade_type"`
    UserID        string     `json:"user_id" gorm:"column:user_id"`
}

func (Transaction) TableName() string {
    return "Transaction"
}