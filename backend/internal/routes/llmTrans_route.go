package routes

import (
	"github.com/VeryGreenCat/AutoTrader/backend/internal/handlers"
	"github.com/gofiber/fiber/v2"
)

func LLMTransRoutes(router fiber.Router) {
	llmTransRoutes := router.Group("/llmTrans")

	llmTransRoutes.Get("/getLLMTrans", handlers.GetLLMTrans)
	llmTransRoutes.Post("/postLLMTrans", handlers.PostLLMTrans)
}