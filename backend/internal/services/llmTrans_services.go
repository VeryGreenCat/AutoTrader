package services

import (
	"github.com/VeryGreenCat/AutoTrader/backend/internal/config"
	"github.com/VeryGreenCat/AutoTrader/backend/internal/models"
)

func GetLLMTrans(currency string) ([]models.LLMTrans, error) {
	var trans []models.LLMTrans
	err := config.DB.Where("currency = ?", currency).Order("created desc").Find(&trans).Error
	if err != nil {
		return nil, err
	}
	return trans, nil
}

func SaveLLMTrans(trans *models.LLMTrans) error {
	return config.DB.Create(trans).Error
}
