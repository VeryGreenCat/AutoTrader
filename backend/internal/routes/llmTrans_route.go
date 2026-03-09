package routes

import (
	"github.com/VeryGreenCat/AutoTrader/backend/internal/handlers"
	"github.com/gofiber/fiber/v2"
)

func LLMTransPrivateRoutes(router fiber.Router) {
	llmTransRoutes := router.Group("/llmTrans")

	// Frontend-facing: requires JWT auth
	llmTransRoutes.Get("/getLLMTrans", handlers.GetLLMTrans)
}

func LLMTransInternalRoutes(router fiber.Router) {
	llmTransRoutes := router.Group("/llmTrans")

	// Python bot only: requires X-Internal-Secret header
	llmTransRoutes.Get("/getLLMTrans", handlers.GetLLMTrans)
	llmTransRoutes.Post("/postLLMTrans", handlers.PostLLMTrans)
}