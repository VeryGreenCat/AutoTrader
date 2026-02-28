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
)

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

    if reqType == "billing" {
        billID := sess.Metadata["bill_id"]
        if billID == "" {
            return fmt.Errorf("bill_id not found in session metadata for billing type")
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
    } else if reqType == "ticket" {
        userID := sess.Metadata["user_id"]
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
    } else {
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