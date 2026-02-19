package models

type MT5 struct {
	MT5ID   string  `json:"mt5_id" gorm:"primaryKey;column:mt5_id"`
	UserID  string  `json:"user_id" gorm:"column:user_id"`
	Name    string  `json:"name" gorm:"column:name"`
	Token   string  `json:"token" gorm:"column:token"`
	Status  bool    `json:"status" gorm:"column:status"`
	Balance float64 `json:"balance" gorm:"column:balance"`
}

func (MT5) TableName() string {
	return "MT5"
}

// type MT5AccountData struct {
//     Token      string      `json:"token"`
//     MT5Login   int64       `json:"mt5_login"`
//     Balance    float64     `json:"balance"`
//     Equity     float64     `json:"equity"`
//     FreeMargin float64     `json:"free_margin"`
//     Profit     float64     `json:"profit"`
//     Positions  []MT5Position `json:"positions"`
//     UpdatedAt  time.Time   `json:"updated_at"`
// }

// type MT5Position struct {
//     Ticket       uint64  `json:"ticket"`
//     Symbol       string  `json:"symbol"`
//     Type         int     `json:"type"` // 0=buy, 1=sell
//     Volume       float64 `json:"volume"`
//     OpenPrice    float64 `json:"open_price"`
//     CurrentPrice float64 `json:"current_price"`
//     Profit       float64 `json:"profit"`
//     OpenTime     int64   `json:"open_time"`
// }

// // MT5Account Represents the linked MT5 account in our GORM database
// type MT5Account struct {
//     MT5ID    string `gorm:"primaryKey;column:mt5_id" json:"mt5_id"`
//     UserID   string `gorm:"column:user_id" json:"user_id"`
//     AccName  string `gorm:"column:acc_name" json:"acc_name"`
//     Token    string `gorm:"unique;column:token" json:"token"`
//     Status   bool   `gorm:"column:status;default:true" json:"status"`
// }