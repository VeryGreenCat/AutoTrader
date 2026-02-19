package handlers

// data flow MT5 Handler
// Parses the JSON from frontend and asks MT5 service to save it.

import (
	"github.com/VeryGreenCat/AutoTrader/backend/internal/models"
	"github.com/VeryGreenCat/AutoTrader/backend/internal/services"
	"github.com/gofiber/fiber/v2"
)

func AddMT5Account(c *fiber.Ctx) error {
	var account models.MT5

	// 1. Parse the body sent from frontend
	if err := c.BodyParser(&account); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid request body",
		})
	}

	// 2. Ask service to save to DB
	if err := services.RegisterMT5Account(&account); err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to add MT5 account",
		})
	}

	// 3. Return success
	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"message": "MT5 account added successfully",
		"data":    account,
	})
}

func GetAccountById(c *fiber.Ctx) error {
	userId := c.Params("user_id")
	account, err := services.GetAccountsById(userId)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to get MT5 account",
		})
	}
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "MT5 account fetched successfully",
		"data":    account,
	})
}
