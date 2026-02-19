package models

import "time"

type User struct {
    UserID           string     `json:"user_id" gorm:"primaryKey;column:user_id"`
    Email            string     `json:"email" gorm:"column:email;unique"`
    AuthProvider     string     `json:"auth_provider" gorm:"column:auth_provider"`
    Role             string     `json:"role" gorm:"column:role"`
    BotStartedAt     *time.Time `json:"bot_started_at" gorm:"column:bot_started_at"`
    RemainingSeconds int64      `json:"remaining_seconds" gorm:"column:remaining_seconds"`
    CreatedAt        time.Time  `json:"created_at" gorm:"column:created_at"`
    LastSignIn       *time.Time `json:"last_sign_in" gorm:"column:last_sign_in"`
}
func (User) TableName() string {
    return "User"
}

// type Banking struct {
// 	BankID  string `gorm:"type:uuid;default:uuid_generate_v4();primaryKey" json:"bank_id"`
// 	UserID  string `gorm:"type:uuid;not null" json:"user_id"`
// 	CardNo  string `json:"card_no"`
// 	Expired string `json:"expired"`
// 	CVC     string `json:"cvc"`
// 	Country string `json:"country"`
// }

// func (Banking) TableName() string { return "Banking" }

// type Billing struct {
// 	BillID  string    `gorm:"type:uuid;default:uuid_generate_v4();primaryKey" json:"bill_id"`
// 	UserID  string    `gorm:"type:uuid;not null" json:"user_id"`
// 	Amount  float64   `json:"amount"`
// 	Created time.Time `gorm:"default:now()" json:"created"`
// 	Status  string    `gorm:"type:billing_status_enum;default:pending" json:"status"`
// }

// func (Billing) TableName() string { return "Billing" }

// type Transaction struct {
// 	BalanceID string    `gorm:"type:uuid;default:uuid_generate_v4();primaryKey" json:"balance_id"`
// 	MT5ID     string    `gorm:"type:uuid;not null" json:"mt5_id"`
// 	Created   time.Time `gorm:"default:now()" json:"created"`
// 	Amount    float64   `json:"amount"`
// 	Method    string    `gorm:"type:transaction_method_enum" json:"method"`
// }

// func (Transaction) TableName() string { return "Transaction" }

// type Bot struct {
// 	BotID       string     `gorm:"type:uuid;default:uuid_generate_v4();primaryKey" json:"bot_id"`
// 	MT5ID       string     `gorm:"type:uuid;not null" json:"mt5_id"`
// 	Name        *string    `json:"name,omitempty"`
// 	Status      *string    `json:"status,omitempty"`
// 	TotalOnline *time.Time `json:"total_online,omitempty"`

// 	Online *Online `gorm:"constraint:OnDelete:CASCADE" json:"online,omitempty"`
// 	Model  *Model  `gorm:"constraint:OnDelete:CASCADE" json:"model,omitempty"`
// }

// func (Bot) TableName() string { return "Bot" }

// type Online struct {
// 	OnlineID  string     `gorm:"type:uuid;default:uuid_generate_v4();primaryKey" json:"online_id"`
// 	BotID     string     `gorm:"unique;not null" json:"bot_id"`
// 	TurnedOn  time.Time  `gorm:"default:now()" json:"turned_on"`
// 	TurnedOff *time.Time `json:"turned_off,omitempty"`
// }

// func (Online) TableName() string { return "Online" }

// type Model struct {
// 	ModelID     string    `gorm:"type:uuid;default:uuid_generate_v4();primaryKey" json:"model_id"`
// 	BotID       string    `gorm:"unique;not null" json:"bot_id"`
// 	Name        *string   `json:"name,omitempty"`
// 	Description *string   `json:"description,omitempty"`
// 	Version     *string   `json:"version,omitempty"`
// 	Currency    *string   `gorm:"type:model_currency_enum" json:"currency,omitempty"`
// 	Created     time.Time `gorm:"default:now()" json:"created"`

// 	LLMTrans *LLMTrans `gorm:"constraint:OnDelete:CASCADE" json:"llm_trans,omitempty"`
// }

// func (Model) TableName() string { return "Model" }

// type LLMTrans struct {
// 	LLMID   string    `gorm:"type:uuid;default:uuid_generate_v4();primaryKey" json:"llm_id"`
// 	ModelID string    `gorm:"unique;not null" json:"model_id"`
// 	Created time.Time `gorm:"default:now()" json:"created"`
// 	Logic   *string   `json:"logic,omitempty"`
// }

// func (LLMTrans) TableName() string { return "LLM_trans" }
