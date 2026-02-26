package handlers

import (
	"github.com/VeryGreenCat/AutoTrader/backend/internal/handlers/dto"
	"github.com/VeryGreenCat/AutoTrader/backend/internal/services"
	"github.com/gofiber/fiber/v2"
)

func DisplayAcc_PnL(c *fiber.Ctx) error {
	// receive user_id, start_period, end_period
	var req dto.DisplayAcc_PnLRequest
	if err := c.QueryParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid query parameters",
		})
	}
	
	if res, err := services.DisplayAcc_PnL(&req); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to display acc pnl",
		})
	} else {
		return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"message": "Acc pnl displayed successfully",
			"data":    res,
		})
	}
}