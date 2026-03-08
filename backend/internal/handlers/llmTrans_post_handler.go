package handlers

import (
	"github.com/VeryGreenCat/AutoTrader/backend/internal/models"
	"github.com/VeryGreenCat/AutoTrader/backend/internal/services"
	"github.com/gofiber/fiber/v2"
)

// PostLLMTrans receives weekly LLM analysis from the Python bot and saves it.
func PostLLMTrans(c *fiber.Ctx) error {
	var payload models.LLMTrans

	if err := c.BodyParser(&payload); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request payload",
		})
	}

	// Assuming a service method exists or will be created to handle insertion
	err := services.SaveLLMTrans(&payload)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to save LLM transaction",
		})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "LLM transaction saved successfully",
		"data":    payload,
	})
}
