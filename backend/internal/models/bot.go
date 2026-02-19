package models

type Bot struct {
	BotID  string `json:"bot_id" gorm:"primaryKey;column:bot_id"`
	MT5ID  string `json:"mt5_id" gorm:"column:mt5_id"`
	Name   string `json:"name" gorm:"column:name"`
	Status bool   `json:"status" gorm:"column:status"`
}

func (Bot) TableName() string {
	return "Bot"
}