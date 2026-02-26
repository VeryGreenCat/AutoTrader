package handlers

import (
	"fmt"

	"github.com/VeryGreenCat/AutoTrader/backend/internal/services"
	"github.com/gofiber/fiber/v2"
)

func StripeWebhookHandler(c *fiber.Ctx) error {
	err := services.StripeWebhookHandler(c)
	if err != nil {
		fmt.Printf("Webhook error: %v\n", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to process webhook",
		})
	}
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Webhook processed successfully",
	})
}
