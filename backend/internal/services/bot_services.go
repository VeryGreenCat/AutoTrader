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

func GetBotsByMt5Id(mt5Id string) ([]dto.BotResponse, error) {
	bots := []dto.BotResponse{}
	
	err := config.DB.Table("Bot").
		Select("\"Bot\".*, \"Model\".name as name, \"Model\".currency as currency").
		Joins("left join \"Model\" on \"Bot\".model_id = \"Model\".model_id").
		Where("\"Bot\".mt5_id = ?", mt5Id).
		Scan(&bots).Error

	if err != nil {
		return nil, err
	}
	return bots, nil
}

func DeleteBot(botId string) error {
	if err := config.DB.Where("bot_id = ?", botId).Delete(&models.Bot{}).Error; err != nil {
		return err
	}
	return nil
}

func UpdateBotStatus(botId string, status bool) error {
	if err := config.DB.Model(&models.Bot{}).Where("bot_id = ?", botId).Update("status", status).Error; err != nil {
		return err
	}
	return nil
}