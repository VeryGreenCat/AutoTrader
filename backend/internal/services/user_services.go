package services

// data flow ep8
// It use db to run a search when found it returns the data to the backward layer (handler).
// this is the business logic layer.
// ep9 is model.go : it defines the structure of the data to be returned.

// A Simple Summary Example:
//
// You (page.tsx):
// "Fetch profile for Kasidis!"
//
// Order Slip (profile.ts):
// GET /api/user/profile/kasidis
//
// Front Door (main.go):
// "Welcome! Go to the Routes."
//
// Map (user_route.go):
// "/profile? Go see the UserHandler."
//
// Waiter (user_handlers.go):
// "Service, please find 'Kasidis' in the DB."
//
// Searcher (user_services.go) (this file):
// "Hey Database, give me the row where name is 'Kasidis'."
//
// Container (model.go):
// (Puts the database row into a Go struct).
//
// Waiter (user_handlers.go):
// "Here is your data in JSON format!"
//
// You (page.tsx):
// "Awesome, I'll show it on the screen now!"

import (
	"github.com/VeryGreenCat/AutoTrader/backend/internal/config"
	"github.com/VeryGreenCat/AutoTrader/backend/internal/models"
)

func GetProfile(id string) (*models.User, error) {
	var user models.User
	if err := config.DB.Where("user_id = ?", id).First(&user).Error; err != nil {
		return nil, err
	}
	 
	return &user, nil
}

