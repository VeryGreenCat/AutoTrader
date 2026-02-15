package handlers

// data flow ep7: Take the param and pass it to the right service
// it doesn't know how to find user in db but it knows who to ask
// when it gets the data it returns as JSON.
// ep8 is user_service.go

import (
	"github.com/VeryGreenCat/AutoTrader/backend/internal/services"
	"github.com/gofiber/fiber/v2"
)

func GetUserProfile(c *fiber.Ctx) error {
	user, err := services.GetProfile(c.Params("user_id"))
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Failed to get user profile",
		})
	}
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "User profile fetched successfully",
		"data":    user,
	})
}