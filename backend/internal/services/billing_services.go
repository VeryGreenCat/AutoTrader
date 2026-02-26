package services

import (
	"github.com/VeryGreenCat/AutoTrader/backend/internal/config"
	"github.com/VeryGreenCat/AutoTrader/backend/internal/models"
)

func GetBillById(userId string) ([]models.Billing, error) {
	bills := []models.Billing{}
	if err := config.DB.Table("Billing").Where("user_id = ?", userId).Find(&bills).Error; err != nil {
		return bills, err
	}
	return bills, nil		
}

func GetUnpaidBills(userId string) (*models.Billing, error) {
	bill := models.Billing{}

	// Priority 1: oldest overdue
	result := config.DB.
		Where("user_id = ? AND status = ?", userId, "overdue").
		Order("due_date ASC").
		Limit(1).
		Find(&bill)

	if result.Error != nil {
		return nil, result.Error
	}
	if result.RowsAffected > 0 {
		return &bill, nil
	}

	// Priority 2: oldest unpaid
	result = config.DB.
		Where("user_id = ? AND status = ?", userId, "unpaid").
		Order("due_date ASC").
		Limit(1).
		Find(&bill)

	if result.Error != nil {
		return nil, result.Error
	}
	if result.RowsAffected > 0 {
		return &bill, nil
	}

	return nil, nil
}


