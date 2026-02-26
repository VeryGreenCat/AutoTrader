package handlers

import (
	"github.com/VeryGreenCat/AutoTrader/backend/internal/services"
	"github.com/gofiber/fiber/v2"
)

func GetBillById(c *fiber.Ctx) error {
	userId := c.Params("user_id")
	account, err := services.GetBillById(userId)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to get bill",
		})
	}
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Bill fetched successfully",
		"data":    account,
	})
}

func GetUnpaidBill(c *fiber.Ctx) error {
	userId := c.Params("user_id")
	bill, err := services.GetUnpaidBills(userId)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to get unpaid bills",
		})
	}
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Unpaid bill fetched successfully",
		"data":    bill,
	})
}