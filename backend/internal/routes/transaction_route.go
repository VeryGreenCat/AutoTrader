package routes

import (
	"github.com/VeryGreenCat/AutoTrader/backend/internal/handlers"
	"github.com/gofiber/fiber/v2"
)

func TransactionRoute(router fiber.Router) {
	transactionGroup := router.Group("/transaction")

	transactionGroup.Get("/acc_pnl", handlers.DisplayAcc_PnL)
}
