package models

import (
	"time"
)

type LLMTrans struct {
	LLMID    string    `json:"llm_id" gorm:"primaryKey;column:llm_id"`
	Created  time.Time `json:"created" gorm:"column:created"`
	Logic    string    `json:"logic" gorm:"column:logic"`
	Currency string    `json:"currency" gorm:"column:currency"`
}

func (LLMTrans) TableName() string {
	return "LLM_trans"
}
