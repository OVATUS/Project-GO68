// order-service/main.go
package main

import (
	"fmt"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v4"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

type Order struct {
	ID        uint        `gorm:"primaryKey" json:"id"`
	UserID    uint        `json:"user_id"`
	Status    string      `gorm:"default:pending" json:"status"`
	CreatedAt time.Time   `json:"created_at"`
	Items     []OrderItem `json:"items" gorm:"foreignKey:OrderID"`
}

type OrderItem struct {
	ID       uint  `gorm:"primaryKey" json:"id"`
	OrderID  uint  `json:"order_id"`
	MenuID   uint  `json:"menu_id"`
	Quantity int   `json:"quantity"`
}

type Menu struct {
	ID    uint    `gorm:"primaryKey" json:"id"`
	Name  string  `json:"name"`
	Price float64 `json:"price"`
}

var db *gorm.DB
var jwtSecret []byte

func main() {
	loadEnv()
	initDB()
	r := gin.Default()

	r.POST("/create", authMemberMiddleware, createOrder)
	r.GET("/my", authMemberMiddleware, myOrders)
	r.DELETE("/cancel/:id", authMemberMiddleware, cancelOrder)

	r.GET("/admin", authAdminMiddleware, allOrders)
	r.PUT("/admin/update-status/:id", authAdminMiddleware, updateStatus)

	r.GET("/ping", func(c *gin.Context){ c.JSON(http.StatusOK, gin.H{"message":"order ok"}) })

	port := os.Getenv("SERVICE_PORT"); if port=="" { port="8080" }
	r.Run(":" + port)
}

func loadEnv() {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" { secret = "MyVerySecretKeyChangeThis" }
	jwtSecret = []byte(secret)
}

func initDB() {
	user := os.Getenv("DB_USER")
	pass := os.Getenv("DB_PASSWORD")
	host := os.Getenv("DB_HOST")
	name := os.Getenv("DB_NAME")
	dsn := fmt.Sprintf("%s:%s@tcp(%s:3306)/%s?charset=utf8mb4&parseTime=True&loc=Local", user, pass, host, name)
	var err error
	db, err = gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		panic("failed db connect: " + err.Error())
	}
	if err := db.AutoMigrate(&Order{}, &OrderItem{}, &Menu{}); err != nil {
		panic("migrate failed: " + err.Error())
	}
}

// --- Payloads ---
type itemPayload struct {
	MenuID   uint `json:"menu_id"`
	Quantity int  `json:"quantity"`
}

type createOrderPayload struct {
	Items []itemPayload `json:"items"`
}

func createOrder(c *gin.Context) {
	uid, _ := c.Get("user_id")
	userID := uint(uid.(float64)) // jwt returns float64

	var p createOrderPayload
	if err := c.ShouldBindJSON(&p); err != nil || len(p.Items) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"status":"error","message":"invalid payload"})
		return
	}
	// validate menu ids
	for _, it := range p.Items {
		var m Menu
		if err := db.First(&m, it.MenuID).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"status":"error","message":fmt.Sprintf("menu id %d not found", it.MenuID)})
			return
		}
	}
	order := Order{UserID: userID, Status: "pending"}
	if err := db.Create(&order).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status":"error","message":err.Error()})
		return
	}
	// create items
	for _, it := range p.Items {
		oi := OrderItem{OrderID: order.ID, MenuID: it.MenuID, Quantity: it.Quantity}
		db.Create(&oi)
	}
	c.JSON(http.StatusCreated, gin.H{"status":"success","message":"Order created","order_id": order.ID})
}

func myOrders(c *gin.Context) {
	uid, _ := c.Get("user_id")
	userID := uint(uid.(float64))
	var orders []Order
	if err := db.Preload("Items").Where("user_id = ?", userID).Find(&orders).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status":"error","message":err.Error()})
		return
	}
	c.JSON(http.StatusOK, orders)
}

func cancelOrder(c *gin.Context) {
	uid, _ := c.Get("user_id")
	userID := uint(uid.(float64))
	idStr := c.Param("id")
	id, _ := strconv.Atoi(idStr)
	var order Order
	if err := db.First(&order, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"status":"error","message":"order not found"})
		return
	}
	if order.UserID != userID {
		c.JSON(http.StatusForbidden, gin.H{"status":"error","message":"not owner"})
		return
	}
	if order.Status != "pending" {
		c.JSON(http.StatusBadRequest, gin.H{"status":"error","message":"cannot cancel at this stage"})
		return
	}
	order.Status = "cancelled"
	db.Save(&order)
	c.JSON(http.StatusOK, gin.H{"status":"success","message":"Order cancelled"})
}

// admin endpoints
func allOrders(c *gin.Context) {
	var orders []Order
	if err := db.Preload("Items").Find(&orders).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status":"error","message":err.Error()})
		return
	}
	c.JSON(http.StatusOK, orders)
}

type statusPayload struct {
	Status string `json:"status"`
}

func updateStatus(c *gin.Context) {
	idStr := c.Param("id"); id, _ := strconv.Atoi(idStr)
	var p statusPayload
	if err := c.ShouldBindJSON(&p); err != nil || p.Status == "" {
		c.JSON(http.StatusBadRequest, gin.H{"status":"error","message":"invalid payload"})
		return
	}
	var order Order
	if err := db.First(&order, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"status":"error","message":"order not found"})
		return
	}
	order.Status = p.Status
	db.Save(&order)
	c.JSON(http.StatusOK, gin.H{"status":"success","message":"Order status updated"})
}

// === JWT middlewares (member & admin) ===

func authMemberMiddleware(c *gin.Context) {
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"status":"error","message":"missing token"})
		return
	}
	tokenStr := authHeader[len("Bearer "):]
	token, err := jwt.Parse(tokenStr, func(t *jwt.Token)(interface{}, error){
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected method")
		}
		return jwtSecret, nil
	})
	if err != nil || !token.Valid {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"status":"error","message":"invalid token"})
		return
	}
	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"status":"error","message":"invalid claims"})
		return
	}
	_, roleOk := claims["role"].(string)
	if !roleOk {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"status":"error","message":"invalid role"})
		return
	}
	c.Set("user_id", claims["user_id"])
	c.Next()
}

func authAdminMiddleware(c *gin.Context) {
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"status":"error","message":"missing token"})
		return
	}
	tokenStr := authHeader[len("Bearer "):]
	token, err := jwt.Parse(tokenStr, func(t *jwt.Token)(interface{}, error){
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected method")
		}
		return jwtSecret, nil
	})
	if err != nil || !token.Valid {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"status":"error","message":"invalid token"})
		return
	}
	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"status":"error","message":"invalid claims"})
		return
	}
	role, _ := claims["role"].(string)
	if role != "admin" {
		c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"status":"error","message":"admin only"})
		return
	}
	c.Set("user_id", claims["user_id"])
	c.Next()
}
