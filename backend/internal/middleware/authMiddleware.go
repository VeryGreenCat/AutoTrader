package middleware

import (
	"log"
	"strings"

	"github.com/MicahParks/keyfunc/v3"
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

var jwks keyfunc.Keyfunc

func InitJWKS() {
    var err error
    jwks, err = keyfunc.NewDefault([]string{
        "https://csgyyrxddzsdrlrgvsjh.supabase.co/auth/v1/.well-known/jwks.json",
    })
    if err != nil {
        log.Fatal("failed to load JWKS:", err)
    }
    log.Println("JWKS loaded successfully")
}

func AuthMiddleware(c *fiber.Ctx) error {
    authHeader := c.Get("Authorization")
    if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
        return c.Status(401).JSON(fiber.Map{"error": "missing token"})
    }

    tokenStr := strings.TrimPrefix(authHeader, "Bearer ")

    token, err := jwt.Parse(tokenStr, jwks.Keyfunc)
    if err != nil || !token.Valid {
        log.Println("token invalid:", err)
        return c.Status(401).JSON(fiber.Map{"error": "invalid token"})
    }

    claims := token.Claims.(jwt.MapClaims)
    c.Locals("user_id", claims["sub"])
    return c.Next()
}