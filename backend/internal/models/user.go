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
    StripeCustomerID string     `json:"stripe_customer_id" gorm:"column:stripe_customer_id"`
}
func (User) TableName() string {
    return "User"
}
