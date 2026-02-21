package models

type Bot struct {
	BotID   string `json:"bot_id" gorm:"primaryKey;column:bot_id"`
	MT5ID   string `json:"mt5_id" gorm:"column:mt5_id"`
	Status  bool   `json:"status" gorm:"column:status"`
	ModelID string `json:"model_id" gorm:"column:model_id"`
}

func (Bot) TableName() string {
	return "Bot"
}