package routes

import (
	"github.com/VeryGreenCat/AutoTrader/backend/internal/handlers"
	"github.com/gofiber/fiber/v2"
)

func MT5Routes(router fiber.Router) {
	MT5Routes := router.Group("/mt5")

	MT5Routes.Post("/accounts", handlers.AddMT5Account)

	// // EA push endpoint — no JWT, uses token in body for auth
	// mt5.Post("/push", h.PushData)

    // // Frontend snapshot — protected by your existing JWT middleware
    // mt5.Get("/snapshot", middleware.AuthMiddleware, h.GetSnapshot)

    // // WebSocket — upgrade check then handler
    // mt5.Get("/ws", websocket.New(h.LiveStream))
}