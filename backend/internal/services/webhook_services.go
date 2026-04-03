package services

import (
	"encoding/json"
	"fmt"
	"os"
	"time"

	"github.com/VeryGreenCat/AutoTrader/backend/internal/config"
	"github.com/VeryGreenCat/AutoTrader/backend/internal/models"
	"github.com/gofiber/fiber/v2"
	stripe "github.com/stripe/stripe-go/v76"
	"github.com/stripe/stripe-go/v76/webhook"
	"gorm.io/gorm"
)

// stripe listen --forward-to localhost:5000/api/webhook
func StripeWebhookHandler(c *fiber.Ctx) error {
    webhookSecret := os.Getenv("STRIPE_WEBHOOK_SECRET")

    payload := c.Body() // raw body — works because we haven't parsed it yet
    sigHeader := c.Get("Stripe-Signature")
    fmt.Println("enter webhook", sigHeader)

    event, err := webhook.ConstructEventWithOptions(payload, sigHeader, webhookSecret, webhook.ConstructEventOptions{
        IgnoreAPIVersionMismatch: true, // this cause a stripe error
    })
    if err != nil {
        return fmt.Errorf("webhook signature verification failed: %w", err)
    }

    switch event.Type {
    case "checkout.session.completed",
        "checkout.session.async_payment_succeeded":
            fmt.Println("Payment success")
        return handlePaymentSuccess(event)

    case "checkout.session.async_payment_failed":
        fmt.Println("Payment failed")
        return handlePaymentFailed(event)
    }

    return nil
}

func handlePaymentSuccess(event stripe.Event) error {
    var sess stripe.CheckoutSession
    if err := json.Unmarshal(event.Data.Raw, &sess); err != nil {
        return fmt.Errorf("failed to parse session: %w", err)
    }

    reqType := sess.Metadata["type"]
    if reqType == "" {
        // Fallback for older sessions before we added 'type'
        reqType = "billing"
    }

    now := time.Now()

    switch reqType {
    case "billing":
        billID := sess.Metadata["bill_id"]
        if billID == "" {
            return fmt.Errorf("bill_id not found in session metadata for billing type")
        }

        var bill models.Billing
        if err := config.DB.Where("bill_id = ?", billID).First(&bill).Error; err != nil {
            return fmt.Errorf("failed to fetch billing record: %w", err)
        }

        result := config.DB.Model(&models.Billing{}).
            Where("bill_id = ? AND status IN ?", billID, []string{"unpaid", "overdue"}).
            Updates(map[string]interface{}{
                "status":     "paid",
                "paid_at":    now,
                "payment_id": sess.ID,
            })

        if result.Error != nil {
            return fmt.Errorf("failed to update billing record: %w", result.Error)
        }

        // Add reward tickets: 1 ticket per $10 of performance fee paid
        // 1 ticket = 12 hours = 43200 seconds
        if bill.Amount > 0 {
            ticketsToAward := int64(bill.Amount / 10)
            if ticketsToAward > 0 {
                secondsToAdd := ticketsToAward * 12 * 3600
                config.DB.Model(&models.User{}).
                    Where("user_id = ?", bill.UserID).
                    Update("remaining_seconds", gorm.Expr("remaining_seconds + ?", secondsToAdd))
                fmt.Printf("Awarded %d tickets (%d seconds) to user %s for paying bill %s\n", ticketsToAward, secondsToAdd, bill.UserID, billID)
            }
        }
    case "ticket":
        userID := sess.Metadata["user_id"]
        packageID := sess.Metadata["package_id"]
        if userID == "" {
            return fmt.Errorf("user_id not found in session metadata for ticket type")
        }
        
        // Convert the amount back to a float (amount total is in satangs/cents)
        var amount float64 = 0
        if sess.AmountTotal > 0 {
             amount = float64(sess.AmountTotal) / 100.0
        }

        newBill := models.Billing{
            UserID:    userID,
            Amount:    amount,
            Status:    "paid",
            PaymentID: sess.ID,
            PaidAt:    &now,
            CreatedAt: now, 
        }

        if err := config.DB.Create(&newBill).Error; err != nil {
            return fmt.Errorf("failed to create new billing record for ticket: %w", err)
        }

        // Calculate seconds to add based on package
        var secondsToAdd int64
        switch packageID {
        case "ticket_1":
            secondsToAdd = 12 * 3600 // 12 hours
        case "ticket_10":
            secondsToAdd = 120 * 3600 // 120 hours
        default:
            return fmt.Errorf("unknown package ID: %s", packageID)
        }

        // Update User's remaining seconds
        var user models.User
        if err := config.DB.Where("user_id = ?", userID).First(&user).Error; err == nil {
            // Add the purchased time to the user's balance
            user.RemainingSeconds += secondsToAdd

            config.DB.Save(&user)
        }
    default:
        return fmt.Errorf("unknown session type: %s", reqType)
    }

    return nil
}

func handlePaymentFailed(event stripe.Event) error {
    var sess stripe.CheckoutSession
    if err := json.Unmarshal(event.Data.Raw, &sess); err != nil {
        return fmt.Errorf("failed to parse session: %w", err)
    }

    reqType := sess.Metadata["type"]
    if reqType == "" {
        reqType = "billing"
    }

    if reqType == "billing" {
        billID := sess.Metadata["bill_id"]
        if billID == "" {
            return nil
        }

        config.DB.Model(&models.Billing{}).
            Where("bill_id = ? AND status = ?", billID, "unpaid").
            Update("status", "failed")
    }
    // For tickets, we don't have an existing unpaid record to fail, so we do nothing.

    return nil
}