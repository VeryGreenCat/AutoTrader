package routes

// data flow ep6
// It sees the more specific request /user ex. /user/profile/:user_id.
// the : in /user/profile/:user_id. is a placeholder/variable for the user_id.
// it is like the second inner shell of the api.
// We can assume it automatically match the req with /api/user in this file.
// [More accurately], This file registers routes under the /user prefix of the router it receives.
// ep7 is user_handler.go

import (
	"github.com/VeryGreenCat/AutoTrader/backend/internal/handlers"
	"github.com/gofiber/fiber/v2"
)

func UserRoute(router fiber.Router) {
	UserRoutes := router.Group("/user")

	UserRoutes.Get("/profile/:user_id", handlers.GetUserProfile)
}