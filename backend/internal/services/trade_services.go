package services

import (
	"fmt"
	"time"

	"github.com/VeryGreenCat/AutoTrader/backend/internal/config"
	"github.com/VeryGreenCat/AutoTrader/backend/internal/models"
)

// PendingSignal represents a signal waiting to be picked up by an MT5 account
type PendingSignal struct {
	Action    string    `json:"action"`
	CreatedAt time.Time `json:"created_at"`
}

// Global map to store pending signals for MT5 accounts
// Key: MT5ID, Value: PendingSignal
var (
	PendingSignals = make(map[string]PendingSignal)
)

// ProcessSignalDistribution finds all active bots matching the criteria and queues signals for them
func ProcessSignalDistribution(currency, version, action, targetMT5ID string) (int, error) {
	if targetMT5ID != "" {
		// Single targeted signal
		PendingSignals[targetMT5ID] = PendingSignal{
			Action:    action,
			CreatedAt: time.Now(),
		}
		fmt.Printf("Queued targeted %s signal for MT5 %s\n", action, targetMT5ID)
		return 1, nil
	}

	var bots []models.Bot

	// 1. Find the model matching currency and version
	var model models.Model
	if err := config.DB.Where("currency = ? AND version = ?", currency, version).First(&model).Error; err != nil {
		return 0, fmt.Errorf("model not found for %s %s: %v", currency, version, err)
	}

	// 2. Find all active bots using this model
	if err := config.DB.Where("model_id = ? AND status = ?", model.ModelID, true).Find(&bots).Error; err != nil {
		return 0, fmt.Errorf("failed to fetch active bots: %v", err)
	}

	count := 0
	// 3. Queue signals for each bot
	for _, bot := range bots {
		PendingSignals[bot.MT5ID] = PendingSignal{
			Action:    action,
			CreatedAt: time.Now(),
		}
		count++
		fmt.Printf("Queued %s signal for MT5 %s\n", action, bot.MT5ID)
	}

	return count, nil
}

// GetPendingSignal retrieves and clears a pending signal for an MT5 account
func GetPendingSignal(mt5Id string) (string, bool) {
	signal, exists := PendingSignals[mt5Id]
	if !exists {
		return "HOLD", false
	}

	// Expiry logic: signals older than 5 mins are ignored
	if time.Since(signal.CreatedAt) > 5*time.Minute {
		delete(PendingSignals, mt5Id)
		return "HOLD", false
	}

	// Clear the signal after it's retrieved
	delete(PendingSignals, mt5Id)
	return signal.Action, true
}