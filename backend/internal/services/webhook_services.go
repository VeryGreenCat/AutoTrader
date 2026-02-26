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

    billID := sess.Metadata["bill_id"]
    if billID == "" {
        return fmt.Errorf("bill_id not found in session metadata")
    }

    now := time.Now()
    result := config.DB.Model(&models.Billing{}).
        Where("bill_id = ? AND status = ?", billID, "unpaid").
        Updates(map[string]interface{}{
            "status":     "paid",
            "paid_at":    now,
            "payment_id": sess.ID,
        })

    if result.Error != nil {
        return fmt.Errorf("failed to update billing record: %w", result.Error)
    }

    return nil
}

func handlePaymentFailed(event stripe.Event) error {
    var sess stripe.CheckoutSession
    if err := json.Unmarshal(event.Data.Raw, &sess); err != nil {
        return fmt.Errorf("failed to parse session: %w", err)
    }

    billID := sess.Metadata["bill_id"]
    if billID == "" {
        return nil
    }

    config.DB.Model(&models.Billing{}).
        Where("bill_id = ? AND status = ?", billID, "unpaid").
        Update("status", "failed")

    return nil
}