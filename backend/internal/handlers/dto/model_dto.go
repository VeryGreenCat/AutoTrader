package dto

type RegisterModelRequest struct {
	Name        string `json:"name" validate:"required"`
	Version     string `json:"version" validate:"required"`
	Currency    string `json:"currency" validate:"required"`
	Description string `json:"description"`
}
