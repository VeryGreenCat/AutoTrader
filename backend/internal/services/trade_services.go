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
	SL        float64   `json:"sl"`
	TP        float64   `json:"tp"`
	Currency  string    `json:"currency"`
	CreatedAt time.Time `json:"created_at"`
}

// Global map to store pending signals for MT5 accounts
// Key: MT5ID_Currency, Value: PendingSignal
var (
	PendingSignals = make(map[string]PendingSignal)
)

// ProcessSignalDistribution finds all active bots matching the criteria and queues signals for them
func ProcessSignalDistribution(currency, version, action string, sl, tp float64, targetMT5ID string) (int, error) {
	if targetMT5ID != "" {
		// Single targeted signal
		key := fmt.Sprintf("%s_%s", targetMT5ID, currency)
		PendingSignals[key] = PendingSignal{
			Action:    action,
			SL:        sl,
			TP:        tp,
			Currency:  currency,
			CreatedAt: time.Now(),
		}
		fmt.Printf("Queued targeted %s signal for MT5 %s %s (SL: %.5f, TP: %.5f)\n", action, targetMT5ID, currency, sl, tp)
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
		key := fmt.Sprintf("%s_%s", bot.MT5ID, currency)
		PendingSignals[key] = PendingSignal{
			Action:    action,
			SL:        sl,
			TP:        tp,
			Currency:  currency,
			CreatedAt: time.Now(),
		}
		count++
		fmt.Printf("Queued %s signal for MT5 %s %s (SL: %.5f, TP: %.5f)\n", action, bot.MT5ID, currency, sl, tp)
	}

	return count, nil
}

// GetPendingSignal retrieves and clears a pending signal for an MT5 account and currency
func GetPendingSignal(mt5Id string, symbol string) (PendingSignal, bool) {
	key := fmt.Sprintf("%s_%s", mt5Id, symbol)
	signal, exists := PendingSignals[key]
	if !exists {
		return PendingSignal{Action: "HOLD"}, false
	}

	// Expiry logic: signals older than 5 mins are ignored
	if time.Since(signal.CreatedAt) > 5*time.Minute {
		delete(PendingSignals, key)
		return PendingSignal{Action: "HOLD"}, false
	}

	// Clear the signal after it's retrieved
	delete(PendingSignals, key)
	return signal, true
}