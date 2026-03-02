package routes

// data flow ep5
// It sees the request is for /api and points to the routes that declare the endpoints with /api prefix.
// it is like the first outer shell of the api.
// ep6 is user_route.go

import (
	"github.com/VeryGreenCat/AutoTrader/backend/internal/middleware"
	"github.com/gofiber/fiber/v2"
)

func RegisterAllRoutes(app *fiber.App) {
    // Public routes (no AuthMiddleware)
    apiPublic := app.Group("/api")
    WebhookRoute(apiPublic)
    MetatraderRoutes(apiPublic)

    // Private routes (with AuthMiddleware)
    apiPrivate := app.Group("/api", middleware.AuthMiddleware)
    UserRoute(apiPrivate)
    MT5Routes(apiPrivate)
    ModelRoutes(apiPrivate)
    BotRoutes(apiPrivate)
    PaymentRoutes(apiPrivate)
    BillingRoutes(apiPrivate)
    TransactionRoute(apiPrivate)
}