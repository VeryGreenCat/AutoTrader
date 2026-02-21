package handlers

import (
	"github.com/VeryGreenCat/AutoTrader/backend/internal/services"
	"github.com/gofiber/fiber/v2"
)

func GetAvailableModels(c *fiber.Ctx) error {
	models, err := services.GetAvailableModels()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to fetch models",
			"error":   err.Error(),
		})
	}
	return c.JSON(fiber.Map{
		"message": "Models fetched successfully",
		"data":    models,
	})
}