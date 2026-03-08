package models

import (
	"time"
)

type LLMTrans struct {
    LLMID          string     `json:"llm_id" gorm:"primaryKey;column:llm_id"`
    Created        time.Time  `json:"created" gorm:"column:created"`
    Logic          string     `json:"logic" gorm:"column:logic"`
    Currency       string     `json:"currency" gorm:"column:currency"`
    BiasScore      float64   `json:"bias_score" gorm:"column:bias_score"`
    Confidence     float64   `json:"confidence" gorm:"column:confidence"`
    Volatility     float64   `json:"volatility" gorm:"column:volatility"`
    TrendStrength  float64   `json:"trend_strength" gorm:"column:trend_strength"`
    Momentum       float64   `json:"momentum" gorm:"column:momentum"`
    SkipFlag       float64   `json:"skip_flag" gorm:"column:skip_flag"`
}

func (LLMTrans) TableName() string {
    return "LLM_trans"
}