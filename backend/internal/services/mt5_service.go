package services

// import (
// 	"sync"
// 	"time"

// 	"github.com/VeryGreenCat/AutoTrader/backend/internal/models"
// 	"github.com/gofiber/websocket/v2"
// )

// type MT5Service struct {
//     mu          sync.RWMutex
//     accounts    map[string]*models.MT5AccountData // token -> data
//     subscribers map[string][]*websocket.Conn      // token -> ws connections
//     subMu       sync.RWMutex
// }

// func NewMT5Service() *MT5Service {
//     return &MT5Service{
//         accounts:    make(map[string]*models.MT5AccountData),
//         subscribers: make(map[string][]*websocket.Conn),
//     }
// }

// // Called when EA pushes data
// func (s *MT5Service) UpdateAccount(data *models.MT5AccountData) {
//     data.UpdatedAt = time.Now()

//     s.mu.Lock()
//     s.accounts[data.Token] = data
//     s.mu.Unlock()

//     // Broadcast to any connected frontend WebSocket clients
//     s.broadcast(data.Token, data)
// }

// // Called when frontend requests current snapshot
// func (s *MT5Service) GetAccount(token string) (*models.MT5AccountData, bool) {
//     s.mu.RLock()
//     defer s.mu.RUnlock()
//     data, ok := s.accounts[token]
//     return data, ok
// }

// func (s *MT5Service) IsStale(token string) bool {
//     s.mu.RLock()
//     defer s.mu.RUnlock()
//     data, ok := s.accounts[token]
//     if !ok {
//         return true
//     }
//     return time.Since(data.UpdatedAt) > 15*time.Second
// }

// // Register a WebSocket connection for live updates
// func (s *MT5Service) Subscribe(token string, conn *websocket.Conn) {
//     s.subMu.Lock()
//     s.subscribers[token] = append(s.subscribers[token], conn)
//     s.subMu.Unlock()
// }

// // Remove a WebSocket connection on disconnect
// func (s *MT5Service) Unsubscribe(token string, conn *websocket.Conn) {
//     s.subMu.Lock()
//     defer s.subMu.Unlock()
//     conns := s.subscribers[token]
//     for i, c := range conns {
//         if c == conn {
//             s.subscribers[token] = append(conns[:i], conns[i+1:]...)
//             break
//         }
//     }
// }

// func (s *MT5Service) broadcast(token string, data *models.MT5AccountData) {
//     s.subMu.RLock()
//     conns := s.subscribers[token]
//     s.subMu.RUnlock()

//     for _, conn := range conns {
//         conn.WriteJSON(data) // fire and forget
//     }
// }