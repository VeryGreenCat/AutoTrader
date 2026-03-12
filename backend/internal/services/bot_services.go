package services

import (
	"errors"

	"github.com/VeryGreenCat/AutoTrader/backend/internal/config"
	"github.com/VeryGreenCat/AutoTrader/backend/internal/handlers/dto"
	"github.com/VeryGreenCat/AutoTrader/backend/internal/models"
	"github.com/google/uuid"
	"gorm.io/gorm"
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
	return config.DB.Transaction(func(tx *gorm.DB) error {

		userId, err := getUserIdByBotId(botId)
		if err != nil {
			return err
		}

		if status {
			var user models.User
			err := tx.Select("ban").Where("user_id = ?", userId).First(&user).Error
			if err != nil {
				return err
			}
			if user.Ban {
				return errors.New("user is banned")
			}
		}

		// update bot
		if err := tx.Model(&models.Bot{}).
			Where("bot_id = ?", botId).
			Update("status", status).Error; err != nil {
			return err
		}

		// count active bots
		var activeCount int64
		err = tx.Table(`"Bot"`).
			Joins(`JOIN "MT5" ON "Bot".mt5_id = "MT5".mt5_id`).
			Where(`"MT5".user_id = ? AND "Bot".status = true`, userId).
			Count(&activeCount).Error
		if err != nil {
			return err
		}

		// update user
		if activeCount == 1 && status {
			return tx.Model(&models.User{}).
				Where("user_id = ?", userId).
				Update("bot_started_at", gorm.Expr("NOW()")).Error
		}

		if activeCount == 0 && !status {
			return tx.Model(&models.User{}).
			Where("user_id = ? AND bot_started_at IS NOT NULL", userId).
			Updates(map[string]interface{}{
				"remaining_seconds": gorm.Expr(
					"remaining_seconds - EXTRACT(EPOCH FROM (NOW() - bot_started_at))",
				),
				"bot_started_at": nil,
			}).Error
		}

		return nil
	})
}


func getUserIdByBotId(botId string) (string, error) {
	var userId string

	err := config.DB.
		Table(`"Bot"`).
		Select(`"MT5".user_id`).
		Joins(`JOIN "MT5" ON "Bot".mt5_id = "MT5".mt5_id`).
		Where(`"Bot".bot_id = ?`, botId).
		Scan(&userId).Error

	if err != nil {
		return "", err
	}

	return userId, nil
}