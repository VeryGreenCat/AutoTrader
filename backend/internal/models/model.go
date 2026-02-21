package models

import "time"

type Model struct {
	ModelID     string    `json:"model_id" gorm:"primaryKey;column:model_id"`
	Name        string    `json:"name" gorm:"column:name"`
	Description string    `json:"description" gorm:"column:description"`
	Version     string    `json:"version" gorm:"column:version"`
	Currency    string    `json:"currency" gorm:"column:currency"`
	Created     time.Time `json:"created" gorm:"column:created"`
}

func (Model) TableName() string {
	return "Model"
}