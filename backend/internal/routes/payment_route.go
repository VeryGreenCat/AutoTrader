package routes

import (
	"github.com/VeryGreenCat/AutoTrader/backend/internal/handlers"
	"github.com/gofiber/fiber/v2"
)

func PaymentRoutes(router fiber.Router) {
	paymentGroup := router.Group("/payment")
	paymentGroup.Post("/create-checkout-session", handlers.CreateCheckoutSession)
}
