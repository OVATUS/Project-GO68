// auth-service/main.go
package main

import (
	"fmt"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v4"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

type User struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	Username     string    `gorm:"unique;not null" json:"username"`
	PasswordHash string    `json:"-"`
	Role         string    `gorm:"default:member" json:"role"`
	CreatedAt    time.Time `json:"created_at"`
}

var db *gorm.DB
var jwtSecret []byte

func main() {
	loadEnv()
	initDB()
	r := gin.Default()

	r.POST("/register", registerHandler)
	r.POST("/login", loginHandler)
	r.GET("/ping", func(c *gin.Context) { c.JSON(http.StatusOK, gin.H{"message": "auth ok"}) })

	port := os.Getenv("SERVICE_PORT")
	if port == "" {
		port = "8080"
	}
	r.Run(":" + port)
}

func loadEnv() {
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "MyVerySecretKeyChangeThis"
	}
	jwtSecret = []byte(secret)
}

func initDB() {
	user := os.Getenv("DB_USER")
	pass := os.Getenv("DB_PASSWORD")
	host := os.Getenv("DB_HOST")
	name := os.Getenv("DB_NAME")
	if user == "" {
		user = "root"
	}
	dsn := fmt.Sprintf("%s:%s@tcp(%s:3306)/%s?charset=utf8mb4&parseTime=True&loc=Local", user, pass, host, name)
	var err error
	db, err = gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		panic("failed to connect db: " + err.Error())
	}
	if err := db.AutoMigrate(&User{}); err != nil {
		panic("auto migrate failed: " + err.Error())
	}
}

// ----- Helpers -----
func sanitizeRole(in string) string {
	switch in {
	case "admin", "member":
		return in
	default:
		return "member"
	}
}

// ----- Handlers -----
type registerPayload struct {
	Username string `json:"username"`
	Password string `json:"password"`
	Role     string `json:"role"` // "member" | "admin"
}

func registerHandler(c *gin.Context) {
	var p registerPayload
	if err := c.ShouldBindJSON(&p); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "invalid payload"})
		return
	}
	if p.Username == "" || p.Password == "" {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "username/password required"})
		return
	}
	var exist User
	if err := db.Where("username = ?", p.Username).First(&exist).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"status": "error", "message": "username already exists"})
		return
	}

	pwHash, _ := bcrypt.GenerateFromPassword([]byte(p.Password), bcrypt.DefaultCost)
	role := sanitizeRole(p.Role)

	user := User{Username: p.Username, PasswordHash: string(pwHash), Role: role}
	if err := db.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{
		"status":  "success",
		"message": "Registration successful",
		"user": gin.H{
			"id":       user.ID,
			"username": user.Username,
			"role":     user.Role,
		},
	})
}

type loginPayload struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

func loginHandler(c *gin.Context) {
	var p loginPayload
	if err := c.ShouldBindJSON(&p); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "invalid payload"})
		return
	}
	var user User
	if err := db.Where("username = ?", p.Username).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "error", "message": "invalid credentials"})
		return
	}
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(p.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"status": "error", "message": "invalid credentials"})
		return
	}

	claims := jwt.MapClaims{
		"user_id": user.ID,
		"role":    user.Role,
		"exp":     time.Now().Add(24 * time.Hour).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	ss, err := token.SignedString(jwtSecret)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": "token error"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"token": ss, "role": user.Role})
}
