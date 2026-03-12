package services

import (
	"log"
	"time"

	"github.com/VeryGreenCat/AutoTrader/backend/internal/config"
	"github.com/VeryGreenCat/AutoTrader/backend/internal/models"
	"gorm.io/gorm"
)

func StartUsageManager() {
	go func() {
		ticker := time.NewTicker(30 * time.Second)
		defer ticker.Stop()

		for range ticker.C {
			manageUsage()
		}
	}()
}

func manageUsage() {
	db := config.DB

	// 1. Update remaining_seconds for all active users
	// This query subtracts the time elapsed since bot_started_at from remaining_seconds
	// and resets bot_started_at to NOW() so the next cycle calculates from this point.
	err := db.Transaction(func(tx *gorm.DB) error {
		// Update remaining_seconds and reset bot_started_at for users with active bots
		if err := tx.Model(&models.User{}).
			Where("bot_started_at IS NOT NULL").
			Updates(map[string]interface{}{
				"remaining_seconds": gorm.Expr("remaining_seconds - EXTRACT(EPOCH FROM (NOW() - bot_started_at))"),
				"bot_started_at":    gorm.Expr("NOW()"),
			}).Error; err != nil {
			return err
		}

		// 2. Identify users who ran out of time
		var expiredUsers []models.User
		if err := tx.Model(&models.User{}).Where("remaining_seconds <= 0 AND bot_started_at IS NOT NULL").Find(&expiredUsers).Error; err != nil {
			return err
		}

		for _, user := range expiredUsers {
			log.Printf("User %s ran out of time, stopping all bots.", user.UserID)

			// Set remaining_seconds to 0 exactly and clear bot_started_at
			if err := tx.Model(&models.User{}).
				Where("user_id = ?", user.UserID).
				Updates(map[string]interface{}{
					"remaining_seconds": 0,
					"bot_started_at":    nil,
				}).Error; err != nil {
				log.Printf("Error stopping user %s usage: %v", user.UserID, err)
				continue
			}

			// Turn off all bots for this user
			// We need to join with MT5 to find bots belonging to this user
			if err := tx.Table(`"Bot"`).
				Where(`mt5_id IN (SELECT mt5_id FROM "MT5" WHERE user_id = ?)`, user.UserID).
				Update("status", false).Error; err != nil {
				log.Printf("Error stopping bots for user %s: %v", user.UserID, err)
			}
		}

		return nil
	})

	if err != nil {
		log.Printf("Usage Manager Error: %v", err)
	}
}
