package handlers

// import (
// 	"github.com/VeryGreenCat/AutoTrader/backend/internal/models"
// 	"github.com/VeryGreenCat/AutoTrader/backend/internal/services"

// 	"github.com/gofiber/fiber/v2"
// 	"github.com/gofiber/websocket/v2"
// )

// type MT5Handler struct {
//     mt5Service *services.MT5Service
// }

// func NewMT5Handler(mt5Service *services.MT5Service) *MT5Handler {
//     return &MT5Handler{mt5Service: mt5Service}
// }

// // POST /api/mt5/push  — EA calls this every N seconds
// func (h *MT5Handler) PushData(c *fiber.Ctx) error {
//     var data models.MT5AccountData
//     if err := c.BodyParser(&data); err != nil {
//         return c.Status(400).JSON(fiber.Map{"error": "invalid payload"})
//     }
//     if data.Token == "" {
//         return c.Status(401).JSON(fiber.Map{"error": "missing token"})
//     }

//     // Optional: validate token against your existing user DB here
//     // user, err := h.userService.GetByMT5Token(data.Token)

//     h.mt5Service.UpdateAccount(&data)
//     return c.JSON(fiber.Map{"status": "ok"})
// }

// // GET /api/mt5/snapshot  — frontend one-time fetch
// // Requires JWT auth middleware — token comes from query param or header
// func (h *MT5Handler) GetSnapshot(c *fiber.Ctx) error {
//     mt5Token := c.Query("mt5_token") // user's mt5 token stored in your frontend session
//     if mt5Token == "" {
//         return c.Status(400).JSON(fiber.Map{"error": "mt5_token required"})
//     }

//     data, ok := h.mt5Service.GetAccount(mt5Token)
//     if !ok {
//         return c.Status(404).JSON(fiber.Map{"error": "no data — is the EA running?"})
//     }

//     response := fiber.Map{"data": data}
//     if h.mt5Service.IsStale(mt5Token) {
//         response["warning"] = "MT5 terminal may be offline"
//     }
//     return c.JSON(response)
// }

// // GET /api/mt5/ws?mt5_token=xxx  — live WebSocket stream to frontend
// func (h *MT5Handler) LiveStream(c *websocket.Conn) {
//     mt5Token := c.Query("mt5_token")
//     if mt5Token == "" {
//         c.Close()
//         return
//     }

//     h.mt5Service.Subscribe(mt5Token, c)
//     defer h.mt5Service.Unsubscribe(mt5Token, c)

//     // Send current snapshot immediately on connect
//     if data, ok := h.mt5Service.GetAccount(mt5Token); ok {
//         c.WriteJSON(data)
//     }

//     // Keep connection alive — reads are just for ping/pong
//     for {
//         if _, _, err := c.ReadMessage(); err != nil {
//             break // client disconnected
//         }
//     }
// }