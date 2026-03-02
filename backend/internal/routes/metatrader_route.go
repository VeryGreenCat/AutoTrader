package routes

import (
	"github.com/VeryGreenCat/AutoTrader/backend/internal/handlers"
	"github.com/gofiber/fiber/v2"
)

func MetatraderRoutes(router fiber.Router) {
	metatraderRoutes := router.Group("/metatrader")

	// The EA will send a POST request with its MT5 ID and Token to connect
	metatraderRoutes.Post("/connect", handlers.MT5Connect)
}
