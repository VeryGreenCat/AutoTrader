package services

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"

	"github.com/VeryGreenCat/AutoTrader/backend/internal/config"
	"github.com/VeryGreenCat/AutoTrader/backend/internal/models"
	stripe "github.com/stripe/stripe-go/v76"
	"github.com/stripe/stripe-go/v76/checkout/session"
	"github.com/stripe/stripe-go/v76/customer"
)

// ExchangeRateResponse is used to parse the public API response
type ExchangeRateResponse struct {
	Rates map[string]float64 `json:"rates"`
}

func getRealTimeTHBRate() (float64, error) {
	// Using a free, no-auth public API for exchange rates
	resp, err := http.Get("https://open.er-api.com/v6/latest/USD")
	if err != nil {
		return 35.0, fmt.Errorf("failed to fetch exchange rate: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return 35.0, fmt.Errorf("unexpected status code fetching exchange rate: %d", resp.StatusCode)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return 35.0, fmt.Errorf("failed to read exchange rate body: %w", err)
	}

	var data ExchangeRateResponse
	if err := json.Unmarshal(body, &data); err != nil {
		return 35.0, fmt.Errorf("failed to parse exchange rate json: %w", err)
	}

	thbRate, ok := data.Rates["THB"]
	if !ok {
		return 35.0, fmt.Errorf("THB rate not found in response")
	}

	return thbRate, nil
}

func CreateCheckoutSession(id string, reqType string, requestUserID string) (string, error) {
	stripe.Key = os.Getenv("STRIPE_SECRET_KEY")
	domain := os.Getenv("FRONTEND_URL")
	if domain == "" {
		domain = "http://localhost:3000"
	}

	var usdAmount float64
	var productName string
	var internalUserID string

	switch reqType {
	case "billing":
		// id is billID
		var bill models.Billing
		if err := config.DB.Where("bill_id = ?", id).First(&bill).Error; err != nil {
			return "", fmt.Errorf("bill not found: %w", err)
		}

		if bill.Status != "unpaid" && bill.Status != "overdue" {
			return "", fmt.Errorf("bill is not payable, current status: %s", bill.Status)
		}
		usdAmount = bill.Amount
		productName = "AutoTrader Performance Fee"
		internalUserID = bill.UserID
	case "ticket":
		// id is packageID
		switch id {
		case "ticket_1":
			usdAmount = 1.00
			productName = "Energy Reserve: 1 Ticket"
		case "ticket_10":
			usdAmount = 9.00
			productName = "Energy Reserve: 10 Tickets (Best Value)"
		default:
			return "", fmt.Errorf("invalid package identifier: %s", id)
		}
		// For tickets, we need the user ID from the request (they should be logged in)
		if requestUserID == "" {
			return "", fmt.Errorf("user authentication required to purchase tickets")
		}
		internalUserID = requestUserID
	default:
		return "", fmt.Errorf("invalid request type: %s", reqType)
	}

	// Fetch user to get/create stripe customer
	var user models.User
	if err := config.DB.Where("user_id = ?", internalUserID).First(&user).Error; err != nil {
		return "", fmt.Errorf("user not found: %w", err)
	}

	customerID := user.StripeCustomerID
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
			return "", fmt.Errorf("failed to save stripe customer id: %w", err)
		}
	}

	// Fetch real-time exchange rate
	thbRate, err := getRealTimeTHBRate()
	if err != nil {
		fmt.Printf("Warning: failed to fetch real-time exchange rate, falling back to 35.0: %v\n", err)
		// Error is logged but we continue with the fallback rate returned by the function
	}

	thbAmount := usdAmount * thbRate
	// Stripe expects the amount in the smallest currency unit (e.g., satang for THB, which is 100 satang = 1 THB)
	unitAmount := int64(thbAmount * 100)
    
    // Description containing exchange rate info for the user
    description := fmt.Sprintf("Exchange rate: 1 USD = %.2f THB (Total: $%.2f USD)", thbRate, usdAmount)

    successUrlParams := "?payment=success"
    cancelUrlParams := "?payment=cancelled"
    
    // Redirect back to the correct page based on type
    redirectPath := "/billing"
    if reqType == "ticket" {
        redirectPath = "/buyTickets"
    }

	params := &stripe.CheckoutSessionParams{
		Customer: stripe.String(customerID),
		Mode:     stripe.String(string(stripe.CheckoutSessionModePayment)),
		PaymentMethodTypes: stripe.StringSlice([]string{
			"promptpay",
			"card",
		}),
		LineItems: []*stripe.CheckoutSessionLineItemParams{
			{
				PriceData: &stripe.CheckoutSessionLineItemPriceDataParams{
					Currency: stripe.String("thb"),
					ProductData: &stripe.CheckoutSessionLineItemPriceDataProductDataParams{
						Name: stripe.String(productName),
                        Description: stripe.String(description),
					},
					UnitAmount: stripe.Int64(unitAmount),
				},
				Quantity: stripe.Int64(1),
			},
		},
		SuccessURL: stripe.String(domain + redirectPath + successUrlParams),
		CancelURL:  stripe.String(domain + redirectPath + cancelUrlParams),
	}
    
    // Attach metadata for the webhook
	params.AddMetadata("type", reqType)
    params.AddMetadata("user_id", user.UserID)
    
    switch reqType {
		case "billing":
		params.AddMetadata("bill_id", id)
		case "ticket":
		params.AddMetadata("package_id", id)
        // Pass original amounts in metadata just in case
        params.AddMetadata("usd_amount", fmt.Sprintf("%.2f", usdAmount))
        params.AddMetadata("exchange_rate", fmt.Sprintf("%.4f", thbRate))
	}

	sess, err := session.New(params)
	if err != nil {
		return "", fmt.Errorf("failed to create checkout session: %w", err)
	}

	return sess.URL, nil
}