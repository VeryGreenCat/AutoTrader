package handlers

import (
	"fmt"

	"github.com/VeryGreenCat/AutoTrader/backend/internal/handlers/dto"
	"github.com/VeryGreenCat/AutoTrader/backend/internal/services"
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
	if payload.Action != "BUY" && payload.Action != "SELL" && payload.Action != "HOLD" && payload.Action != "CLOSE" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid action, must be BUY, SELL, HOLD, or CLOSE",
		})
	}

	// call trade services
	count, err := services.ProcessSignalDistribution(payload.Currency, payload.Version, payload.Action, payload.MT5ID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}
	
	return c.JSON(fiber.Map{
		"message": fmt.Sprintf("Signal processed for %d active bots", count),
		"data":    payload,
	})
}
