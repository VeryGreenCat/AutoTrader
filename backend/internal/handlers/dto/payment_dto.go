package dto

type CreateCheckoutRequest struct {
	BillID    string `json:"bill_id"`
	Type      string `json:"type"`       // "billing" or "ticket"
	PackageID string `json:"package_id"` // "ticket_1" or "ticket_10"
}

type CheckoutResponse struct {
	URL string `json:"url"`
}
