package handlers

import (
	"log"

	"github.com/VeryGreenCat/AutoTrader/backend/internal/handlers/dto"
	"github.com/VeryGreenCat/AutoTrader/backend/internal/services"
	"github.com/gofiber/fiber/v2"
)

func CreateCheckoutSession(c *fiber.Ctx) error {
    var req dto.CreateCheckoutRequest

    if err := c.BodyParser(&req); err != nil {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "error": "Invalid request body",
        })
    }

    if req.Type == "" {
        req.Type = "billing" // Default to billing for backward compatibility
    }

    var id string
    if req.Type == "billing" {
        if req.BillID == "" {
            return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                "error": "bill_id is required for billing",
            })
        }
        id = req.BillID
    } else if req.Type == "ticket" {
        if req.PackageID == "" {
            return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
                "error": "package_id is required for tickets",
            })
        }
        id = req.PackageID
    } else {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "error": "invalid type",
        })
    }
    
    // We get user ID from locals since they must be authenticated
    userID, ok := c.Locals("user_id").(string)
    if !ok {
        // Fallback for testing/backward compatibility if auth middleware isn't present
        userID = "" 
    }

    url, err := services.CreateCheckoutSession(id, req.Type, userID)
    if err != nil {
        log.Println("Error creating checkout session:", err)
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": err.Error(),
        })
    }

    return c.JSON(dto.CheckoutResponse{URL: url})
}