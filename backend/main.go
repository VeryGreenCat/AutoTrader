package main

import (
	"log"

	"github.com/gofiber/fiber/v3"
)

func main() {
    app := fiber.New()

    // A simple GET route
    app.Get("/", func(c fiber.Ctx) error {
        return c.SendString("Hello from the Go Fiber Backend!")
    })

    // Start the server on port 8080
    log.Fatal(app.Listen(":8080"))
}