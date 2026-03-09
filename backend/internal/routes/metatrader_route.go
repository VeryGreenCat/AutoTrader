package routes

import (
	"github.com/VeryGreenCat/AutoTrader/backend/internal/handlers"
	"github.com/gofiber/fiber/v2"
)

func MetatraderRoutes(router fiber.Router) {
	metatrader := router.Group("/metatrader")

	metatrader.Post("/connect", handlers.MT5Connect)
	metatrader.Post("/push", handlers.MT5Push)
	metatrader.Get("/signal", handlers.GetMT5Signal)
	metatrader.Get("/stats/:mt5_id", handlers.GetMT5Stats)
	metatrader.Get("/bot-states", handlers.GetActiveBotStates) // New internal state fetcher
}
