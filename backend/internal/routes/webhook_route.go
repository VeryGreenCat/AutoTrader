package routes

import (
	"github.com/VeryGreenCat/AutoTrader/backend/internal/handlers"
	"github.com/gofiber/fiber/v2"
)

func WebhookRoute(router fiber.Router) {
	webhook := router.Group("/webhook")
	webhook.Post("/", handlers.StripeWebhookHandler)
}