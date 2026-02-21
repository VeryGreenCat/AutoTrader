package handlers

import (
	"github.com/VeryGreenCat/AutoTrader/backend/internal/handlers/dto"
	"github.com/VeryGreenCat/AutoTrader/backend/internal/services"
	"github.com/gofiber/fiber/v2"
)

func DeployBot(c *fiber.Ctx) error {
	var bot dto.DeployBotRequest

	// 1. Parse the body sent from frontend
	if err := c.BodyParser(&bot); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid request body",
		})
	}

	// 2. Ask service to save to DB
	if err := services.DeployBot(&bot); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to deploy bot",
		})
	}

	// 3. Return success
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "Bot deployed successfully",
		"data":    bot,
	})
}

func GetBotsByMt5Id(c *fiber.Ctx) error {
	mt5Id := c.Params("mt5_id")

	bots, err := services.GetBotsByMt5Id(mt5Id)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to fetch bots",
		})
	}

	return c.JSON(fiber.Map{
		"message": "Bots fetched successfully",
		"data":    bots,
	})
}

func DeleteBot(c *fiber.Ctx) error {
	botId := c.Params("bot_id")

	if err := services.DeleteBot(botId); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to delete bot",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Bot deleted successfully",
	})
}