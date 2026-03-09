package handlers

import (
	"github.com/VeryGreenCat/AutoTrader/backend/internal/handlers/dto"
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

func RegisterModel(c *fiber.Ctx) error {
	var req dto.RegisterModelRequest

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	model, err := services.UpsertModel(&req)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Model registered/updated successfully",
		"data":    model,
	})
}