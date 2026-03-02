package handlers

import (
	"fmt"

	"github.com/VeryGreenCat/AutoTrader/backend/internal/config"
	"github.com/VeryGreenCat/AutoTrader/backend/internal/handlers/dto"
	"github.com/VeryGreenCat/AutoTrader/backend/internal/services"
	"github.com/gofiber/fiber/v2"
)

// MT5ConnectRequest defines the structure of the incoming connection test request from the EA

// MT5Connect handles the incoming connection from the MetaTrader 5 Expert Advisor
func MT5Connect(c *fiber.Ctx) error {
	var req dto.MT5ConnectRequest

	// Parse the body sent from the MT5 EA
	if err := c.BodyParser(&req); err != nil {
		fmt.Println("Error parsing MT5 connect request:", err)
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid request body",
		})
	}

	// 1. Database Lookup
	account, err := services.GetAccountByMT5Id(req.MT5ID)
	if err != nil {
		fmt.Printf("MT5 Connection Rejected: Account %s not found\n", req.MT5ID)
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"message": "MT5 account not found",
		})
	}

	// 2. Token Verification
	if account.Token != req.Token {
		fmt.Printf("MT5 Connection Rejected: Invalid token for account %s\n", req.MT5ID)
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"message": "Invalid connection token",
		})
	}

	// 3. Update Status
	account.Status = true
	if err := config.DB.Save(account).Error; err != nil {
		fmt.Printf("Warning: Failed to update status for account %s\n", req.MT5ID)
	}

	// Just print the received data to terminal as requested for the test
	fmt.Printf("\n--- connection verified ---\n")
	fmt.Printf("MT5 ID : %s\n", req.MT5ID)
	fmt.Printf("-------------------------------\n\n")

	// Return success response to the EA
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Connection and Token verified successfully",
		"status":  "ok",
	})

}

func MT5Disconnect(c *fiber.Ctx) error { //not used yet
	var req dto.MT5ConnectRequest

	// Parse the body sent from the MT5 EA
	if err := c.BodyParser(&req); err != nil {
		fmt.Println("Error parsing MT5 disconnect request:", err)
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid request body",
		})
	}

	// 1. Database Lookup
	account, err := services.GetAccountByMT5Id(req.MT5ID)
	if err != nil {
		fmt.Printf("MT5 Disconnection Rejected: Account %s not found\n", req.MT5ID)
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"message": "MT5 account not found",
		})
	}

	// 2. Token Verification
	if account.Token != req.Token {
		fmt.Printf("MT5 Disconnection Rejected: Invalid token for account %s\n", req.MT5ID)
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"message": "Invalid connection token",
		})
	}

	// 3. Update Status
	account.Status = false
	if err := config.DB.Save(account).Error; err != nil {
		fmt.Printf("Warning: Failed to update status for account %s\n", req.MT5ID)
	}

	// Just print the received data to terminal as requested for the test
	fmt.Printf("\n--- disconnection verified ---\n")
	fmt.Printf("MT5 ID : %s\n", req.MT5ID)
	fmt.Printf("-------------------------------\n\n")

	// Return success response to the EA
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Disconnection and Token verified successfully",
		"status":  "ok",
	})
}