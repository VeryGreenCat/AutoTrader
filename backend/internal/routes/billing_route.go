package routes

import (
	"github.com/VeryGreenCat/AutoTrader/backend/internal/handlers"
	"github.com/gofiber/fiber/v2"

)

func BillingRoutes(router fiber.Router) {
	billingRoutes := router.Group("/billing")
	billingRoutes.Get("/:user_id", handlers.GetBillById)
	billingRoutes.Get("/unpaid/:user_id", handlers.GetUnpaidBill)
}