package websocket

import (
	"encoding/json"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow configured origins
	},
}

// WSMessage represents a real-time event envelope
type WSMessage struct {
	Type           string          `json:"type"` // "new_message", "typing", "read_receipt", "spark_received", "match_created", "coop_turn"
	ConversationID string          `json:"conversation_id,omitempty"`
	SenderID       string          `json:"sender_id,omitempty"`
	ReceiverID     string          `json:"receiver_id,omitempty"`
	Payload        json.RawMessage `json:"payload,omitempty"`
	Timestamp      time.Time       `json:"timestamp"`
}

// Client wraps an active WebSocket connection
type Client struct {
	Hub    *Hub
	Conn   *websocket.Conn
	UserID string
	Send   chan []byte
}

// Hub maintains active client connections and broadcasts messages
type Hub struct {
	clients    map[string]map[*Client]bool // userID -> set of clients
	broadcast  chan *WSMessage
	register   chan *Client
	unregister chan *Client
	mu         sync.RWMutex
}

// NewHub creates a new WebSocket Hub
func NewHub() *Hub {
	return &Hub{
		clients:    make(map[string]map[*Client]bool),
		broadcast:  make(chan *WSMessage, 256),
		register:   make(chan *Client),
		unregister: make(chan *Client),
	}
}

// Run starts the event loop for the Hub
func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			if _, ok := h.clients[client.UserID]; !ok {
				h.clients[client.UserID] = make(map[*Client]bool)
			}
			h.clients[client.UserID][client] = true
			h.mu.Unlock()
			log.Printf("[WS] User connected: %s (total sockets for user: %d)", client.UserID, len(h.clients[client.UserID]))

		case client := <-h.unregister:
			h.mu.Lock()
			if userClients, ok := h.clients[client.UserID]; ok {
				if _, ok := userClients[client]; ok {
					delete(userClients, client)
					close(client.Send)
					if len(userClients) == 0 {
						delete(h.clients, client.UserID)
					}
				}
			}
			h.mu.Unlock()
			log.Printf("[WS] User disconnected: %s", client.UserID)

		case msg := <-h.broadcast:
			h.mu.RLock()
			// If message has specific receiver, deliver to that receiver
			if msg.ReceiverID != "" {
				if userClients, ok := h.clients[msg.ReceiverID]; ok {
					data, err := json.Marshal(msg)
					if err == nil {
						for client := range userClients {
							select {
							case client.Send <- data:
							default:
								close(client.Send)
								delete(userClients, client)
							}
						}
					}
				}
			}
			h.mu.RUnlock()
		}
	}
}

// SendToUser dispatches an event to a specific user
func (h *Hub) SendToUser(userID string, msgType string, payload interface{}) {
	payloadBytes, _ := json.Marshal(payload)
	msg := &WSMessage{
		Type:       msgType,
		ReceiverID: userID,
		Payload:    payloadBytes,
		Timestamp:  time.Now(),
	}
	h.broadcast <- msg
}

// ReadPump listens for messages from this WebSocket client
func (c *Client) ReadPump() {
	defer func() {
		c.Hub.unregister <- c
		c.Conn.Close()
	}()

	c.Conn.SetReadLimit(512 * 1024)
	c.Conn.SetReadDeadline(time.Now().Add(60 * time.Second))
	c.Conn.SetPongHandler(func(string) error {
		c.Conn.SetReadDeadline(time.Now().Add(60 * time.Second))
		return nil
	})

	for {
		_, message, err := c.Conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("[WS] Read error: %v", err)
			}
			break
		}

		var wsMsg WSMessage
		if err := json.Unmarshal(message, &wsMsg); err == nil {
			wsMsg.SenderID = c.UserID
			wsMsg.Timestamp = time.Now()
			// Echo or broadcast based on event type
			if wsMsg.ReceiverID != "" {
				c.Hub.broadcast <- &wsMsg
			}
		}
	}
}

// WritePump writes messages to the WebSocket connection
func (c *Client) WritePump() {
	ticker := time.NewTicker(30 * time.Second)
	defer func() {
		ticker.Stop()
		c.Conn.Close()
	}()

	for {
		select {
		case message, ok := <-c.Send:
			c.Conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if !ok {
				c.Conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			w, err := c.Conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			w.Write(message)

			// Add queued messages to current frame
			n := len(c.Send)
			for i := 0; i < n; i++ {
				w.Write([]byte{'\n'})
				w.Write(<-c.Send)
			}

			if err := w.Close(); err != nil {
				return
			}

		case <-ticker.C:
			c.Conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if err := c.Conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

// ServeWS upgrades the HTTP connection to WebSocket and registers the client
func ServeWS(hub *Hub, w http.ResponseWriter, r *http.Request, userID string) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("[WS] Upgrade error: %v", err)
		return
	}

	client := &Client{
		Hub:    hub,
		Conn:   conn,
		UserID: userID,
		Send:   make(chan []byte, 256),
	}
	client.Hub.register <- client

	go client.WritePump()
	go client.ReadPump()
}
