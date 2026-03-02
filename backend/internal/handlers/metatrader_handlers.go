package handlers

import (
	"fmt"

	"sync" // For thread-safe map access

	"time" // For heartbeat timing

	"github.com/VeryGreenCat/AutoTrader/backend/internal/config"
	"github.com/VeryGreenCat/AutoTrader/backend/internal/handlers/dto"
	"github.com/VeryGreenCat/AutoTrader/backend/internal/models"
	"github.com/VeryGreenCat/AutoTrader/backend/internal/services"
	"github.com/gofiber/fiber/v2"
)

// In-memory stats storage as requested (temporary, not in DB)
var (
	mt5StatsMap = make(map[string]dto.MT5Stats)
	mu          sync.RWMutex
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

// MT5Push handles incoming balance/equity updates from the EA
func MT5Push(c *fiber.Ctx) error {
	var req dto.MT5PushRequest

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid request body",
		})
	}

	// 1. Verify token
	account, err := services.GetAccountByMT5Id(req.MT5ID)
	if err != nil || account.Token != req.Token {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"message": "Invalid credentials",
		})
	}

	// 2. Refresh status if not true
    if !account.Status {
        account.Status = true
        config.DB.Save(account)
    }

	// 3. Store in-memory with timestamp
	mu.Lock()
	mt5StatsMap[req.MT5ID] = dto.MT5Stats{
		MT5ID:         req.MT5ID,
		Balance:       req.Balance,
		Equity:        req.Equity,
		RealizedToday: req.RealizedToday,
		RealizedWeek:  req.RealizedWeek,
		LastSeen:      time.Now(),
	}
	mu.Unlock()



	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Stats updated successfully",
	})
}

// GetMT5Stats retrieves stats for the frontend
func GetMT5Stats(c *fiber.Ctx) error {
	mt5Id := c.Params("mt5_id")

	mu.RLock()
	stats, exists := mt5StatsMap[mt5Id]
	mu.RUnlock()

	if !exists {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"message": "No stats found for this account",
		})
	}

	// Threshold for offline: 2 minutes
	isConnected := time.Since(stats.LastSeen) < 2*time.Minute

	// If detected as disconnected but DB still says true, update DB
	if !isConnected {
		account, err := services.GetAccountByMT5Id(mt5Id)
		if err == nil && account.Status {
			account.Status = false
			config.DB.Save(account)
		}
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"data":         stats,
		"is_connected": isConnected,
	})
}

// RefreshAccountsStatus checks a list of accounts against the in-memory map and updates their DB status if stale.
func RefreshAccountsStatus(accounts []models.MT5) {
	mu.RLock()
	defer mu.RUnlock()

	for i := range accounts {
		stats, exists := mt5StatsMap[accounts[i].MT5ID]
		
		// Threshold: 2 minutes
		isActuallyConnected := exists && time.Since(stats.LastSeen) < 2*time.Minute
		
		// If DB says connected but heartbeat is gone, update DB
		if accounts[i].Status && !isActuallyConnected {
			accounts[i].Status = false
			config.DB.Model(&models.MT5{}).Where("mt5_id = ?", accounts[i].MT5ID).Update("status", false)
		}
		
	}
}



