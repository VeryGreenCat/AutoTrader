package services

// data flow MT5
// This layer interacts with the Database to save/retrieve MT5 account links.

import (
	"github.com/VeryGreenCat/AutoTrader/backend/internal/config"
	"github.com/VeryGreenCat/AutoTrader/backend/internal/models"
)

func RegisterMT5Account(account *models.MT5) error {
	// Create the record in our database
	if err := config.DB.Create(account).Error; err != nil {
		return err
	}
	return nil
}

func GetAccountsById(userId string) ([]models.MT5, error) {
    var accounts []models.MT5
    if err := config.DB.Where("user_id = ?", userId).Find(&accounts).Error; err != nil {
        return nil, err
    }

    return accounts, nil
}

func GetAccountByMT5Id(mt5Id string) (*models.MT5, error) {
	var account models.MT5
	if err := config.DB.Where("mt5_id = ?", mt5Id).First(&account).Error; err != nil {
		return nil, err
	}
	return &account, nil
}


func DeleteAccount(mt5Id string) error {
    if err := config.DB.Where("mt5_id = ?", mt5Id).Delete(&models.MT5{}).Error; err != nil {
        return err
    }
    return nil
}