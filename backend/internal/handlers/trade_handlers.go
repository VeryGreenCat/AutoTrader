package handlers

import (
	"github.com/VeryGreenCat/AutoTrader/backend/internal/handlers/dto"
	"github.com/gofiber/fiber/v2"
)

// HandleBotSignal receives a signal from the Python bot
func HandleBotSignal(c *fiber.Ctx) error {
	var payload dto.BotSignalRequest

	if err := c.BodyParser(&payload); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request payload",
		})
	}

	// Basic validation could go here if not using a validator middleware
	if payload.Action != "BUY" && payload.Action != "SELL" && payload.Action != "HOLD" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid action, must be BUY, SELL, or HOLD",
		})
	}

	// TODO: Pass the payload to a trade_services.go function to distribute
	// the signal to active, connected users.
	
	return c.JSON(fiber.Map{
		"message": "Signal received successfully",
		"data": payload,
	})
}
