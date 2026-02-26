package dto

type CreateCheckoutRequest struct {
	BillID string `json:"bill_id"`
}

type CheckoutResponse struct {
	URL string `json:"url"`
}
