package dto

type CreateCheckoutRequest struct {
	UserID string  `json:"user_id" validate:"required"`
	Amount float64 `json:"amount" validate:"required,gt=0"`
}

type CheckoutResponse struct {
	URL string `json:"url"`
}
