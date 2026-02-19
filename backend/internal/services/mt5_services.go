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
