package main

import (
	"github.com/gofiber/fiber/v3"
	// You will need a JWT middleware or parser here
)

func main() {
	app := fiber.New()

	// 1. Public Route (Auth)
	app.Post("/api/auth/login", func(c fiber.Ctx) error {
		// TODO: Implement Supabase Auth Logic here
		// 1. Get email/password from body
		// 2. Call Supabase Admin API to verify credentials
		// 3. If valid, generate a JWT token (or use Supabase session)
		// 4. Return token to frontend
		return c.SendString("Login Endpoint - Not Implemented Yet")
	})

	// 2. Protected Route (Trading)
	// We apply the middleware to this route group
	api := app.Group("/api")
	api.Use(AuthMiddleware)

	api.Get("/protected", func(c fiber.Ctx) error {
		// Access user ID from context (set by middleware)
		userID := c.Locals("user_id").(string)
		return c.JSON(fiber.Map{
			"message": "Access Granted",
			"user_id": userID,
		})
	})

	app.Listen(":8080")
}
