package main

// data flow ep3, ep4 is database.go
// this file says "Go to the Directory to see where you need to go"

import (
	"log"

	"github.com/VeryGreenCat/AutoTrader/backend/internal/config"
	"github.com/VeryGreenCat/AutoTrader/backend/internal/middleware"
	"github.com/VeryGreenCat/AutoTrader/backend/internal/routes"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system environment variables")
	}

	middleware.InitJWKS() // ← add this

	app := fiber.New()
	
	// sets up security rules 
	app.Use(cors.New(cors.Config{
    AllowOrigins:     "https://autotrader-vd84.onrender.com", // add your prod URL later e.g. "https://yourapp.com"
    AllowCredentials: false,
    AllowHeaders:     "Origin, Content-Type, Accept, Authorization",
    AllowMethods:     "GET, POST, PUT, DELETE, PATCH, OPTIONS",
}))
	
	config.ConnectDB()

	app.Get("/", func(c *fiber.Ctx) error {
		return c.SendString("Hello, AI Dev Backend!")
	})

	app.Get("/api", func(c *fiber.Ctx) error {
		return c.SendString("This is /api")
	})

	routes.RegisterAllRoutes(app)

	app.Listen(":5000")	

}
