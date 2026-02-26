package services

import (
	"github.com/VeryGreenCat/AutoTrader/backend/internal/config"
	"github.com/VeryGreenCat/AutoTrader/backend/internal/handlers/dto"
	"github.com/VeryGreenCat/AutoTrader/backend/internal/models"
)

func DisplayAcc_PnL(req *dto.DisplayAcc_PnLRequest) ([]dto.DisplayAcc_PnLResponse, error) {
	var res []dto.DisplayAcc_PnLResponse

	err := config.DB.Model(&models.Transaction{}). // correct way to use model struct from Model
		Select(`"Transaction".mt5_id, "MT5".name as mt5_name, SUM("Transaction".pnl) as pnl`).
		Joins(`JOIN "MT5" ON "MT5".mt5_id = "Transaction".mt5_id`).
		Where(`"Transaction".user_id = ? AND "Transaction".created BETWEEN ? AND ?`, req.UserID, req.StartPeriod, req.EndPeriod).
		Group(`"Transaction".mt5_id, "MT5".name`).
		Scan(&res).Error

	if err != nil {
		return nil, err
	}

	return res, nil
}

