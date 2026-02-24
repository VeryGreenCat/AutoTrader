package handlers

import (
	"log"

	"github.com/VeryGreenCat/AutoTrader/backend/internal/handlers/dto"
	"github.com/VeryGreenCat/AutoTrader/backend/internal/services"
	"github.com/gofiber/fiber/v2"
)

// CreateCheckoutSession handles the request to generate a Stripe payment URL
func CreateCheckoutSession(c *fiber.Ctx) error {
	var req dto.CreateCheckoutRequest // receive request body from client including: user_id and amount

	if err := c.BodyParser(&req); err != nil {
		log.Println("Error parsing request body:", err)
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	if req.UserID == "" || req.Amount <= 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "user_id and amount (>0) are required",
		})
	}

	url, err := services.CreateCheckoutSession(req.UserID, req.Amount)  // send user_id and amount to service
	if err != nil {
		log.Println("Error creating checkout session:", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create checkout session",
		})
	}

	return c.JSON(dto.CheckoutResponse{ // send response back to client including: url
		URL: url,
	})
}
