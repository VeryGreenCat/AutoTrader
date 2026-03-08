package middleware

import (
	"os"

	"github.com/gofiber/fiber/v2"
)

// InternalAuthMiddleware ensures the request has the correct internal API secret.
func InternalAuthMiddleware(c *fiber.Ctx) error {
	secret := os.Getenv("INTERNAL_API_SECRET")
	// Fallback to a default only if not set (though highly recommended to set it in .env)
	if secret == "" {
		secret = "default_internal_secret_change_me"
	}

	requestSecret := c.Get("X-Internal-Secret")

	if requestSecret != secret {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Unauthorized: Invalid or missing internal secret",
		})
	}

	return c.Next()
}
