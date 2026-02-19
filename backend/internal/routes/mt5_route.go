package routes

import (
	"github.com/VeryGreenCat/AutoTrader/backend/internal/handlers"
	"github.com/gofiber/fiber/v2"
)

func MT5Routes(router fiber.Router) {
	MT5Routes := router.Group("/mt5")

	MT5Routes.Post("/accounts", handlers.AddMT5Account)
	MT5Routes.Get("/accounts/:user_id", handlers.GetAccountById)
}