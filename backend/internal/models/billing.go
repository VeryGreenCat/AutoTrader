package models

import (
	"time"
)

type Billing struct {
    BillID      string     `json:"bill_id" gorm:"type:uuid;default:gen_random_uuid();primaryKey;column:bill_id"`
    UserID      string     `json:"user_id" gorm:"column:user_id"`
    Amount      float64    `json:"amount" gorm:"column:amount"`
    CreatedAt   time.Time  `json:"created_at" gorm:"column:created_at"`
    Status      string     `json:"status" gorm:"column:status"`
    StartPeriod *time.Time  `json:"start_period" gorm:"column:start_period"`
    EndPeriod   *time.Time  `json:"end_period" gorm:"column:end_period"`
    PaymentID   string     `json:"payment_id" gorm:"column:payment_id"`
    PaidAt      *time.Time `json:"paid_at" gorm:"column:paid_at"`
    DueDate     *time.Time  `json:"due_date" gorm:"column:due_date"`
}

func (Billing) TableName() string {
    return "Billing"
}
