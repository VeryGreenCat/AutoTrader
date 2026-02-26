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

    if req.BillID == "" {
        return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
            "error": "bill_id is required",
        })
    }

    url, err := services.CreateCheckoutSession(req.BillID)
    if err != nil {
        log.Println("Error creating checkout session:", err)
        return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
            "error": err.Error(),
        })
    }

    return c.JSON(dto.CheckoutResponse{URL: url})
}