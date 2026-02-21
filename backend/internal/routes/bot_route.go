package routes

import (
	"github.com/VeryGreenCat/AutoTrader/backend/internal/handlers"
	"github.com/gofiber/fiber/v2"
)

func BotRoutes(router fiber.Router) {
	botRoutes := router.Group("/bots")

	botRoutes.Post("/deploy-bot", handlers.DeployBot)
	botRoutes.Get("/:mt5_id", handlers.GetBotsByMt5Id)
	botRoutes.Delete("/:bot_id", handlers.DeleteBot)
}