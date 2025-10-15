// menu-service/main.go
package main

import (
	"fmt"
	"net/http"
	"os"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v4"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

type Menu struct {
	ID          uint    `gorm:"primaryKey" json:"id"`
	Name        string  `gorm:"not null" json:"name"`
	Description string  `json:"description"`
	Price       float64 `json:"price"`
}

var db *gorm.DB
var jwtSecret []byte

func main() {
	loadEnv()
	initDB()
	r := gin.Default()

	r.GET("/", getAllMenu)
	r.POST("/add", authAdminMiddleware, addMenu)
	r.PUT("/edit/:id", authAdminMiddleware, editMenu)
	r.DELETE("/delete/:id", authAdminMiddleware, deleteMenu)
	r.GET("/ping", func(c *gin.Context){ c.JSON(http.StatusOK, gin.H{"message":"menu ok"}) })

	port := os.Getenv("SERVICE_PORT")
	if port == "" { port = "8080" }
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
	dsn := fmt.Sprintf("%s:%s@tcp(%s:3306)/%s?charset=utf8mb4&parseTime=True&loc=Local", user, pass, host, name)
	var err error
	db, err = gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		panic("failed db connect: " + err.Error())
	}
	if err := db.AutoMigrate(&Menu{}); err != nil {
		panic("migrate menu failed: " + err.Error())
	}
}

func getAllMenu(c *gin.Context) {
	var menus []Menu
	if err := db.Find(&menus).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status":"error","message":err.Error()})
		return
	}
	c.JSON(http.StatusOK, menus)
}

type menuPayload struct {
	Name        string  `json:"name"`
	Description string  `json:"description"`
	Price       float64 `json:"price"`
}

func addMenu(c *gin.Context) {
	var p menuPayload
	if err := c.ShouldBindJSON(&p); err != nil || p.Name == "" || p.Price <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"status":"error","message":"invalid payload"})
		return
	}
	menu := Menu{Name: p.Name, Description: p.Description, Price: p.Price}
	if err := db.Create(&menu).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status":"error","message":err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"status":"success","message":"Menu item added","menu": menu})
}

func editMenu(c *gin.Context) {
	idStr := c.Param("id")
	id, _ := strconv.Atoi(idStr)
	var p menuPayload
	if err := c.ShouldBindJSON(&p); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"status":"error","message":"invalid payload"})
		return
	}
	var menu Menu
	if err := db.First(&menu, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"status":"error","message":"menu not found"})
		return
	}
	menu.Name = p.Name
	menu.Description = p.Description
	menu.Price = p.Price
	db.Save(&menu)
	c.JSON(http.StatusOK, gin.H{"status":"success","message":"Menu item updated","menu":menu})
}

func deleteMenu(c *gin.Context) {
	idStr := c.Param("id")
	id, _ := strconv.Atoi(idStr)
	if err := db.Delete(&Menu{}, id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"status":"error","message":err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"status":"success","message":"Menu item deleted"})
}

// === middleware for admin ===
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
