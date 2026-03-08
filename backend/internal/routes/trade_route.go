package routes

import (
	"github.com/VeryGreenCat/AutoTrader/backend/internal/handlers"
	"github.com/gofiber/fiber/v2"
)

func TradeRoutes(router fiber.Router) {
	tradeGroup := router.Group("/trade")
	
	// Called by Python ML Bot to deliver trading signals
	tradeGroup.Post("/signal", handlers.HandleBotSignal)
}
