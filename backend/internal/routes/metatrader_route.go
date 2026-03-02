package routes

import (
	"github.com/VeryGreenCat/AutoTrader/backend/internal/handlers"
	"github.com/gofiber/fiber/v2"
)

func MetatraderRoutes(router fiber.Router) {
	metatraderRoutes := router.Group("/metatrader")

	metatraderRoutes.Post("/connect", handlers.MT5Connect)
	metatraderRoutes.Post("/push", handlers.MT5Push)
	metatraderRoutes.Get("/stats/:mt5_id", handlers.GetMT5Stats)
	metatraderRoutes.Get("/signal", func(c *fiber.Ctx) error {
		return c.Status(fiber.StatusOK).JSON(fiber.Map{"signal": "none"})
	})
}
