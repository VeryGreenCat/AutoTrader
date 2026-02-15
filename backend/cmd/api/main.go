package main

// data flow ep3, ep4 is database.go
// this file says "Go to the Directory to see where you need to go"

import (
	"log"

	"github.com/VeryGreenCat/AutoTrader/backend/internal/config"
	"github.com/VeryGreenCat/AutoTrader/backend/internal/routes"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system environment variables")
	}
	app := fiber.New()
	
	// sets up security rules 
	app.Use(cors.New(cors.Config{
		AllowOrigins:     "*", // Wildcard allowed when credentials are false
		AllowCredentials: false,
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization",
		AllowMethods:     "GET, POST, PUT, DELETE, OPTIONS",
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
