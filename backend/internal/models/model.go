package models

import "time"

type User struct {
	UserID       string     `gorm:"type:uuid;default:uuid_generate_v4();primaryKey" json:"user_id"`
	Email        string     `gorm:"unique;not null" json:"email"`
	AuthProvider *string    `json:"auth_provider,omitempty"`
	Role         string     `gorm:"type:user_role_enum;default:user" json:"role"`
	BotUsage     *time.Time `json:"bot_usage,omitempty"`
	Tickets      float64    `gorm:"default:0" json:"tickets"`
	CreatedAt    *time.Time `json:"created_at,omitempty"`
	LastSignIn   *time.Time `json:"last_sign_in,omitempty"`

	Bankings []Banking `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"bankings,omitempty"`
	Billings []Billing `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"billings,omitempty"`
	MT5s     []MT5     `gorm:"foreignKey:UserID;constraint:OnDelete:CASCADE" json:"mt5_accounts,omitempty"`
}

func (User) TableName() string { return "User" }

type Banking struct {
	BankID  string `gorm:"type:uuid;default:uuid_generate_v4();primaryKey" json:"bank_id"`
	UserID  string `gorm:"type:uuid;not null" json:"user_id"`
	CardNo  string `json:"card_no"`
	Expired string `json:"expired"`
	CVC     string `json:"cvc"`
	Country string `json:"country"`
}

func (Banking) TableName() string { return "Banking" }

type Billing struct {
	BillID  string    `gorm:"type:uuid;default:uuid_generate_v4();primaryKey" json:"bill_id"`
	UserID  string    `gorm:"type:uuid;not null" json:"user_id"`
	Amount  float64   `json:"amount"`
	Created time.Time `gorm:"default:now()" json:"created"`
	Status  string    `gorm:"type:billing_status_enum;default:pending" json:"status"`
}

func (Billing) TableName() string { return "Billing" }

type MT5 struct {
	MT5ID   string  `gorm:"type:uuid;default:uuid_generate_v4();primaryKey" json:"mt5_id"`
	UserID  string  `gorm:"type:uuid;not null" json:"user_id"`
	Name    *string `json:"name,omitempty"`
	Token   string  `json:"token"`
	Status  bool    `gorm:"default:true" json:"status"`
	Balance float64 `gorm:"default:0.0" json:"balance"`

	Transactions []Transaction `gorm:"foreignKey:MT5ID;constraint:OnDelete:CASCADE" json:"transactions,omitempty"`
	Bots         []Bot         `gorm:"foreignKey:MT5ID;constraint:OnDelete:CASCADE" json:"bots,omitempty"`
}

func (MT5) TableName() string { return "MT5" }

type Transaction struct {
	BalanceID string    `gorm:"type:uuid;default:uuid_generate_v4();primaryKey" json:"balance_id"`
	MT5ID     string    `gorm:"type:uuid;not null" json:"mt5_id"`
	Created   time.Time `gorm:"default:now()" json:"created"`
	Amount    float64   `json:"amount"`
	Method    string    `gorm:"type:transaction_method_enum" json:"method"`
}

func (Transaction) TableName() string { return "Transaction" }

type Bot struct {
	BotID       string     `gorm:"type:uuid;default:uuid_generate_v4();primaryKey" json:"bot_id"`
	MT5ID       string     `gorm:"type:uuid;not null" json:"mt5_id"`
	Name        *string    `json:"name,omitempty"`
	Status      *string    `json:"status,omitempty"`
	TotalOnline *time.Time `json:"total_online,omitempty"`

	Online *Online `gorm:"constraint:OnDelete:CASCADE" json:"online,omitempty"`
	Model  *Model  `gorm:"constraint:OnDelete:CASCADE" json:"model,omitempty"`
}

func (Bot) TableName() string { return "Bot" }

type Online struct {
	OnlineID  string     `gorm:"type:uuid;default:uuid_generate_v4();primaryKey" json:"online_id"`
	BotID     string     `gorm:"unique;not null" json:"bot_id"`
	TurnedOn  time.Time  `gorm:"default:now()" json:"turned_on"`
	TurnedOff *time.Time `json:"turned_off,omitempty"`
}

func (Online) TableName() string { return "Online" }

type Model struct {
	ModelID     string    `gorm:"type:uuid;default:uuid_generate_v4();primaryKey" json:"model_id"`
	BotID       string    `gorm:"unique;not null" json:"bot_id"`
	Name        *string   `json:"name,omitempty"`
	Description *string   `json:"description,omitempty"`
	Version     *string   `json:"version,omitempty"`
	Currency    *string   `gorm:"type:model_currency_enum" json:"currency,omitempty"`
	Created     time.Time `gorm:"default:now()" json:"created"`

	LLMTrans *LLMTrans `gorm:"constraint:OnDelete:CASCADE" json:"llm_trans,omitempty"`
}

func (Model) TableName() string { return "Model" }

type LLMTrans struct {
	LLMID   string    `gorm:"type:uuid;default:uuid_generate_v4();primaryKey" json:"llm_id"`
	ModelID string    `gorm:"unique;not null" json:"model_id"`
	Created time.Time `gorm:"default:now()" json:"created"`
	Logic   *string   `json:"logic,omitempty"`
}

func (LLMTrans) TableName() string { return "LLM_trans" }

// {
//   "user_id": "uuid",
//   "email": "user@email.com",
//   "role": "user",
//   "tickets": 10,
//   "mt5_accounts": [
//     {
//       "mt5_id": "uuid",
//       "balance": 1000,
//       "bots": [
//         {
//           "bot_id": "uuid",
//           "model": {
//             "model_id": "uuid",
//             "currency": "USD",
//             "llm_trans": {
//               "llm_id": "uuid",
//               "logic": "trend-following logic"
//             }
//           }
//         }
//       ]
//     }
//   ]
// }
