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

// GetMT5Signal checks if there is a pending signal for the MT5 account
func GetMT5Signal(c *fiber.Ctx) error {
	mt5Id := c.Query("mt5_id")
	token := c.Query("token")

	if mt5Id == "" || token == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "mt5_id and token are required",
		})
	}

	// 1. Verify account and token
	account, err := services.GetAccountByMT5Id(mt5Id)
	if err != nil || account.Token != token {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Invalid credentials",
		})
	}

	// 2. Get pending signal
	signal, exists := services.GetPendingSignal(mt5Id)
	
	if !exists {
		return c.Status(fiber.StatusOK).JSON(fiber.Map{
			"signal": "HOLD",
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"signal": signal.Action,
		"sl":     signal.SL,
		"tp":     signal.TP,
	})
}

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
		MT5ID:           req.MT5ID,
		Balance:         req.Balance,
		Equity:          req.Equity,
		RealizedToday:   req.RealizedToday,
		RealizedWeek:    req.RealizedWeek,
		LastSeen:        time.Now(),
		OpenPositions:   req.OpenPositions,
		ClosedPositions: req.ClosedPositions,
	}
	mu.Unlock()



	// 4. Update Transactions in DB
	for _, pos := range req.OpenPositions {
		var trans models.Transaction
		// Use ticket as transaction ID (string)
		transID := fmt.Sprintf("%d", pos.Ticket)
		
		if err := config.DB.Where("transaction_id = ?", transID).First(&trans).Error; err != nil {
			// Transaction doesn't exist, create it
			// 1. Find the bot responsible for this pair
			var bot models.Bot
			// This query joins Bot and Model to find the bot that matches MT5ID and Currency
			err := config.DB.Table(`"Bot"`).
				Select(`"Bot".bot_id`).
				Joins(`JOIN "Model" ON "Bot".model_id = "Model".model_id`).
				Where(`"Bot".mt5_id = ? AND "Model".currency = ?`, req.MT5ID, pos.Pair).
				First(&bot).Error
			
			if err == nil {
				now := time.Now()
				newTrans := models.Transaction{
					TransactionID: transID,
					MT5ID:         req.MT5ID,
					Created:       &now,
					PNL:           0,
					BotID:         bot.BotID,
					TradeType:     &pos.Type,
					UserID:        account.UserID,
				}
				config.DB.Create(&newTrans)
				fmt.Printf("Created new transaction %s for MT5 %s\n", transID, req.MT5ID)
			}
		}
	}

	for _, pos := range req.ClosedPositions {
		var trans models.Transaction
		transID := fmt.Sprintf("%d", pos.Ticket)
		if err := config.DB.Where("transaction_id = ?", transID).First(&trans).Error; err == nil {
			// Update PNL if it's currently 0 or different
			if trans.PNL == 0 && pos.Profit != 0 {
				trans.PNL = pos.Profit
				config.DB.Save(&trans)
				fmt.Printf("Updated transaction %s with PNL %.2f\n", transID, pos.Profit)
			}
		}
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Stats and transactions updated successfully",
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



// GetActiveBotStates returns the latest states of all online accounts using a specific bot model.
// This is used by the Python bot to perform personalized RL predictions.
func GetActiveBotStates(c *fiber.Ctx) error {
	currency := c.Query("currency")
	version := c.Query("version")

	if currency == "" || version == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "currency and version are required",
		})
	}

	// 1. Find all active bots (in DB) using this model
	var bots []models.Bot
	// Using GORM's Model() to handle table names and Joins correctly
	err := config.DB.Model(&models.Bot{}).
		Joins(`JOIN "Model" ON "Bot".model_id = "Model".model_id`).
		Where(`"Model".currency = ? AND "Model".version = ? AND "Bot".status = ?`, currency, version, true).
		Find(&bots).Error

	if err != nil {
		fmt.Printf("[ERROR] GetActiveBotStates DB Query: %v\n", err)
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Database query failed",
			"details": err.Error(),
		})
	}

	fmt.Printf("[INFO] GetActiveBotStates: Found %d active bots in DB for %s %s\n", len(bots), currency, version)

	// 2. Filter by online status (in memory) and build list
	results := []dto.MT5Stats{}
	mu.RLock()
	for _, b := range bots {
		stats, exists := mt5StatsMap[b.MT5ID]
		// Threshold for online: 5 minutes
		if exists && time.Since(stats.LastSeen) < 5*time.Minute {
			results = append(results, stats)
		}
	}
	mu.RUnlock()

	return c.JSON(fiber.Map{
		"data": results,
	})
}
