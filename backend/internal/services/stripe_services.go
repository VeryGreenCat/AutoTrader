package services

import (
	"fmt"
	"os"

	"github.com/VeryGreenCat/AutoTrader/backend/internal/config"
	"github.com/VeryGreenCat/AutoTrader/backend/internal/models"
	stripe "github.com/stripe/stripe-go/v76"
	"github.com/stripe/stripe-go/v76/checkout/session"
	customer "github.com/stripe/stripe-go/v76/customer"
)

// CreateCheckoutSession generates a Stripe checkout URL for the user.
func CreateCheckoutSession(userID string, amount float64) (string, error) {
	stripe.Key = os.Getenv("STRIPE_SECRET_KEY")
	domain := os.Getenv("FRONTEND_URL")
	if domain == "" {
		domain = "http://localhost:3000"
	}

	// Fetch user to check for stripe_customer_id
	var user models.User
	if err := config.DB.Where("user_id = ?", userID).First(&user).Error; err != nil {
		return "", fmt.Errorf("user not found: %w", err)
	}

	customerID := user.StripeCustomerID

	// If user doesn't have a Stripe Customer ID, create one
	if customerID == "" {
		params := &stripe.CustomerParams{
			Email: stripe.String(user.Email),
		}
		params.AddMetadata("user_id", user.UserID)

		newCustomer, err := customer.New(params)
		if err != nil {
			return "", fmt.Errorf("failed to create stripe customer: %w", err)
		}

		customerID = newCustomer.ID
		user.StripeCustomerID = customerID
		if err := config.DB.Save(&user).Error; err != nil {
			return "", fmt.Errorf("failed to save stripe customer id to user: %w", err)
		}
	}

	// Create checkout session
	params := &stripe.CheckoutSessionParams{
		Customer: stripe.String(customerID),
		Mode:     stripe.String(string(stripe.CheckoutSessionModePayment)),
		LineItems: []*stripe.CheckoutSessionLineItemParams{
			{
				PriceData: &stripe.CheckoutSessionLineItemPriceDataParams{
					Currency: stripe.String("usd"), // Configured for USD
					ProductData: &stripe.CheckoutSessionLineItemPriceDataProductDataParams{
						Name: stripe.String("AutoTrader Performance Fee"),
					},
					// Stripe expects amount in lowest denominator (cents)
					UnitAmount: stripe.Int64(int64(amount * 100)),
				},
				Quantity: stripe.Int64(1),
			},
		},
		SuccessURL: stripe.String(domain + "/billing?payment=success"),
		CancelURL:  stripe.String(domain + "/billing?payment=cancelled"),
	}
	params.AddMetadata("user_id", user.UserID)

	sess, err := session.New(params)
	if err != nil {
		return "", fmt.Errorf("failed to create checkout session: %w", err)
	}

	return sess.URL, nil
}