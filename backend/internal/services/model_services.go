package services

import (
	"github.com/VeryGreenCat/AutoTrader/backend/internal/config"
	"github.com/VeryGreenCat/AutoTrader/backend/internal/models"
)

func GetAvailableModels() ([]models.Model, error) {
	var models []models.Model
	if err := config.DB.Find(&models).Error; err != nil {
		return nil, err
	}
	return models, nil
}