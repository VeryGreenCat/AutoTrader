package handlers

import (
	"github.com/VeryGreenCat/AutoTrader/backend/internal/services"
	"github.com/gofiber/fiber/v2"
)

func GetLLMTrans(c *fiber.Ctx) error {
	currency := c.Query("currency")

	trans, err := services.GetLLMTrans(currency)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to fetch LLM transactions",
		})
	}

	return c.JSON(fiber.Map{
		"message": "LLM transactions fetched successfully",
		"data":    trans,
	})
}
