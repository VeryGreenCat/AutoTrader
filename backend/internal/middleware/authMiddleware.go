package middleware

import (
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

func AuthMiddleware(c *fiber.Ctx) error {
    // 1. Get the token from header (Bearer ...)
    tokenString := c.Get("Authorization")
    if tokenString == "" {
        return c.Status(401).SendString("Missing Token")
    }
    // Remove "Bearer " prefix
    tokenString = tokenString[7:]

    // 2. Parse and Verify Token (Use your Supabase JWT Secret)
    token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
        return []byte("YOUR_SUPABASE_JWT_SECRET"), nil
    })

    if err != nil || !token.Valid {
        return c.Status(401).SendString("Invalid Token")
    }

    // 3. (Advanced) Check for OTP/MFA
    // If you used the standard Supabase MFA (TOTP), the 'aal' claim will be 'aal2'.
    // If you used the Email OTP flow above, the user just has a valid session.
    
    claims := token.Claims.(jwt.MapClaims)
    userID := claims["sub"].(string)
    
    // Store user ID in context for next handlers
    c.Locals("user_id", userID)

    return c.Next()
}