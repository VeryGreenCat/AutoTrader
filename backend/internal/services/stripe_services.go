package services

import (
	"fmt"
	"os"

	"github.com/VeryGreenCat/AutoTrader/backend/internal/config"
	"github.com/VeryGreenCat/AutoTrader/backend/internal/models"
	stripe "github.com/stripe/stripe-go/v76"
	"github.com/stripe/stripe-go/v76/checkout/session"
	"github.com/stripe/stripe-go/v76/customer"
)

func CreateCheckoutSession(billID string) (string, error) {
    stripe.Key = os.Getenv("STRIPE_SECRET_KEY")
    domain := os.Getenv("FRONTEND_URL")
    if domain == "" {
        domain = "http://localhost:3000"
    }

    // Fetch bill to get user_id and amount
    var bill models.Billing
    if err := config.DB.Where("bill_id = ?", billID).First(&bill).Error; err != nil {
        return "", fmt.Errorf("bill not found: %w", err)
    }

    if bill.Status != "unpaid" {
        return "", fmt.Errorf("bill is not payable, current status: %s", bill.Status)
    }

    // Fetch user to get/create stripe customer
    var user models.User
    if err := config.DB.Where("user_id = ?", bill.UserID).First(&user).Error; err != nil {
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
                        Name: stripe.String("AutoTrader Performance Fee"),
                    },
                    UnitAmount: stripe.Int64(int64(bill.Amount * 100)),
                },
                Quantity: stripe.Int64(1),
            },
        },
        SuccessURL: stripe.String(domain + "/billing?payment=success"),
        CancelURL:  stripe.String(domain + "/billing?payment=cancelled"),
    }
    params.AddMetadata("bill_id", billID)
    params.AddMetadata("user_id", user.UserID)

    sess, err := session.New(params)
    if err != nil {
        return "", fmt.Errorf("failed to create checkout session: %w", err)
    }

    return sess.URL, nil
}