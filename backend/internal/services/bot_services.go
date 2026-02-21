package services

import (
	"github.com/VeryGreenCat/AutoTrader/backend/internal/config"
	"github.com/VeryGreenCat/AutoTrader/backend/internal/handlers/dto"
	"github.com/VeryGreenCat/AutoTrader/backend/internal/models"
	"github.com/google/uuid"
)

func DeployBot(req *dto.DeployBotRequest) error {
	bot := models.Bot{
		BotID:   uuid.New().String(),
		MT5ID:   req.MT5ID,
		ModelID: req.ModelID,
		Status:  false,
	}

	if err := config.DB.Create(&bot).Error; err != nil {
		return err
	}
	return nil
}

func GetBotsByMt5Id(mt5Id string) ([]models.Bot, error) {
	var bots []models.Bot
	if err := config.DB.Where("mt5_id = ?", mt5Id).Find(&bots).Error; err != nil {
		return nil, err
	}
	return bots, nil
}